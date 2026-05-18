# Hospital_Referral_System/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import AdminUserViewSet
from hospitals.views import AdminHospitalViewSet, AdminSpecialtyViewSet

router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet, basename='admin-user')
router.register(r'admin/hospitals', AdminHospitalViewSet, basename='admin-hospital')
router.register(r'admin/specialties', AdminSpecialtyViewSet, basename='admin-specialty')

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
    path("api/receptionists/", include("receptionists.urls")),
    path("api/", include("dashboards.urls")),
    path("api/", include(router.urls)),
]