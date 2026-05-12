from rest_framework.routers import DefaultRouter
from .views import ReferralViewSet, ReferralAttachmentViewSet

router = DefaultRouter()
router.register(r'referrals', ReferralViewSet, basename='referrals')
router.register(r'referral-attachments', ReferralAttachmentViewSet, basename='referral-attachments')

urlpatterns = router.urls