# accounts/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from medical_directors.models import MedicalDirectorProfile

User = get_user_model()

@receiver(post_save, sender=User)
def create_related_profile(sender, instance, created, **kwargs):
    if created:
        # Only auto‑create profiles for roles that are NOT handled by dedicated serializers.
        # Receptionists, patients, and doctors are created via their own registration serializers.
        if instance.role == "medical_director":
            MedicalDirectorProfile.objects.get_or_create(
                user=instance,
                defaults={"staff_code": f"MD-{instance.id}"}
            )
        # For other roles, do nothing – let their respective serializers handle creation.