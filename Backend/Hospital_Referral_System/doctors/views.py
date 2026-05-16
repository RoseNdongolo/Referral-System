# doctors/views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from accounts.permissions import IsMedicalDirector, IsDoctor, IsAdminOrMedicalDirector
from .models import DoctorProfile
from .serializers import (
    DoctorProfileSerializer,
    DoctorSelfSerializer,
    DoctorListSerializer,
    DoctorRegistrationSerializer
)

User = get_user_model()


class DoctorProfileViewSet(ModelViewSet):
    queryset = DoctorProfile.objects.select_related('user').all()
    serializer_class = DoctorProfileSerializer
    lookup_field = 'user_id'

    def get_serializer_class(self):
        if self.action == 'create':
            return DoctorRegistrationSerializer
        return DoctorProfileSerializer

    def get_permissions(self):
        if self.action in ['list', 'create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsMedicalDirector]
        elif self.action in ['me', 'change_password']:
            permission_classes = [IsAuthenticated, IsDoctor]
        elif self.action in ['all_doctors', 'toggle_active', 'update_specialty']:
            permission_classes = [IsAuthenticated, IsAdminOrMedicalDirector]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    # ==================== CREATE with error handling ====================
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
        except Exception as e:
            # Catch any database integrity error (e.g., missing columns, constraints)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    # ==================== Custom update ====================
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        user_id = self.kwargs.get(self.lookup_field)
        doctor_user = get_object_or_404(User, pk=user_id, role='doctor')
        profile = doctor_user.doctor_profile

        # Update user fields
        user_fields = ['first_name', 'last_name', 'email', 'phone_number', 'username']
        for field in user_fields:
            if field in request.data:
                val = request.data[field]
                if field == 'username' and val != doctor_user.username:
                    if User.objects.filter(username=val).exists():
                        return Response({'error': 'Username already taken'}, status=400)
                setattr(doctor_user, field, val)
        doctor_user.save()

        # Update profile fields
        profile_fields = ['specialization', 'department', 'is_available']
        for field in profile_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])
        profile.save()

        serializer = DoctorListSerializer(doctor_user)
        return Response(serializer.data)

    # ==================== Custom destroy ====================
    def destroy(self, request, *args, **kwargs):
        """Delete a doctor by user_id, even if the profile is missing."""
        user_id = self.kwargs.get(self.lookup_field)
        try:
            user = User.objects.get(pk=user_id, role='doctor')
            user.delete()  # cascade deletes profile if exists
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)

    # ==================== Doctor self actions ====================
    @action(detail=False, methods=['get', 'put', 'patch', 'delete'], permission_classes=[IsAuthenticated, IsDoctor])
    def me(self, request):
        user = request.user
        try:
            profile = user.doctor_profile
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Doctor profile not found'}, status=404)

        if request.method == 'GET':
            serializer = DoctorSelfSerializer({'user': user, 'doctor_profile': profile})
            return Response(serializer.data)

        if request.method == 'DELETE':
            user.delete()
            return Response(status=204)

        # PUT / PATCH
        user_fields = ['first_name', 'last_name', 'email', 'phone_number', 'username']
        for field in user_fields:
            if field in request.data:
                val = request.data[field]
                if field == 'username' and val != user.username:
                    if User.objects.filter(username=val).exists():
                        return Response({'error': 'Username already taken'}, status=400)
                setattr(user, field, val)
        user.save()

        profile_fields = ['specialization', 'department', 'is_available']
        for field in profile_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])
        profile.save()

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

    # ==================== Medical Director management actions ====================
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsAdminOrMedicalDirector])
    def all_doctors(self, request):
        doctors = User.objects.filter(role='doctor', is_active=True).select_related('doctor_profile')
        serializer = DoctorListSerializer(doctors, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsAdminOrMedicalDirector])
    def toggle_active(self, request, user_id=None):
        doctor = get_object_or_404(User, pk=user_id, role='doctor')
        profile = doctor.doctor_profile
        profile.is_available = not profile.is_available
        profile.save()
        return Response({'is_available': profile.is_available})

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsAdminOrMedicalDirector])
    def update_specialty(self, request, user_id=None):
        doctor = get_object_or_404(User, pk=user_id, role='doctor')
        new_specialty = request.data.get('specialization')
        if new_specialty:
            doctor.doctor_profile.specialization = new_specialty
            doctor.doctor_profile.save()
            return Response({'specialization': new_specialty})
        return Response({'error': 'specialization required'}, status=400)