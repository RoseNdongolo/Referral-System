# accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, LoginView, ForgotPasswordView, ResetPasswordView, ProfileViewSet

router = DefaultRouter()
router.register(r'profile', ProfileViewSet, basename='profile')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('password-reset/', ForgotPasswordView.as_view(), name='password_reset'),
    path('password-reset-confirm/', ResetPasswordView.as_view(), name='password_reset_confirm'),
    path('', include(router.urls)),
]