# views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
import logging

from accounts.permissions import IsReceptionist, IsPatientOwner
from .models import PatientProfile
from .serializers import PatientProfileSerializer, PatientRegistrationSerializer

logger = logging.getLogger(__name__)
User = get_user_model()


class PatientProfileViewSet(ModelViewSet):
    queryset = PatientProfile.objects.select_related('user').all()

    def get_serializer_class(self):
        if self.action == 'create':
            return PatientRegistrationSerializer
        return PatientProfileSerializer

    def get_permissions(self):
        # Receptionist can create, update, delete any patient
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsReceptionist]
        else:
            # 'me' action should be for the patient only
            permission_classes = [IsAuthenticated, IsPatientOwner]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            profile = serializer.save()
            output_serializer = PatientProfileSerializer(profile)
            return Response(output_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.exception("Patient registration failed")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Receptionist can update any patient via the default update method (permission changed)
    # But we need to ensure user fields are also updated. Override update method.
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        profile = self.get_object()
        user = profile.user

        # Update user fields from request data
        user_fields = ['first_name', 'last_name', 'email', 'username']
        for field in user_fields:
            if field in request.data:
                val = request.data[field]
                if field == 'username' and val != user.username:
                    if User.objects.filter(username=val).exists():
                        return Response({'error': 'Username already taken'}, status=400)
                setattr(user, field, val)
        user.save()

        # Update profile fields
        serializer = self.get_serializer(profile, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    # Delete is handled by default destroy (permission changed)

    @action(detail=False, methods=['get', 'put', 'patch', 'delete'], permission_classes=[IsAuthenticated])
    def me(self, request):
        profile = get_object_or_404(PatientProfile, user=request.user)

        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)

        if request.method == 'DELETE':
            request.user.delete()
            return Response(status=204)

        user = request.user
        user_fields = ['first_name', 'last_name', 'email', 'username']
        for field in user_fields:
            if field in request.data:
                val = request.data[field]
                if isinstance(val, str):
                    val = val.strip()
                if field == 'username' and val != user.username:
                    if User.objects.filter(username=val).exists():
                        return Response({'error': 'Username already taken'}, status=400)
                setattr(user, field, val)
        user.save()

        profile_fields = ['address', 'national_id', 'gender', 'date_of_birth', 'phone_number']
        profile_data = {}
        for field in profile_fields:
            if field in request.data:
                val = request.data[field]
                if val == '':
                    val = None
                profile_data[field] = val

        serializer = self.get_serializer(profile, data=profile_data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(self.get_serializer(profile).data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        if not old_password or not new_password:
            return Response({'error': 'Old and new password are required'}, status=400)
        if not user.check_password(old_password):
            return Response({'error': 'Old password is incorrect'}, status=400)
        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters'}, status=400)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully'})