# doctors/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import DoctorProfile

User = get_user_model()

class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = '__all__'
        read_only_fields = ['user']

class DoctorSelfSerializer(serializers.Serializer):
    id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    phone_number = serializers.CharField(source='user.phone_number', required=False, allow_blank=True)
    role = serializers.CharField(source='user.role', read_only=True)
    full_name = serializers.SerializerMethodField()
    specialization = serializers.CharField(source='doctor_profile.specialization')
    license_number = serializers.CharField(source='doctor_profile.license_number')
    department = serializers.CharField(source='doctor_profile.department', required=False, allow_blank=True)
    years_of_experience = serializers.IntegerField(source='doctor_profile.years_of_experience')
    is_available = serializers.BooleanField(source='doctor_profile.is_available')

    def get_full_name(self, obj):
        # obj is a dict with keys 'user' and 'doctor_profile'
        user = obj.get('user')
        if user:
            return f"{user.first_name} {user.last_name}".strip()
        return ""