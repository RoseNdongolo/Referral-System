# accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager as BaseUserManager
from django.conf import settings

class UserManager(BaseUserManager):
    """Custom manager for User model that sets role='admin' for superusers."""

    def create_user(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('role', 'patient')
        return super().create_user(username, email, password, **extra_fields)

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')   # ✅ ensure superusers are admins
        return super().create_superuser(username, email, password, **extra_fields)

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

    objects = UserManager()   # ✅ use custom manager

    def __str__(self):
        return f"{self.username} ({self.role})"