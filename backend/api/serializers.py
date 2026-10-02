from decimal import Decimal

from django.contrib.auth.models import User
from django.db import transaction
from django.utils.text import slugify
from rest_framework import serializers

from product.models import Product, Order, OrderItem


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def validate_password(self, value):
        # reuse Django's own password rules (same ones the admin/signup form use)
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value

    def create(self, validated_data):
        # create_user hashes the password; never store raw passwords
        return User.objects.create_user(**validated_data)


class ProductSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    author_id = serializers.IntegerField(read_only=True)
    slug = serializers.SlugField(required=False)   # auto-generated from the title if not sent

    class Meta:
        model = Product
        fields = ['id', 'slug', 'title', 'text', 'price', 'stock',
                  'image', 'date', 'author', 'author_id']
        read_only_fields = ['id', 'date']

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value

    def _unique_slug(self, title):
        base = slugify(title) or 'product'
        slug, n = base, 2
        while Product.objects.filter(slug=slug).exists():
            slug = f"{base}-{n}"
            n += 1
        return slug

    def create(self, validated_data):
        if not validated_data.get('slug'):
            validated_data['slug'] = self._unique_slug(validated_data['title'])
        return super().create(validated_data)


class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'title', 'price', 'quantity', 'line_total']


class OrderItemInputSerializer(serializers.Serializer):
    product = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=100)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    # what the React cart sends: [{"product": 4, "quantity": 2}, ...]
    cart = OrderItemInputSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = ['id', 'full_name', 'phone', 'address', 'status',
                  'total', 'created', 'items', 'cart']
        read_only_fields = ['id', 'status', 'total', 'created']

    def validate_cart(self, value):
        if not value:
            raise serializers.ValidationError("Your cart is empty.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        cart = validated_data.pop('cart')
        order = Order.objects.create(user=self.context['request'].user, **validated_data)
        total = Decimal('0')
        for line in cart:
            # lock the product row so two people can't buy the last item at once
            try:
                product = Product.objects.select_for_update().get(pk=line['product'])
            except Product.DoesNotExist:
                raise serializers.ValidationError({'cart': f"Product {line['product']} no longer exists."})
            if line['quantity'] > product.stock:
                raise serializers.ValidationError(
                    {'cart': f"Only {product.stock} of '{product.title}' left in stock."})
            product.stock -= line['quantity']
            product.save(update_fields=['stock'])
            # the PRICE comes from the database, never from the browser
            OrderItem.objects.create(order=order, product=product, title=product.title,
                                     price=product.price, quantity=line['quantity'])
            total += product.price * line['quantity']
        order.total = total
        order.save(update_fields=['total'])
        return order
