from rest_framework import serializers
from .models import PatientProfile


class PatientProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = PatientProfile
        fields = [
            'id', 'user', 'username', 'email', 'full_name',
            'medical_record_number', 'national_id', 'date_of_birth',
            'gender', 'address', 'phone_number'
        ]
        read_only_fields = ['user', 'medical_record_number']

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()