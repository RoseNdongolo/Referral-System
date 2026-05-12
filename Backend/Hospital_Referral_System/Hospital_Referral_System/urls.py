from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/accounts/", include("accounts.urls")),
    path("api/", include("dashboards.urls")),
    path("api/", include("patients.urls")),
    path("api/", include("doctors.urls")),
    path("api/", include("hospitals.urls")),
    path("api/", include("referrals.urls")),
]