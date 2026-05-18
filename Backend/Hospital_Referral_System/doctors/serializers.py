# doctors/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import DoctorProfile
from hospitals.models import Specialty, HospitalDepartment

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
    specialization = serializers.PrimaryKeyRelatedField(source='doctor_profile.specialization', queryset=Specialty.objects.all(), allow_null=True)
    department = serializers.PrimaryKeyRelatedField(source='doctor_profile.department', queryset=HospitalDepartment.objects.all(), allow_null=True)
    is_available = serializers.BooleanField(source='doctor_profile.is_available')

    def get_full_name(self, obj):
        user = obj.get('user')
        if user:
            return f"{user.first_name} {user.last_name}".strip()
        return ""

class DoctorListSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    username = serializers.CharField()
    email = serializers.EmailField()
    specialization_name = serializers.CharField(source='doctor_profile.specialization.name', default='')
    department_name = serializers.CharField(source='doctor_profile.department.name', default='')
    specialization_id = serializers.IntegerField(source='doctor_profile.specialization.id', allow_null=True)
    department_id = serializers.IntegerField(source='doctor_profile.department.id', allow_null=True)
    is_active = serializers.BooleanField()
    is_available = serializers.BooleanField(source='doctor_profile.is_available')

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'specialization_name', 'department_name', 'specialization_id', 'department_id',
            'is_active', 'is_available'
        ]

class DoctorRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    phone_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    specialization_id = serializers.IntegerField(required=False, allow_null=True)
    department_id = serializers.IntegerField(required=False, allow_null=True)
    is_available = serializers.BooleanField(default=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    @transaction.atomic
    def create(self, validated_data):
        spec_id = validated_data.get('specialization_id')
        dept_id = validated_data.get('department_id')
        specialization = Specialty.objects.filter(id=spec_id).first() if spec_id else None
        department = HospitalDepartment.objects.filter(id=dept_id).first() if dept_id else None

        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            role='doctor'
        )
        profile = DoctorProfile.objects.create(
            user=user,
            specialization=specialization,
            department=department,
            is_available=validated_data.get('is_available', True)
        )
        return profile

    def to_representation(self, instance):
        # instance is a DoctorProfile object
        return {
            'id': instance.user.id,
            'username': instance.user.username,
            'email': instance.user.email,
            'first_name': instance.user.first_name,
            'last_name': instance.user.last_name,
            'specialization_name': instance.specialization.name if instance.specialization else '',
            'specialization_id': instance.specialization.id if instance.specialization else None,
            'department_name': instance.department.name if instance.department else '',
            'department_id': instance.department.id if instance.department else None,
            'is_active': instance.user.is_active,
            'is_available': instance.is_available,
        }