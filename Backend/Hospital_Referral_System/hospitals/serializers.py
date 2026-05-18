from rest_framework import serializers
from .models import Hospital, HospitalDepartment, Specialty

class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = '__all__'

class HospitalSerializer(serializers.ModelSerializer):
    specialties = SpecialtySerializer(many=True, read_only=True)
    specialty_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Specialty.objects.all(), source='specialties'
    )
    location = serializers.SerializerMethodField()

    class Meta:
        model = Hospital
        fields = '__all__'

    def get_location(self, obj):
        if obj.location:
            return {
                "type": "Point",
                "coordinates": [obj.location.x, obj.location.y]
            }
        return None

class HospitalDepartmentSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)

    class Meta:
        model = HospitalDepartment
        fields = ['id', 'name', 'hospital', 'hospital_name']