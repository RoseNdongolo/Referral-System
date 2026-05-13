from rest_framework import serializers
from .models import Specialist

class SpecialistSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source="hospital.name", read_only=True)

    class Meta:
        model = Specialist
        fields = [
            "id",
            "name",
            "specialty",
            "hospital",
            "hospital_name",
            "department",
            "phone",
            "email",
        ]