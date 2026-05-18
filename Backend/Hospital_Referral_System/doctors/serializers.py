# doctors/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
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
    specialization = serializers.CharField(source='doctor_profile.specialization', required=False, allow_blank=True)
    department = serializers.CharField(source='doctor_profile.department', required=False, allow_blank=True)
    is_available = serializers.BooleanField(source='doctor_profile.is_available')

    def get_full_name(self, obj):
        user = obj.get('user')
        if user:
            return f"{user.first_name} {user.last_name}".strip()
        return ""


# ========== UPDATED DoctorListSerializer for admin ==========
class DoctorListSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    username = serializers.CharField()
    email = serializers.EmailField()
    specialization = serializers.CharField(source='doctor_profile.specialization', default='')
    is_active = serializers.BooleanField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'specialization', 'is_active']


# ========== Registration serializer remains the same ==========
class DoctorRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    phone_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    specialization = serializers.CharField(required=False, allow_blank=True, default='General')
    department = serializers.CharField(required=False, allow_blank=True, allow_null=True)
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
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            role='doctor'
        )
        specialization = validated_data.get('specialization') or 'General'
        department = validated_data.get('department', '')
        is_available = validated_data.get('is_available', True)

        profile = DoctorProfile.objects.create(
            user=user,
            specialization=specialization,
            department=department,
            is_available=is_available
        )
        return {'user': user, 'doctor_profile': profile}

    def to_representation(self, instance):
        user = instance['user']
        profile = instance['doctor_profile']
        return {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'specialization': profile.specialization,
            'is_active': user.is_active,
        }