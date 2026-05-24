# hospitals/views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
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

    def get_permissions(self):
        # List, retrieve, and the custom 'by_specialty' endpoint are allowed for any authenticated user
        if self.action in ['list', 'retrieve', 'by_specialty']:
            permission_classes = [IsAuthenticated]
        # Create, update, delete require Admin or Medical Director
        else:
            permission_classes = [IsAuthenticated, IsAdminOrMedicalDirector]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def by_specialty(self, request):
        """
        Return active hospitals that have the given specialty.
        Query param: ?specialty=Cardiology (case-insensitive)
        """
        specialty_name = request.query_params.get('specialty')
        if not specialty_name:
            return Response({"error": "specialty query parameter is required"}, status=400)

        hospitals = Hospital.objects.filter(
            is_active=True,
            specialties__name__iexact=specialty_name
        ).distinct()

        serializer = self.get_serializer(hospitals, many=True)
        return Response(serializer.data)


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