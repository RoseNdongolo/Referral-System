from django.db import models
from django.conf import settings

class ReceptionistProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='receptionist_profile'
    )
    employee_id = models.CharField(max_length=50, unique=True)
    desk_number = models.CharField(max_length=20, blank=True, null=True)
    shift = models.CharField(
        max_length=50,
        choices=[('morning', 'Morning'), ('evening', 'Evening'), ('night', 'Night')],
        blank=True, null=True
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Receptionist: {self.user.username}"