from rest_framework import serializers
from .models import Specialist
from hospitals.serializers import SpecialtySerializer

class SpecialistSerializer(serializers.ModelSerializer):
    specialty_name = serializers.CharField(source='specialty.name', read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)   # <-- ADD THIS
    specialty_details = SpecialtySerializer(source='specialty', read_only=True)

    class Meta:
        model = Specialist
        fields = '__all__'