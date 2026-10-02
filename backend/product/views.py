from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Product
from .form import CreateProduct


def product_list(request):
    products = Product.objects.all().order_by("-date")
    return render(request, 'products/product_list.html', {'products': products})


def product_detail(request, slug):
    # FIX: .get() crashed with a 500 error for unknown slugs; this gives a proper 404
    product = get_object_or_404(Product, slug=slug)
    return render(request, 'products/product_detail.html', {'product': product})


@login_required(login_url='/user/login/')
def product_create(request):
    if request.method == 'POST':
        form = CreateProduct(request.POST, request.FILES)
        if form.is_valid():
            # FIX: the old code called save() on the module `form`, not on the form object
            instance = form.save(commit=False)
            instance.author = request.user
            instance.save()
            return redirect("product:list")
    else:
        form = CreateProduct()
    return render(request, 'products/product_create.html', {'forms': form})
