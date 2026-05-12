from rest_framework.routers import DefaultRouter
from .views import HospitalViewSet, HospitalSpecialtyViewSet, HospitalDepartmentViewSet

router = DefaultRouter()
router.register(r'hospitals', HospitalViewSet, basename='hospitals')
router.register(r'hospital-specialties', HospitalSpecialtyViewSet, basename='hospital-specialties')
router.register(r'hospital-departments', HospitalDepartmentViewSet, basename='hospital-departments')

urlpatterns = router.urls