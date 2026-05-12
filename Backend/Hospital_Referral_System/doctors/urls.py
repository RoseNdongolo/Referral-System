from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import DoctorProfileViewSet

router = DefaultRouter()
router.register(r'doctors', DoctorProfileViewSet, basename='doctors')

urlpatterns = router.urls