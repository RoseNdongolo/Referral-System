from django.contrib.gis.geos import Point
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsDoctor, IsPatientOwner
from hospitals.models import Hospital
from .models import Referral, ReferralAttachment
from .serializers import ReferralSerializer, ReferralAttachmentSerializer
from .services import get_nearest_matching_hospital


class ReferralViewSet(ModelViewSet):
    queryset = Referral.objects.all()
    serializer_class = ReferralSerializer
    permission_classes = [IsAuthenticated, IsDoctor]

    def perform_create(self, serializer):
        required_specialty = self.request.data.get('required_specialty')
        patient_lat = self.request.data.get('patient_lat')
        patient_lng = self.request.data.get('patient_lng')

        patient_point = None
        hospital = None

        if patient_lat and patient_lng and required_specialty:
            patient_point = Point(float(patient_lng), float(patient_lat), srid=4326)
            hospital = get_nearest_matching_hospital(required_specialty, patient_point)

        if hospital is None:
            hospital = Hospital.objects.filter(is_active=True).first()

        serializer.save(doctor=self.request.user, hospital=hospital)


class ReferralAttachmentViewSet(ModelViewSet):
    queryset = ReferralAttachment.objects.all()
    serializer_class = ReferralAttachmentSerializer
    permission_classes = [IsAuthenticated, IsDoctor]


class PatientReferralDetailView(RetrieveAPIView):
    queryset = Referral.objects.all()
    serializer_class = ReferralSerializer
    permission_classes = [IsAuthenticated, IsPatientOwner]

    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj