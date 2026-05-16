# hospitals/views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from accounts.permissions import IsAdminOrMedicalDirector
from .models import Hospital, HospitalDepartment, Specialty
from .serializers import HospitalSerializer, HospitalDepartmentSerializer, SpecialtySerializer

class SpecialtyViewSet(ModelViewSet):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsAdminOrMedicalDirector]
        return [permission() for permission in permission_classes]

class HospitalDepartmentViewSet(ModelViewSet):
    queryset = HospitalDepartment.objects.select_related('hospital').all()
    serializer_class = HospitalDepartmentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsAdminOrMedicalDirector]
        return [permission() for permission in permission_classes]

# HospitalViewSet remains restricted for writes, but list/retrieve can also be open if needed
class HospitalViewSet(ModelViewSet):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticated, IsAdminOrMedicalDirector]  # keep restricted