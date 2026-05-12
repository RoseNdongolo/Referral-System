from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, ReceptionistProfile, MedicalDirectorProfile
from patients.models import PatientProfile
from doctors.models import DoctorProfile

@receiver(post_save, sender=User)
def create_related_profile(sender, instance, created, **kwargs):
    if not created:
        return

    if instance.role == "patient":
        PatientProfile.objects.create(user=instance, medical_record_number=f"MRN-{instance.id}")
    elif instance.role == "doctor":
        DoctorProfile.objects.create(user=instance, specialization="General", license_number=f"LIC-{instance.id}")
    elif instance.role == "receptionist":
        ReceptionistProfile.objects.create(user=instance, employee_id=f"EMP-{instance.id}")
    elif instance.role == "medical_director":
        MedicalDirectorProfile.objects.create(user=instance, staff_code=f"MD-{instance.id}")