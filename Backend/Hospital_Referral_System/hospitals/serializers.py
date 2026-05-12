from rest_framework import serializers
from .models import Hospital, HospitalSpecialty, HospitalDepartment


class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = '__all__'


class HospitalSpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalSpecialty
        fields = '__all__'


class HospitalDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalDepartment
        fields = '__all__'