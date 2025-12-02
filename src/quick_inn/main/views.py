from django.shortcuts import render

def home(request):
    return render(request, 'main/home.html')

def support(request):
    return render(request, 'main/support.html')

def login(request):
    return render(request, 'main/login.html')
