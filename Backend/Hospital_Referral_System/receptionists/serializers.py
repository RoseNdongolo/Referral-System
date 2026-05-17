from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ReceptionistProfile

User = get_user_model()


class ReceptionistProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReceptionistProfile
        fields = '__all__'
        read_only_fields = ['user']


class ReceptionistListSerializer(serializers.ModelSerializer):
    receptionist_id = serializers.IntegerField(source='id')
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    full_name = serializers.SerializerMethodField()
    employee_id = serializers.CharField(source='receptionist_profile.employee_id')
    desk_number = serializers.CharField(source='receptionist_profile.desk_number', required=False, allow_blank=True)
    shift = serializers.CharField(source='receptionist_profile.shift', required=False, allow_blank=True)
    is_active = serializers.BooleanField(source='receptionist_profile.is_active')
    phone_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'receptionist_id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'employee_id', 'desk_number', 'shift', 'is_active', 'phone_number'
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


class ReceptionistRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    phone_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    employee_id = serializers.CharField()
    desk_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    shift = serializers.ChoiceField(choices=['morning', 'evening', 'night'], required=False, allow_blank=True)
    is_active = serializers.BooleanField(default=True)

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
            role='receptionist'
        )
        if validated_data.get('phone_number'):
            user.phone_number = validated_data['phone_number']
            user.save()

        profile = ReceptionistProfile.objects.create(
            user=user,
            employee_id=validated_data['employee_id'],
            desk_number=validated_data.get('desk_number', ''),
            shift=validated_data.get('shift', ''),
            is_active=validated_data.get('is_active', True)
        )

        # Return a dictionary that matches the output format of ReceptionistListSerializer
        return {
            'receptionist_id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': f"{user.first_name} {user.last_name}".strip(),
            'employee_id': profile.employee_id,
            'desk_number': profile.desk_number,
            'shift': profile.shift,
            'is_active': profile.is_active,
            'phone_number': user.phone_number
        }

    def to_representation(self, instance):
        # instance is the dict returned by create()
        return instance