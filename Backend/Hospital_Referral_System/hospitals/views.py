from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdmin
from .models import Hospital, HospitalSpecialty, HospitalDepartment
from .serializers import HospitalSerializer, HospitalSpecialtySerializer, HospitalDepartmentSerializer


class HospitalViewSet(ModelViewSet):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class HospitalSpecialtyViewSet(ModelViewSet):
    queryset = HospitalSpecialty.objects.all()
    serializer_class = HospitalSpecialtySerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class HospitalDepartmentViewSet(ModelViewSet):
    queryset = HospitalDepartment.objects.all()
    serializer_class = HospitalDepartmentSerializer
    permission_classes = [IsAuthenticated, IsAdmin]