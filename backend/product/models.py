from django.db import models
from django.contrib.auth.models import User


class Product(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=255)
    text = models.TextField()
    # NEW: an e-commerce product needs a price and stock count
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock = models.PositiveIntegerField(default=10)
    date = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='products/')
    author = models.ForeignKey(User, on_delete=models.CASCADE, default=None)

    def __str__(self):
        return self.title

    def snippet(self):
        # FIX: only add "..." when the text was actually cut, and show a useful length
        if len(self.text) <= 80:
            return self.text
        return self.text[:80] + '...'


class Order(models.Model):
    """One checkout by one user."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created']

    def __str__(self):
        return f"Order #{self.pk} by {self.user.username}"


class OrderItem(models.Model):
    """A line in an order. Title/price are copied so old orders stay correct
    even if the product is edited or deleted later."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    def line_total(self):
        return self.price * self.quantity

    def __str__(self):
        return f"{self.quantity} x {self.title}"
