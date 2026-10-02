from django.contrib.auth import authenticate
from rest_framework import viewsets, status, permissions, filters
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response

from product.models import Product, Order
from .permissions import IsAuthorOrReadOnly
from .serializers import (ProductSerializer, OrderSerializer,
                          RegisterSerializer, UserSerializer)


def _auth_response(user, http_status=status.HTTP_200_OK):
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'user': UserSerializer(user).data}, status=http_status)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return _auth_response(user, status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    user = authenticate(username=request.data.get('username'),
                        password=request.data.get('password'))
    if user is None:
        return Response({'detail': 'Invalid username or password.'},
                        status=status.HTTP_400_BAD_REQUEST)
    return _auth_response(user)


@api_view(['POST'])
def logout(request):
    Token.objects.filter(user=request.user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def me(request):
    return Response(UserSerializer(request.user).data)


class ProductViewSet(viewsets.ModelViewSet):
    """
    GET    /api/products/          list   (?search=serum)
    POST   /api/products/          create (login needed, multipart form with image)
    GET    /api/products/<slug>/   detail
    PATCH  /api/products/<slug>/   edit   (only the author)
    DELETE /api/products/<slug>/   delete (only the author)
    """
    queryset = Product.objects.all().order_by('-date')
    serializer_class = ProductSerializer
    lookup_field = 'slug'
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'text']

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class OrderViewSet(viewsets.ModelViewSet):
    """Logged-in users can place orders and see ONLY their own orders."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']   # no edit/delete from the browser

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')
