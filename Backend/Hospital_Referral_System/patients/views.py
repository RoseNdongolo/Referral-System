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
        """
        - create: only receptionists (or admins) – as per your document.
        - list / retrieve / update / delete: staff OR the patient owner.
        """
        if self.action == 'create':
            permission_classes = [IsAuthenticated, IsReceptionist]
        else:
            permission_classes = [IsAuthenticated, IsPatientOwner]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        """
        Create a new patient profile together with its associated User.
        Receptionist-only endpoint.
        """
        # Extract user fields
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

        # Create the User with role='patient'
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
            phone_number=phone_number,   # stored in User (can be removed later)
            role='patient'
        )

        # Prepare patient profile data
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
            # Rollback – delete the created user
            user.delete()
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get or update the logged‑in patient's own profile."""
        profile = get_object_or_404(PatientProfile, user=request.user)
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        # PUT / PATCH
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)