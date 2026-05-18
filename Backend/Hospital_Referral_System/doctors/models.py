# doctors/models.py
from django.db import models
from django.conf import settings
from hospitals.models import Specialty, HospitalDepartment   # you must have these models

class DoctorProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_profile'
    )
    specialization = models.ForeignKey(
        Specialty,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='doctors'
    )
    department = models.ForeignKey(
        HospitalDepartment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='doctors'
    )
    is_available = models.BooleanField(default=True)

    def __str__(self):
        spec = self.specialization.name if self.specialization else 'No specialty'
        return f"Dr. {self.user.username} - {spec}"