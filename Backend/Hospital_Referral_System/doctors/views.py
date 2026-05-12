from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsMedicalDirector
from .models import DoctorProfile
from .serializers import DoctorProfileSerializer


class DoctorProfileViewSet(ModelViewSet):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer
    permission_classes = [IsAuthenticated, IsMedicalDirector]