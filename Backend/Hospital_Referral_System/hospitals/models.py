from django.contrib.gis.db import models as gis_models
from django.db import models

class Specialty(models.Model):
    """Medical specialty (e.g., Cardiology, Orthopedics) – global list."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Hospital(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    address = models.TextField()
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    location = gis_models.PointField(null=True, blank=True, help_text="Use (longitude, latitude) in SRID 4326")
    has_emergency = models.BooleanField(default=False)
    has_surgery = models.BooleanField(default=False)
    has_icu = models.BooleanField(default=False)
    has_laboratory = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    specialties = models.ManyToManyField(Specialty, related_name='hospitals', blank=True)

    def __str__(self):
        return self.name

    @property
    def latitude(self):
        return self.location.y if self.location else None

    @property
    def longitude(self):
        return self.location.x if self.location else None

# You can deprecate HospitalSpecialty later; keep only if you have existing data to preserve.
class HospitalDepartment(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.hospital.name} - {self.name}"