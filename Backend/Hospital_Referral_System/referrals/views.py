# referrals/views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.shortcuts import get_object_or_404

from accounts.permissions import IsDoctor, IsMedicalDirectorOrAdminOrDoctorOwner
from hospitals.models import Hospital
from .models import Referral, ReferralAttachment
from .serializers import ReferralSerializer, ReferralAttachmentSerializer
from .services import get_nearest_matching_hospital, get_distance_and_time


class ReferralViewSet(ModelViewSet):
    queryset = Referral.objects.select_related('patient', 'doctor', 'hospital').all()
    serializer_class = ReferralSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [IsAuthenticated()]
        elif self.action == 'retrieve':
            return [IsAuthenticated()]
        elif self.action == 'create':
            return [IsAuthenticated(), IsDoctor()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsMedicalDirectorOrAdminOrDoctorOwner()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return self.queryset.filter(patient=user)
        elif user.role == 'doctor':
            return self.queryset.filter(doctor=user)
        return self.queryset

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if self.action == 'retrieve':
            if obj.doctor == user or obj.patient == user or user.is_staff or user.role in ['admin', 'medical_director']:
                return obj
            raise PermissionDenied("You do not have permission to view this referral.")
        return obj

    def perform_create(self, serializer):
        required_specialty = self.request.data.get('required_specialty')
        consultation_id = self.request.data.get('consultation')
        hospital_id = self.request.data.get('hospital_id')          # doctor's chosen hospital
        patient = None
        consultation = None

        if consultation_id:
            from patients.models import Consultation
            consultation = get_object_or_404(Consultation, id=consultation_id, doctor=self.request.user)
            patient = consultation.patient
        else:
            patient = serializer.validated_data.get('patient')

        if not patient:
            raise ValidationError("Patient information is required to create a referral.")

        patient_profile = patient.patient_profile
        patient_lat = float(patient_profile.latitude) if patient_profile.latitude else None
        patient_lng = float(patient_profile.longitude) if patient_profile.longitude else None

        hospital = None

        # 1️⃣ Use explicitly chosen hospital
        if hospital_id:
            hospital = get_object_or_404(Hospital, id=hospital_id, is_active=True)

        # 2️⃣ Fallback: nearest hospital by specialty (if patient has location)
        if hospital is None and patient_lat is not None and patient_lng is not None and required_specialty:
            hospital = get_nearest_matching_hospital(required_specialty, patient_lat, patient_lng)

        # 3️⃣ Last resort: any active hospital
        if hospital is None:
            hospital = Hospital.objects.filter(is_active=True).first()

        if not hospital:
            raise ValidationError("No suitable hospital found for this referral.")

        # ✅ Create referral WITH consultation link
        referral = serializer.save(
            doctor=self.request.user,
            hospital=hospital,
            required_specialty=required_specialty,
            patient=patient,
            consultation=consultation   # <-- THIS IS THE FIX
        )

        # Compute distance & travel time
        if patient_lat is not None and patient_lng is not None and hospital.latitude and hospital.longitude:
            dist_km, dur_min = get_distance_and_time(
                patient_lat, patient_lng,
                float(hospital.latitude), float(hospital.longitude)
            )
            referral.distance_km = dist_km
            referral.estimated_travel_time_minutes = int(dur_min)
            referral.save(update_fields=['distance_km', 'estimated_travel_time_minutes'])

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()


class ReferralAttachmentViewSet(ModelViewSet):
    queryset = ReferralAttachment.objects.all()
    serializer_class = ReferralAttachmentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsMedicalDirectorOrAdminOrDoctorOwner()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return self.queryset.filter(referral__patient=user)
        elif user.role == 'doctor':
            return self.queryset.filter(referral__doctor=user)
        return self.queryset