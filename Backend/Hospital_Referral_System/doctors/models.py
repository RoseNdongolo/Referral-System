from django.db import models
from django.conf import settings


class DoctorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.CharField(max_length=100)
    department = models.CharField(max_length=100, blank=True, null=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"Dr. {self.user.username} - {self.specialization}"