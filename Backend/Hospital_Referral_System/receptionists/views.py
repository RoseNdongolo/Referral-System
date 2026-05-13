from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from accounts.models import User
from accounts.permissions import IsReceptionist
from .serializers import ReceptionistSerializer
# from patients.models import Patient  # Add when ready
# from patients.serializers import PatientSerializer

class ReceptionistViewSet(ModelViewSet):
    queryset = User.objects.filter(role="receptionist")
    serializer_class = ReceptionistSerializer
    permission_classes = [IsAuthenticated, IsReceptionist]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active']

    def get_queryset(self):
        return super().get_queryset().select_related('receptionist_profile')

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current logged-in receptionist profile"""
        if not hasattr(request.user, 'receptionist_profile'):
            return Response({"error": "No receptionist profile found"}, status=404)
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

# class PatientListView(ListAPIView):  # Uncomment when Patient model ready
#     queryset = Patient.objects.all().select_related('user')
#     serializer_class = PatientSerializer
#     permission_classes = [IsAuthenticated, IsReceptionist]

# class PatientRegistrationView(ListAPIView):  # Uncomment when ready
#     permission_classes = [IsAuthenticated, IsReceptionist]