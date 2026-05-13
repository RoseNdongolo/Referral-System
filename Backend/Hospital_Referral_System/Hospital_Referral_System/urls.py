from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/accounts/", include("accounts.urls")),

    # Add explicit prefixes for each app
    path("api/patients/", include("patients.urls")),      # ✅ /api/patients/patient-profiles/
    path("api/referrals/", include("referrals.urls")),    # ✅ /api/referrals/
    path("api/doctors/", include("doctors.urls")),
    path("api/hospitals/", include("hospitals.urls")),
    path("api/specialists/", include("specialists.urls")),
    path("api/", include("dashboards.urls")),             # keep fallback if needed
]