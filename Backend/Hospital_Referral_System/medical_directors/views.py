from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from accounts.permissions import IsMedicalDirector
from .models import MedicalDirectorProfile
from .serializers import MedicalDirectorSelfSerializer, MedicalDirectorProfileSerializer

User = get_user_model()

class MedicalDirectorViewSet(GenericViewSet, RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin):
    """
    ViewSet for medical director accounts. Provides /me/ endpoint.
    Only users with role='medical_director' are accessible.
    """
    queryset = MedicalDirectorProfile.objects.select_related('user').all()
    serializer_class = MedicalDirectorProfileSerializer
    permission_classes = [IsAuthenticated, IsMedicalDirector]

    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)

    @action(detail=False, methods=['get', 'put', 'delete'], permission_classes=[IsAuthenticated, IsMedicalDirector])
    def me(self, request):
        user = request.user
        try:
            profile = user.medical_director_profile
        except MedicalDirectorProfile.DoesNotExist:
            return Response({'error': 'Medical Director profile not found'}, status=404)

        if request.method == 'GET':
            serializer = MedicalDirectorSelfSerializer({'user': user, 'medical_director_profile': profile})
            return Response(serializer.data)

        if request.method == 'DELETE':
            user.delete()
            return Response(status=204)

        # PUT: update user fields and profile
        user_fields = ['first_name', 'last_name', 'email', 'phone_number', 'username']
        for field in user_fields:
            if field in request.data:
                val = request.data[field]
                if field == 'username' and val != user.username:
                    if User.objects.filter(username=val).exists():
                        return Response({'error': 'Username already taken'}, status=400)
                setattr(user, field, val)
        user.save()

        profile_fields = ['staff_code', 'department', 'office_number', 'is_active']
        for field in profile_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])
        profile.save()

        serializer = MedicalDirectorSelfSerializer({'user': user, 'medical_director_profile': profile})
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsMedicalDirector])
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