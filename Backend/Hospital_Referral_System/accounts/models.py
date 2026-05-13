from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):
    ROLE_CHOICES = (
        ("receptionist", "Receptionist"),
        ("doctor", "Doctor"),
        ("medical_director", "Medical Director"),
        ("patient", "Patient"),
        ("admin", "Admin"),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="patient")
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

class ReceptionistProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="receptionist_profile")
    employee_id = models.CharField(max_length=50, unique=True)
    desk_number = models.CharField(max_length=20, blank=True, null=True)
    shift = models.CharField(
        max_length=50,
        choices=[("morning", "Morning"), ("evening", "Evening"), ("night", "Night")],
        blank=True, null=True
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Receptionist: {self.user.username}"

class MedicalDirectorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="medical_director_profile")
    staff_code = models.CharField(max_length=50, unique=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    office_number = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Medical Director: {self.user.username}"