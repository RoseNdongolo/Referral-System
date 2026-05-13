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
                hasattr(request.user, 'doctor_profile')   # Create DoctorProfile model + signal later
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
    """
    - Staff (superuser, admin, receptionist, doctor, medical director) have full access.
    - Patients can only access their own profile or their own referrals.
    """
    def has_object_permission(self, request, view, obj):
        # Staff bypass
        if request.user.is_staff or request.user.is_superuser or request.user.role == 'admin':
            return True

        # Must be authenticated and a patient
        if not request.user.is_authenticated or request.user.role != 'patient':
            return False

        # Object can be a Referral (has patient) or PatientProfile (has user)
        if hasattr(obj, 'patient'):          # Referral object
            return obj.patient == request.user
        elif hasattr(obj, 'user'):           # PatientProfile object
            return obj.user == request.user
        return False