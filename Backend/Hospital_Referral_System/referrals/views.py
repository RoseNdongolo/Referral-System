from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.shortcuts import get_object_or_404
from django.contrib.gis.geos import Point

from accounts.permissions import IsDoctor, IsPatientOwner, IsReceptionist
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
            return [IsAuthenticated(), IsPatientOwner()]
        # Create, update, partial_update, destroy: only doctors
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsDoctor()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return self.queryset.filter(patient=user)
        return self.queryset

    def get_object(self):
        """Ensure a doctor can only access (and modify) their own referrals."""
        obj = super().get_object()
        user = self.request.user
        if self.action in ['update', 'partial_update', 'destroy'] and obj.doctor != user:
            raise PermissionDenied("You can only edit or delete your own referrals.")
        return obj

    def perform_create(self, serializer):
        required_specialty = self.request.data.get('required_specialty')
        patient_lat = self.request.data.get('patient_lat')
        patient_lng = self.request.data.get('patient_lng')

        hospital = None
        if patient_lat and patient_lng and required_specialty:
            patient_point = Point(float(patient_lng), float(patient_lat), srid=4326)
            hospital = get_nearest_matching_hospital(required_specialty, patient_point)

        if hospital is None:
            hospital = Hospital.objects.filter(is_active=True).first()

        referral = serializer.save(
            doctor=self.request.user,
            hospital=hospital,
            required_specialty=required_specialty
        )

        if patient_lat and patient_lng and hospital and hospital.location:
            distance_km, travel_min, _, _ = fetch_google_maps_data(
                patient_lat, patient_lng,
                hospital.location.y, hospital.location.x
            )
            if distance_km is not None:
                referral.distance_km = distance_km
                referral.estimated_travel_time_minutes = travel_min
                referral.save(update_fields=['distance_km', 'estimated_travel_time_minutes'])

    def perform_update(self, serializer):
        referral = self.get_object()
        if referral.status != 'pending':
            raise ValidationError("Cannot edit a referral that is not pending.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.status != 'pending':
            raise ValidationError("Cannot delete a referral that is not pending.")
        instance.delete()


class ReferralAttachmentViewSet(ModelViewSet):
    queryset = ReferralAttachment.objects.all()
    serializer_class = ReferralAttachmentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsDoctor()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return self.queryset.filter(referral__patient=user)
        return self.queryset