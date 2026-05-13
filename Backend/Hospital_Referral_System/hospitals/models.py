from django.contrib.gis.db import models as gis_models
from django.db import models

class Hospital(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    address = models.TextField()
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    # GIS location – store as Point (longitude, latitude)
    location = gis_models.PointField(null=True, blank=True, help_text="Use (longitude, latitude) in SRID 4326")

    # Facility flags
    has_emergency = models.BooleanField(default=False)
    has_surgery = models.BooleanField(default=False)
    has_icu = models.BooleanField(default=False)
    has_laboratory = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    @property
    def latitude(self):
        return self.location.y if self.location else None

    @property
    def longitude(self):
        return self.location.x if self.location else None


class HospitalSpecialty(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='specialties')
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.hospital.name} - {self.name}"


class HospitalDepartment(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.hospital.name} - {self.name}"