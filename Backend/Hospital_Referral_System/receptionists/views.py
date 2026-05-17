# receptionists/views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from accounts.permissions import IsReceptionist, IsAdminOrMedicalDirector
from .models import ReceptionistProfile
from .serializers import (
    ReceptionistProfileSerializer,
    ReceptionistListSerializer,
    ReceptionistRegistrationSerializer
)

User = get_user_model()


class ReceptionistViewSet(ModelViewSet):
    queryset = ReceptionistProfile.objects.select_related('user').all()
    serializer_class = ReceptionistProfileSerializer
    lookup_field = 'user_id'

    def get_serializer_class(self):
        if self.action == 'create':
            return ReceptionistRegistrationSerializer
        return ReceptionistProfileSerializer

    def get_permissions(self):
        # Medical Director and Admin have full CRUD (list, create, update, delete)
        if self.action in ['list', 'create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsAdminOrMedicalDirector]
        # Receptionists can access their own profile (me) and change password
        elif self.action in ['me', 'change_password']:
            permission_classes = [IsAuthenticated]
        # Medical Director & Admin can list all receptionists via this action
        elif self.action == 'all_receptionists':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsReceptionist]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        user_id = self.kwargs.get(self.lookup_field)
        user = get_object_or_404(User, pk=user_id, role='receptionist')
        try:
            profile = user.receptionist_profile
        except ReceptionistProfile.DoesNotExist:
            return Response({'error': 'Receptionist profile not found'}, status=404)

        # Update user fields
        user_fields = ['first_name', 'last_name', 'email', 'phone_number', 'username']
        for field in user_fields:
            if field in request.data:
                val = request.data[field]
                if field == 'username' and val != user.username:
                    if User.objects.filter(username=val).exists():
                        return Response({'error': 'Username already taken'}, status=400)
                setattr(user, field, val)
        user.save()

        # Update profile fields
        profile_fields = ['employee_id', 'desk_number', 'shift', 'is_active']
        for field in profile_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])
        profile.save()

        # Return updated data using list serializer
        output_serializer = ReceptionistListSerializer(user)
        return Response(output_serializer.data)

    def destroy(self, request, *args, **kwargs):
        user_id = self.kwargs.get(self.lookup_field)
        try:
            user = User.objects.get(pk=user_id, role='receptionist')
            user.delete()  # cascade deletes profile
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'error': 'Receptionist not found'}, status=404)

    @action(detail=False, methods=['get'])
    def all_receptionists(self, request):
        """Return all receptionists with profile details (for Medical Director or Admin)."""
        # Manual role check (though permission now allows any authenticated user)
        if not (request.user.role == 'medical_director' or request.user.is_superuser or request.user.role == 'admin'):
            return Response({'error': 'Permission denied'}, status=403)
        receptionists = User.objects.filter(role='receptionist', is_active=True).select_related('receptionist_profile')
        serializer = ReceptionistListSerializer(receptionists, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get', 'put', 'patch', 'delete'])
    def me(self, request):
        user = request.user
        if user.role != 'receptionist':
            return Response({'error': 'Access denied – not a receptionist'}, status=403)

        try:
            profile = user.receptionist_profile
        except ReceptionistProfile.DoesNotExist:
            profile = ReceptionistProfile.objects.create(
                user=user,
                employee_id=f"EMP-{user.id}",
                is_active=True
            )
            print(f"Created missing profile for receptionist {user.username}")

        if request.method == 'GET':
            serializer = ReceptionistListSerializer(user)
            return Response(serializer.data)

        if request.method == 'DELETE':
            user.delete()
            return Response(status=204)

        user_fields = ['first_name', 'last_name', 'email', 'phone_number', 'username']
        for field in user_fields:
            if field in request.data:
                val = request.data[field]
                if field == 'username' and val != user.username:
                    if User.objects.filter(username=val).exists():
                        return Response({'error': 'Username already taken'}, status=400)
                setattr(user, field, val)
        user.save()

        serializer = ReceptionistListSerializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
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