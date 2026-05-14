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
        print("📥 PATIENT CREATE - Data:", request.data)

        username = request.data.get('username')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        email = request.data.get('email', '')
        phone_number = request.data.get('phone_number', '')
        national_id = request.data.get('national_id')
        date_of_birth = request.data.get('date_of_birth')
        gender = request.data.get('gender')
        address = request.data.get('address', '')

        # Basic validation
        if not username or not password:
            return Response({"error": "Username and password are required"}, status=400)
        if not first_name or not last_name:
            return Response({"error": "First name and last name are required"}, status=400)
        if not email:
            return Response({"error": "Email is required"}, status=400)

        from accounts.models import User
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=400)

        # Create user
        try:
            user = User.objects.create_user(
                username=username,
                password=password,
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone_number=phone_number,
                role='patient'
            )
        except Exception as e:
            return Response({"error": f"User creation failed: {str(e)}"}, status=400)

        # Clean optional fields
        if date_of_birth == '':
            date_of_birth = None
        if gender == '':
            gender = None

        profile_data = {
            'medical_record_number': f"MRN-{user.id}",
            'national_id': national_id or None,
            'date_of_birth': date_of_birth,
            'gender': gender,
            'address': address or None,
            'phone_number': phone_number or None,
        }

        serializer = self.get_serializer(data=profile_data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            user.delete()
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get', 'put', 'patch', 'delete'], permission_classes=[IsAuthenticated])
    def me(self, request):
        profile = get_object_or_404(PatientProfile, user=request.user)
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        elif request.method == 'DELETE':
            request.user.delete()
            profile.delete()
            return Response(status=204)

        # PUT or PATCH
        user = request.user
        user_fields = ['first_name', 'last_name', 'email', 'phone_number', 'username']
        for field in user_fields:
            if field in request.data:
                val = request.data[field].strip() if isinstance(request.data[field], str) else request.data[field]
                if field == 'username' and val != user.username:
                    from accounts.models import User
                    if User.objects.filter(username=val).exists():
                        return Response({'error': 'Username already taken'}, status=400)
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