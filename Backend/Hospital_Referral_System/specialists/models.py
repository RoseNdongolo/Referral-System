from django.db import models

class Specialist(models.Model):
    name = models.CharField(max_length=255)
    specialty = models.CharField(max_length=255)
    hospital = models.ForeignKey(
        "hospitals.Hospital",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="specialists",
    )
    department = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    def __str__(self):
        return self.name