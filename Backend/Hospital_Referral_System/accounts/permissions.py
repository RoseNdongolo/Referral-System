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


# ========== PERMISSIONS FOR REFERRAL OWNERSHIP ==========

class IsDoctorOwner(BasePermission):
    """
    Allows a doctor to edit/delete only their own referrals.
    """
    def has_permission(self, request, view):
        if view.action == 'create':
            return (request.user and request.user.is_authenticated and
                    (request.user.is_superuser or
                     (request.user.role == "doctor" and hasattr(request.user, 'doctor_profile'))))
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if view.action in ['update', 'partial_update', 'destroy']:
            return obj.doctor == request.user
        return True


class IsMedicalDirectorOrAdmin(BasePermission):
    """
    Allows Medical Directors and Admins (and superusers) to perform any action on any referral.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.role == 'admin' or
            request.user.role == 'medical_director'
        )
    
    def has_object_permission(self, request, view, obj):
        return True


class IsMedicalDirectorOrAdminOrDoctorOwner(BasePermission):
    """
    Combined permission: Medical Directors/Admins have full access;
    doctors can only modify their own referrals.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        # Medical Directors and Admins can do anything
        if user.is_superuser or user.role in ['admin', 'medical_director']:
            return True
        # Doctors can only modify their own referrals
        if user.role == 'doctor' and hasattr(user, 'doctor_profile'):
            return obj.doctor == user
        return False