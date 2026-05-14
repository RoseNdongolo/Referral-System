from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from accounts.permissions import IsReceptionist, IsPatientOwner, IsAdmin
from .models import PatientProfile
from .serializers import PatientProfileSerializer


class PatientProfileViewSet(ModelViewSet):
    queryset = PatientProfile.objects.select_related('user').all()
    serializer_class = PatientProfileSerializer

    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [IsAuthenticated, IsReceptionist]
        else:
            permission_classes = [IsAuthenticated, IsPatientOwner]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        email = request.data.get('email', '')
        phone_number = request.data.get('phone_number', '')

        if not username or not password:
            return Response(
                {"error": "Username and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from accounts.models import User
        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already taken"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone_number=phone_number,
            role='patient'
        )

        date_of_birth = request.data.get('date_of_birth')
        if date_of_birth == '':
            date_of_birth = None

        profile_data = {
            'medical_record_number': f"MRN-{user.id}",
            'national_id': request.data.get('national_id') or None,
            'date_of_birth': date_of_birth,
            'gender': request.data.get('gender') or None,
            'address': request.data.get('address') or None,
            'phone_number': phone_number or None,
        }

        serializer = self.get_serializer(data=profile_data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            user.delete()
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(
        detail=False,
        methods=['get', 'put', 'patch', 'delete'],
        permission_classes=[IsAuthenticated]
    )
    def me(self, request):
        profile = get_object_or_404(PatientProfile, user=request.user)

        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)

        elif request.method == 'DELETE':
            user = request.user
            profile.delete()
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        # PUT or PATCH: update user and profile
        user = request.user
        user_fields = ['first_name', 'last_name', 'email', 'phone_number', 'username']

        for field in user_fields:
            if field in request.data:
                val = request.data[field]
                if isinstance(val, str):
                    val = val.strip()
                # For username, check uniqueness if changed
                if field == 'username' and val != user.username:
                    from accounts.models import User
                    if User.objects.filter(username=val).exists():
                        return Response(
                            {'error': 'Username already taken'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                setattr(user, field, val)
        user.save()

        profile_fields = ['address', 'national_id', 'gender', 'date_of_birth']
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

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[IsAuthenticated]
    )
    def change_password(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response(
                {'error': 'Old and new password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(old_password):
            return Response(
                {'error': 'Old password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {'error': 'New password must be at least 8 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        return Response(
            {'message': 'Password changed successfully'},
            status=status.HTTP_200_OK
        )