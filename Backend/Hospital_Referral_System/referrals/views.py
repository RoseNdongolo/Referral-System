from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
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
        # List: allowed for authenticated users (patients see only their own via queryset)
        if self.action == 'list':
            return [IsAuthenticated()]
        # Retrieve: check ownership for patients
        elif self.action == 'retrieve':
            return [IsAuthenticated(), IsPatientOwner()]
        # Create, update, delete: only doctors
        else:
            return [IsAuthenticated(), IsDoctor()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return self.queryset.filter(patient=user)
        return self.queryset

    def perform_create(self, serializer):
        required_specialty = self.request.data.get('required_specialty')
        patient_lat = self.request.data.get('patient_lat')
        patient_lng = self.request.data.get('patient_lng')

        # 1. Find nearest matching hospital
        hospital = None
        if patient_lat and patient_lng and required_specialty:
            patient_point = Point(float(patient_lng), float(patient_lat), srid=4326)
            hospital = get_nearest_matching_hospital(required_specialty, patient_point)

        # Fallback to any active hospital
        if hospital is None:
            hospital = Hospital.objects.filter(is_active=True).first()

        # 2. Save referral
        referral = serializer.save(
            doctor=self.request.user,
            hospital=hospital,
            required_specialty=required_specialty
        )

        # 3. Fetch Google Maps data if location exists
        if patient_lat and patient_lng and hospital and hospital.location:
            distance_km, travel_min, _, _ = fetch_google_maps_data(
                patient_lat, patient_lng,
                hospital.location.y, hospital.location.x
            )
            if distance_km is not None:
                referral.distance_km = distance_km
                referral.estimated_travel_time_minutes = travel_min
                referral.save(update_fields=['distance_km', 'estimated_travel_time_minutes'])


class ReferralAttachmentViewSet(ModelViewSet):
    queryset = ReferralAttachment.objects.all()
    serializer_class = ReferralAttachmentSerializer

    def get_permissions(self):
        # Patients can read attachments of their own referrals
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        # Create, update, delete only for doctors
        return [IsAuthenticated(), IsDoctor()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            # Only attachments of referrals belonging to this patient
            return self.queryset.filter(referral__patient=user)
        return self.queryset