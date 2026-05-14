from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from accounts.models import User
from accounts.permissions import IsReceptionist
from .serializers import ReceptionistSerializer

class ReceptionistViewSet(ModelViewSet):
    queryset = User.objects.filter(role='receptionist')
    serializer_class = ReceptionistSerializer
    permission_classes = [IsAuthenticated, IsReceptionist]

    def get_queryset(self):
        return super().get_queryset().select_related('receptionist_profile')

    @action(detail=False, methods=['get', 'put', 'delete'], permission_classes=[IsAuthenticated, IsReceptionist])
    def me(self, request):
        user = request.user
        if not hasattr(user, 'receptionist_profile'):
            return Response({'error': 'Receptionist profile not found'}, status=404)

        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)

        elif request.method == 'DELETE':
            # Delete the receptionist account
            profile = user.receptionist_profile
            profile.delete()
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        # PUT: update user fields
        user_fields = ['first_name', 'last_name', 'email', 'phone_number', 'username']
        for field in user_fields:
            if field in request.data:
                val = request.data[field].strip() if request.data[field] else ''
                # Check username uniqueness if changed
                if field == 'username' and val != user.username:
                    if User.objects.filter(username=val).exists():
                        return Response({'error': 'Username already taken'}, status=400)
                setattr(user, field, val)
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsReceptionist])
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