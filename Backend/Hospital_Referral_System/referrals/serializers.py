# referrals/serializers.py
from rest_framework import serializers
from .models import Referral, ReferralAttachment
from hospitals.serializers import HospitalSerializer

class ReferralAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralAttachment
        fields = ['id', 'referral', 'file', 'description', 'uploaded_at']
        read_only_fields = ['uploaded_at']

class ReferralSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    hospital_details = HospitalSerializer(source='hospital', read_only=True)
    patient_mrn = serializers.SerializerMethodField()
    additional_notes = serializers.CharField(source='clinical_notes', read_only=True)

    class Meta:
        model = Referral
        fields = '__all__'
        read_only_fields = ['created_at', 'distance_km', 'estimated_travel_time_minutes', 'route_info', 'traffic_info']

    def get_patient_mrn(self, obj):
        try:
            return obj.patient.patient_profile.medical_record_number
        except:
            return None