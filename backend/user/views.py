from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.utils.http import url_has_allowed_host_and_scheme


def signup_views(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)          # NEW: log the new user in straight away
            return redirect('product:list')
    else:
        form = UserCreationForm()
    return render(request, 'users/signup.html', {'form': form})


def login_views(request):
    if request.method == "POST":
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            login(request, form.get_user())
            next_url = request.POST.get('next')
            # FIX: never redirect to an outside website (open-redirect security hole)
            if next_url and url_has_allowed_host_and_scheme(next_url, allowed_hosts={request.get_host()}):
                return redirect(next_url)
            return redirect('product:list')
    else:
        form = AuthenticationForm()
    return render(request, 'users/login.html', {'form': form})


def logout_views(request):
    logout(request)
    return redirect('user:login')
