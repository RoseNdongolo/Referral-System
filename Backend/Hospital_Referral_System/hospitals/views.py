# hospitals/views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdminOrMedicalDirector, IsAdmin
from .models import Hospital, HospitalDepartment, Specialty
from .serializers import HospitalSerializer, HospitalDepartmentSerializer, SpecialtySerializer


# ========== ORIGINAL VIEWSETS ==========

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


class HospitalViewSet(ModelViewSet):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticated, IsAdminOrMedicalDirector]


# ========== ADMIN‑ONLY VIEWSETS ==========

class AdminHospitalViewSet(ModelViewSet):
    """
    Full CRUD for hospitals – only accessible by admin.
    """
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class AdminSpecialtyViewSet(ModelViewSet):
    """
    Full CRUD for specialties – only accessible by admin.
    """
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer
    permission_classes = [IsAuthenticated, IsAdmin]