from django.shortcuts import render

def home(request):
    return render(request, 'main/home.html')

def support(request):
    return render(request, 'main/support.html')

def login_page(request):
    return render(request, 'main/login.html')

def profile(request):
    return render(request, 'main/profile.html')

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET"])
def auth_status(request):
    """Return whether the user is authenticated"""
    return JsonResponse({
        'is_authenticated': request.user.is_authenticated,
        'username': request.user.username if request.user.is_authenticated else None
    })