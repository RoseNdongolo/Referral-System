from django.contrib.gis.db import models


class Hospital(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    address = models.TextField()
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    location = models.PointField(null=True, blank=True)
    has_emergency = models.BooleanField(default=False)
    has_surgery = models.BooleanField(default=False)
    has_icu = models.BooleanField(default=False)
    has_laboratory = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


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