from rest_framework.routers import DefaultRouter
from .views import MedicalDirectorViewSet

router = DefaultRouter()
router.register(r'', MedicalDirectorViewSet, basename='medical-director')

urlpatterns = router.urls