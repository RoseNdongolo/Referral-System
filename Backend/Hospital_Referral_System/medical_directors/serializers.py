from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import MedicalDirectorProfile

User = get_user_model()

class MedicalDirectorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalDirectorProfile
        fields = '__all__'
        read_only_fields = ['user']

class MedicalDirectorSelfSerializer(serializers.Serializer):
    """Combined user + profile for /me/ endpoint"""
    id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    phone_number = serializers.CharField(source='user.phone_number', required=False, allow_blank=True)
    role = serializers.CharField(source='user.role', read_only=True)
    full_name = serializers.SerializerMethodField()
    # Profile fields
    staff_code = serializers.CharField(source='medical_director_profile.staff_code')
    department = serializers.CharField(source='medical_director_profile.department', required=False, allow_blank=True)
    office_number = serializers.CharField(source='medical_director_profile.office_number', required=False, allow_blank=True)
    is_active = serializers.BooleanField(source='medical_director_profile.is_active')

    def get_full_name(self, obj):
        user = obj.get('user')
        return f"{user.first_name} {user.last_name}".strip() if user else ""