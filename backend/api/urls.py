from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('products', views.ProductViewSet, basename='api-product')
router.register('orders', views.OrderViewSet, basename='api-order')

urlpatterns = [
    path('auth/register/', views.register),
    path('auth/login/', views.login),
    path('auth/logout/', views.logout),
    path('auth/me/', views.me),
    path('', include(router.urls)),
]
