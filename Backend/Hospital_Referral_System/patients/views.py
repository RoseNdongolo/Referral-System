from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsReceptionist
from .models import PatientProfile
from .serializers import PatientProfileSerializer


class PatientProfileViewSet(ModelViewSet):
    queryset = PatientProfile.objects.all()
    serializer_class = PatientProfileSerializer
    permission_classes = [IsAuthenticated, IsReceptionist]