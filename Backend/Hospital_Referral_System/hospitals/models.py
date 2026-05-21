# hospitals/models.py
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

    # Replaced PointField with two decimal fields
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    has_emergency = models.BooleanField(default=False)
    has_surgery = models.BooleanField(default=False)
    has_icu = models.BooleanField(default=False)
    has_laboratory = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    specialties = models.ManyToManyField(Specialty, related_name='hospitals', blank=True)

    def __str__(self):
        return self.name

    @property
    def location(self):
        """Compatibility property for code expecting a PointField."""
        if self.latitude is not None and self.longitude is not None:
            return {"type": "Point", "coordinates": [float(self.longitude), float(self.latitude)]}
        return None

class HospitalDepartment(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.hospital.name} - {self.name}"