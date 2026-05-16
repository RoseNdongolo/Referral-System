from rest_framework.routers import DefaultRouter
from .views import HospitalViewSet, HospitalDepartmentViewSet, SpecialtyViewSet

router = DefaultRouter()
router.register(r'hospitals', HospitalViewSet)
router.register(r'specialties', SpecialtyViewSet)
router.register(r'departments', HospitalDepartmentViewSet)

urlpatterns = router.urls