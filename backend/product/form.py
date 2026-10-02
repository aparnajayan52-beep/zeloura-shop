from django import forms
from . import models


class CreateProduct(forms.ModelForm):
    class Meta:
        model = models.Product
        fields = ["title", "slug", "text", "price", "stock", "image"]
