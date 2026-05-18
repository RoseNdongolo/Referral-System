# referrals/views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.shortcuts import get_object_or_404
from django.contrib.gis.geos import Point

from accounts.permissions import IsDoctor, IsMedicalDirectorOrAdminOrDoctorOwner
from hospitals.models import Hospital
from .models import Referral, ReferralAttachment
from .serializers import ReferralSerializer, ReferralAttachmentSerializer
from .services import get_nearest_matching_hospital, fetch_google_maps_data


class ReferralViewSet(ModelViewSet):
    queryset = Referral.objects.select_related('patient', 'doctor', 'hospital').all()
    serializer_class = ReferralSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [IsAuthenticated()]
        elif self.action == 'retrieve':
            return [IsAuthenticated()]
        elif self.action == 'create':
            # Only doctors (or superusers) can create referrals
            return [IsAuthenticated(), IsDoctor()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Medical Directors/Admins OR the doctor who owns the referral
            return [IsAuthenticated(), IsMedicalDirectorOrAdminOrDoctorOwner()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return self.queryset.filter(patient=user)
        elif user.role == 'doctor':
            return self.queryset.filter(doctor=user)   # doctors see only their own referrals
        # admin, medical_director, receptionist see all
        return self.queryset

    def get_object(self):
        obj = super().get_object()
        user = self.request.user

        # For retrieve, allow doctor (creator), patient (owner), or staff/admin/medical director
        if self.action == 'retrieve':
            if obj.doctor == user or obj.patient == user or user.is_staff or user.role in ['admin', 'medical_director']:
                return obj
            raise PermissionDenied("You do not have permission to view this referral.")

        # For update/delete, the permission class will handle object-level checks
        return obj

    def perform_create(self, serializer):
        required_specialty = self.request.data.get('required_specialty')
        consultation_id = self.request.data.get('consultation')
        patient = None

        if consultation_id:
            from patients.models import Consultation
            consultation = get_object_or_404(Consultation, id=consultation_id, doctor=self.request.user)
            patient = consultation.patient
        else:
            patient = serializer.validated_data.get('patient')

        if not patient:
            raise ValidationError("Patient information is required to create a referral.")

        patient_profile = patient.patient_profile
        lat = patient_profile.latitude
        lng = patient_profile.longitude

        hospital = None
        if lat and lng and required_specialty:
            patient_point = Point(float(lng), float(lat), srid=4326)
            hospital = get_nearest_matching_hospital(required_specialty, patient_point)

        if hospital is None:
            hospital = Hospital.objects.filter(is_active=True).first()

        referral = serializer.save(
            doctor=self.request.user,
            hospital=hospital,
            required_specialty=required_specialty,
            patient=patient
        )

        if lat and lng and hospital and hospital.location:
            distance_km, travel_min, _, _ = fetch_google_maps_data(
                lat, lng,
                hospital.location.y, hospital.location.x
            )
            if distance_km is not None:
                referral.distance_km = distance_km
                referral.estimated_travel_time_minutes = travel_min
                referral.save(update_fields=['distance_km', 'estimated_travel_time_minutes'])

    def perform_update(self, serializer):
        # Full CRUD – no status restriction
        serializer.save()

    def perform_destroy(self, instance):
        # Full CRUD – any referral can be deleted (by authorised users)
        instance.delete()


class ReferralAttachmentViewSet(ModelViewSet):
    queryset = ReferralAttachment.objects.all()
    serializer_class = ReferralAttachmentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        # Allow Medical Directors/Admins OR the doctor who owns the referral
        return [IsAuthenticated(), IsMedicalDirectorOrAdminOrDoctorOwner()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return self.queryset.filter(referral__patient=user)
        elif user.role == 'doctor':
            return self.queryset.filter(referral__doctor=user)
        return self.queryset