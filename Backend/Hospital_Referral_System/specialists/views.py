from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdminOrMedicalDirector
from .models import Specialist
from .serializers import SpecialistSerializer

class SpecialistViewSet(ModelViewSet):
    queryset = Specialist.objects.select_related('specialty', 'hospital').all()
    serializer_class = SpecialistSerializer
    permission_classes = [IsAuthenticated, IsAdminOrMedicalDirector]