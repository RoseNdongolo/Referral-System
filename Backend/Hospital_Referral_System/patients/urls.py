from rest_framework.routers import DefaultRouter
from .views import PatientProfileViewSet

router = DefaultRouter()
router.register(r'patients', PatientProfileViewSet, basename='patients')

urlpatterns = router.urls