# doctors/views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from accounts.permissions import IsMedicalDirector, IsDoctor   # assuming you have IsDoctor permission
from .models import DoctorProfile
from .serializers import DoctorProfileSerializer, DoctorSelfSerializer

User = get_user_model()

class DoctorProfileViewSet(ModelViewSet):
    queryset = DoctorProfile.objects.select_related('user').all()
    serializer_class = DoctorProfileSerializer

    def get_permissions(self):
        # List, create, update, delete, retrieve – only medical director
        if self.action in ['list', 'create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsMedicalDirector]
        # me action – only doctor (self)
        elif self.action == 'me':
            permission_classes = [IsAuthenticated, IsDoctor]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get', 'put', 'patch', 'delete'], permission_classes=[IsAuthenticated, IsDoctor])
    def me(self, request):
        """
        Get, update, or delete the logged-in doctor's own profile.
        GET: returns combined user + doctor profile.
        PUT/PATCH: update user and profile fields.
        DELETE: delete the doctor account (cascades).
        """
        user = request.user
        # Ensure the user has a doctor profile
        try:
            profile = user.doctor_profile
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Doctor profile not found'}, status=404)

        if request.method == 'GET':
            serializer = DoctorSelfSerializer({'user': user, 'doctor_profile': profile})
            return Response(serializer.data)

        if request.method == 'DELETE':
            user.delete()   # cascade deletes profile
            return Response(status=204)

        # PUT / PATCH: update user fields and doctor profile
        # Update User fields
        user_fields = ['first_name', 'last_name', 'email', 'phone_number', 'username']
        for field in user_fields:
            if field in request.data:
                val = request.data[field]
                if field == 'username' and val != user.username:
                    if User.objects.filter(username=val).exists():
                        return Response({'error': 'Username already taken'}, status=400)
                setattr(user, field, val)
        user.save()

        # Update DoctorProfile fields
        profile_fields = ['specialization', 'license_number', 'department', 'years_of_experience', 'is_available']
        for field in profile_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])
        profile.save()

        # Return updated data
        serializer = DoctorSelfSerializer({'user': user, 'doctor_profile': profile})
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsDoctor])
    def change_password(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        if not old_password or not new_password:
            return Response({'error': 'Old and new password required'}, status=400)
        if not user.check_password(old_password):
            return Response({'error': 'Old password is incorrect'}, status=400)
        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters'}, status=400)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully'})