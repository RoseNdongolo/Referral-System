from rest_framework.routers import DefaultRouter
from .views import ReceptionistViewSet

router = DefaultRouter()
router.register(r'', ReceptionistViewSet, basename='receptionist')

urlpatterns = router.urls