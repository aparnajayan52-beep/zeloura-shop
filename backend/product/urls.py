
from django.urls import path
from . import views

app_name = "product"
urlpatterns = [
    path("",views.product_list,name="list"),
    path("create/",views.product_create,name="create"),
    path("<slug:slug>/",views.product_detail,name="detail"),
]
