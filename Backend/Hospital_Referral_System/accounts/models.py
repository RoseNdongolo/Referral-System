# accounts/models.py – final correct version
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

# No other models here – ReceptionistProfile, MedicalDirectorProfile, etc. are in their own apps