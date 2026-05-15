# serializers.py
from rest_framework import serializers
from .models import PatientProfile
from django.contrib.auth import get_user_model
import time

User = get_user_model()


class PatientProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    full_name = serializers.SerializerMethodField()

    national_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.ChoiceField(choices=['Male', 'Female', 'Other'], required=False, allow_blank=True, allow_null=True)
    address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    phone_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)

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

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        if user_data:
            user = instance.user
            for field in ['first_name', 'last_name', 'email']:
                if field in user_data:
                    setattr(user, field, user_data[field])
            user.save()

        for field in ['phone_number', 'national_id', 'date_of_birth', 'gender', 'address']:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        return instance


class PatientRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    phone_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    national_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True, input_formats=['%Y-%m-%d', '%d/%m/%Y', '%Y/%m/%d'])
    gender = serializers.ChoiceField(choices=['Male', 'Female', 'Other'], required=False, allow_blank=True, allow_null=True)
    address = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            role='patient'
        )

        mrn = f"MRN-{user.id}-{int(time.time() * 1000)}"

        # Use get_or_create to avoid IntegrityError
        profile, created = PatientProfile.objects.get_or_create(
            user=user,
            defaults={
                'medical_record_number': mrn,
                'phone_number': validated_data.get('phone_number') or '',
                'national_id': validated_data.get('national_id') or '',
                'date_of_birth': validated_data.get('date_of_birth'),
                'gender': validated_data.get('gender') or '',
                'address': validated_data.get('address') or '',
            }
        )
        if not created:
            # Update existing profile (should never happen for new user)
            profile.medical_record_number = mrn
            profile.phone_number = validated_data.get('phone_number') or profile.phone_number
            profile.national_id = validated_data.get('national_id') or profile.national_id
            profile.date_of_birth = validated_data.get('date_of_birth') or profile.date_of_birth
            profile.gender = validated_data.get('gender') or profile.gender
            profile.address = validated_data.get('address') or profile.address
            profile.save()

        return profile