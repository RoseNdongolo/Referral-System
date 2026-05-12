from django.urls import path
from .views import RegisterView, LoginView, ForgotPasswordView, ResetPasswordView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("password-reset/", ForgotPasswordView.as_view(), name="password_reset"),
    path("password-reset-confirm/", ResetPasswordView.as_view(), name="password_reset_confirm"),
]