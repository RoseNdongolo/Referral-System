from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Specialist
from .serializers import SpecialistSerializer

class SpecialistViewSet(ModelViewSet):
    queryset = Specialist.objects.select_related("hospital").all()
    serializer_class = SpecialistSerializer
    permission_classes = [IsAuthenticated]