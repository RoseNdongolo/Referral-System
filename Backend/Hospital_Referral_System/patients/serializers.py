# serializers.py (patients app) – complete corrected version
from rest_framework import serializers
from .models import PatientProfile, Consultation
from django.contrib.auth import get_user_model
import time

User = get_user_model()


# ==================== Consultation Serializer (NEW) ====================
class ConsultationSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    patient_mrn = serializers.SerializerMethodField()

    class Meta:
        model = Consultation
        fields = ['id', 'patient', 'doctor', 'patient_name', 'patient_mrn', 'doctor_name',
                  'status', 'assigned_at', 'chief_complaint', 'notes']

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}".strip() or obj.patient.username

    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.first_name} {obj.doctor.last_name}".strip() or obj.doctor.username

    def get_patient_mrn(self, obj):
        try:
            return obj.patient.patient_profile.medical_record_number
        except:
            return None


# ==================== PatientProfile Serializer ====================
class PatientProfileSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
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

    def get_username(self, obj):
        return obj.user.username if obj.user else None

    def get_email(self, obj):
        return obj.user.email if obj.user else None

    def get_first_name(self, obj):
        return obj.user.first_name if obj.user else None

    def get_last_name(self, obj):
        return obj.user.last_name if obj.user else None

    def get_full_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return ""

    def update(self, instance, validated_data):
        for field in ['phone_number', 'national_id', 'date_of_birth', 'gender', 'address']:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        return instance


# ==================== PatientRegistration Serializer ====================
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
            profile.medical_record_number = mrn
            profile.phone_number = validated_data.get('phone_number') or profile.phone_number
            profile.national_id = validated_data.get('national_id') or profile.national_id
            profile.date_of_birth = validated_data.get('date_of_birth') or profile.date_of_birth
            profile.gender = validated_data.get('gender') or profile.gender
            profile.address = validated_data.get('address') or profile.address
            profile.save()
        return profile


# ==================== Receptionist serializers ====================
class UnassignedPatientSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    medical_record_number = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'medical_record_number']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def get_medical_record_number(self, obj):
        try:
            return obj.patient_profile.medical_record_number
        except:
            return None


class ActiveDoctorSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    specialty = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'specialty']

    def get_full_name(self, obj):
        return f"Dr. {obj.first_name} {obj.last_name}".strip()

    def get_specialty(self, obj):
        return "General"


class AssignPatientSerializer(serializers.Serializer):
    patient_id = serializers.IntegerField()
    doctor_id = serializers.IntegerField()
    chief_complaint = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_patient_id(self, value):
        if not User.objects.filter(id=value, role='patient').exists():
            raise serializers.ValidationError("Patient not found")
        if Consultation.objects.filter(patient_id=value, status__in=['assigned', 'in_progress']).exists():
            raise serializers.ValidationError("Patient already has an ongoing consultation")
        return value

    def validate_doctor_id(self, value):
        if not User.objects.filter(id=value, role='doctor', is_active=True).exists():
            raise serializers.ValidationError("Active doctor not found")
        return value

    def create(self, validated_data):
        return Consultation.objects.create(
            patient_id=validated_data['patient_id'],
            doctor_id=validated_data['doctor_id'],
            assigned_by=self.context['request'].user,
            chief_complaint=validated_data.get('chief_complaint', ''),
            notes=validated_data.get('notes', '')
        )