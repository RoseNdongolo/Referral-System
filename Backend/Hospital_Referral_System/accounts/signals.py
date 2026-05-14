from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, MedicalDirectorProfile
from receptionists.models import ReceptionistProfile
from patients.models import PatientProfile  # ensure PatientProfile exists

@receiver(post_save, sender=User)
def create_related_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == "receptionist":
            ReceptionistProfile.objects.get_or_create(
                user=instance,
                defaults={"employee_id": f"EMP-{instance.id}"}
            )
        elif instance.role == "medical_director":
            MedicalDirectorProfile.objects.get_or_create(
                user=instance,
                defaults={"staff_code": f"MD-{instance.id}"}
            )
        elif instance.role == "patient":
            PatientProfile.objects.get_or_create(
                user=instance,
                defaults={"medical_record_number": f"MRN-{instance.id}"}
            )
        # Add other roles (doctor, admin) if needed