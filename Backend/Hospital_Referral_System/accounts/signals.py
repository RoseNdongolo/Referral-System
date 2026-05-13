from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, ReceptionistProfile, MedicalDirectorProfile
from patients.models import PatientProfile   # adjust import if needed


@receiver(post_save, sender=User)
def create_related_profile(sender, instance, created, **kwargs):
    if not created:
        return

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
    # Add other roles (doctor, admin) later when their models exist