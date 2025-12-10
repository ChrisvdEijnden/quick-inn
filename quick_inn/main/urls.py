
from django.contrib import admin
from django.urls import path, include
from main import views

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.login_page, name='login'),
    path('support/', views.support, name='support'),
    path('profile/', views.profile, name='profile'),
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path('api/auth/status/', views.auth_status, name='auth_status'),
]