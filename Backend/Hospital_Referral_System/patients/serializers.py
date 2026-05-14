from rest_framework import serializers
from .models import PatientProfile

class PatientProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', required=False)
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)
    phone_number = serializers.CharField(source='user.phone_number', required=False, allow_blank=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = PatientProfile
        fields = [
            'id', 'user', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'medical_record_number', 'national_id', 'date_of_birth',
            'gender', 'address', 'phone_number'
        ]
        read_only_fields = ['user', 'medical_record_number']

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()