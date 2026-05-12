from django.db import models
from django.conf import settings


class Referral(models.Model):
    REFERRAL_STATUS = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    )

    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='patient_referrals')
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_referrals')
    hospital = models.ForeignKey('hospitals.Hospital', on_delete=models.CASCADE, related_name='referrals')
    diagnosis = models.TextField()
    clinical_notes = models.TextField(blank=True, null=True)
    test_results = models.TextField(blank=True, null=True)
    referral_reason = models.TextField()
    status = models.CharField(max_length=20, choices=REFERRAL_STATUS, default='pending')
    distance_km = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    estimated_travel_time = models.DurationField(blank=True, null=True)
    route_info = models.TextField(blank=True, null=True)
    traffic_info = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Referral {self.id} - {self.patient.username} to {self.hospital.name}"


class ReferralAttachment(models.Model):
    referral = models.ForeignKey(Referral, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='referrals/')
    description = models.CharField(max_length=255, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment for Referral {self.referral.id}"