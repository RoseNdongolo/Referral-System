from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/accounts/", include("accounts.urls")),
    path("api/patients/", include("patients.urls")),
    path("api/referrals/", include("referrals.urls")),
    path("api/hospitals/", include("hospitals.urls")),
    path("api/medical-directors/", include("medical_directors.urls")),
    path("api/specialists/", include("specialists.urls")),
    path("api/doctors/", include("doctors.urls")),
    path("api/receptionists/", include("receptionists.urls")),   # <-- ADD THIS LINE
    path("api/", include("dashboards.urls")),
]