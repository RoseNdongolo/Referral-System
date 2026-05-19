# doctors/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DoctorProfileViewSet, DoctorConsultationDetailView, DoctorConsultationStatusUpdateView

router = DefaultRouter()
router.register(r'', DoctorProfileViewSet, basename='doctor')

urlpatterns = [
    path('', include(router.urls)),
    path('consultations/<int:pk>/', DoctorConsultationDetailView.as_view(), name='doctor-consultation-detail'),
    path('consultations/<int:pk>/update_status/', DoctorConsultationStatusUpdateView.as_view(), name='doctor-consultation-status-update'),
]