from rest_framework.routers import DefaultRouter
from .views import ReferralViewSet, ReferralAttachmentViewSet

router = DefaultRouter()
router.register(r'referrals', ReferralViewSet, basename='referral')
router.register(r'attachments', ReferralAttachmentViewSet, basename='attachment')

urlpatterns = router.urls