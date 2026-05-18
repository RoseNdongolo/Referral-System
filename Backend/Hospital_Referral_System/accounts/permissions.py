# accounts/permissions.py
from rest_framework.permissions import BasePermission


class IsSuperUser(BasePermission):
    """Only superusers have access."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)


class IsReceptionist(BasePermission):
    """Receptionists (active profile) or superusers."""
    def has_permission(self, request, view):
        return (
            request.user and request.user.is_authenticated and
            (request.user.is_superuser or (
                request.user.role == "receptionist" and
                hasattr(request.user, 'receptionist_profile') and
                request.user.receptionist_profile.is_active
            ))
        )


class IsDoctor(BasePermission):
    """Doctors (profile exists) or superusers."""
    def has_permission(self, request, view):
        return (
            request.user and request.user.is_authenticated and
            (request.user.is_superuser or (
                request.user.role == "doctor" and
                hasattr(request.user, 'doctor_profile')
            ))
        )


class IsMedicalDirector(BasePermission):
    """Medical Directors (active profile) or superusers."""
    def has_permission(self, request, view):
        return (
            request.user and request.user.is_authenticated and
            (request.user.is_superuser or (
                request.user.role == "medical_director" and
                hasattr(request.user, 'medical_director_profile') and
                request.user.medical_director_profile.is_active
            ))
        )


class IsAdmin(BasePermission):
    """Admin role or superuser."""
    def has_permission(self, request, view):
        return (
            request.user and request.user.is_authenticated and
            (request.user.is_superuser or request.user.role == "admin")
        )


class IsPatientOwner(BasePermission):
    """Patients can only access their own profile or referrals."""
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.user.is_superuser or request.user.role == 'admin':
            return True
        if not request.user.is_authenticated or request.user.role != 'patient':
            return False
        if hasattr(obj, 'patient'):
            return obj.patient == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        return False


class IsAdminOrMedicalDirector(BasePermission):
    """Allow access to Admin or Medical Director."""
    def has_permission(self, request, view):
        return (IsAdmin().has_permission(request, view) or
                IsMedicalDirector().has_permission(request, view))


class IsReceptionistOrMedicalDirector(BasePermission):
    """Allow access to receptionists or medical directors (and admins/superusers)."""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser or request.user.role == 'admin':
            return True
        return request.user.role in ['receptionist', 'medical_director']


# ========== NEW PERMISSION FOR DOCTOR OWNERSHIP ==========
class IsDoctorOwner(BasePermission):
    """
    Allows a doctor to edit/delete only their own referrals.
    For create actions, only the doctor role is required.
    For update/delete, the referral's doctor must match the logged‑in user.
    """
    def has_permission(self, request, view):
        # Allow any doctor to create a referral
        if view.action == 'create':
            return (request.user and request.user.is_authenticated and
                    (request.user.is_superuser or
                     (request.user.role == "doctor" and hasattr(request.user, 'doctor_profile'))))
        # For other actions, we rely on has_object_permission
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Only the doctor who owns the referral can update/delete
        if view.action in ['update', 'partial_update', 'destroy']:
            # obj is a Referral instance; check obj.doctor
            return obj.doctor == request.user
        # For retrieve, we keep the existing logic (allow patient, doctor, staff)
        return True