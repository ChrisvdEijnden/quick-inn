from django.urls import path, include
from django.contrib import admin
from . import views
from django.conf import settings
from django.contrib.auth.views import LogoutView
from django.conf.urls.static import static

urlpatterns = [
    path('', views.home, name='home'),
    path('admin/', admin.site.urls),
    path('tickets/', views.tickets, name='tickets'),
    path('tickets/delete/', views.delete_ticket, name='delete_ticket'),
    path('support/', views.support, name='support'),
    path('login/', views.login_view, name='login'),
    path('logout/', LogoutView.as_view(next_page='home'), name='logout'),
    path('profile/', views.profile_view, name='profile'),    
    path('signup/', views.signup_view, name='signup'),
    path('social-auth/', include('social_django.urls', namespace='social')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])