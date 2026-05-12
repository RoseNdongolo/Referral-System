from rest_framework import serializers
from .models import Referral, ReferralAttachment


class ReferralAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralAttachment
        fields = '__all__'


class ReferralSerializer(serializers.ModelSerializer):
    class Meta:
        model = Referral
        fields = '__all__'