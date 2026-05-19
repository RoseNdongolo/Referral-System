# doctors/views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import generics
from patients.serializers import ConsultationSerializer

from accounts.permissions import IsMedicalDirector, IsDoctor, IsAdminOrMedicalDirector
from .models import DoctorProfile
from .serializers import (
    DoctorProfileSerializer,
    DoctorSelfSerializer,
    DoctorListSerializer,
    DoctorRegistrationSerializer
)
from hospitals.models import Specialty, HospitalDepartment
from patients.models import Consultation

User = get_user_model()


class DoctorProfileViewSet(ModelViewSet):
    queryset = DoctorProfile.objects.select_related('user', 'specialization', 'department').all()
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
        elif self.action == 'my_consultations':
            permission_classes = [IsAuthenticated, IsDoctor]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        user_id = self.kwargs.get(self.lookup_field)
        doctor_user = get_object_or_404(User, pk=user_id, role='doctor')

        # ✅ Auto‑create profile if missing
        profile, created = DoctorProfile.objects.get_or_create(user=doctor_user)
        if created:
            print(f"Auto-created doctor profile for {doctor_user.username}")

        user_fields = ['first_name', 'last_name', 'email', 'phone_number', 'username', 'is_active']
        for field in user_fields:
            if field in request.data:
                val = request.data[field]
                if field == 'username' and val != doctor_user.username:
                    if User.objects.filter(username=val).exists():
                        return Response({'error': 'Username already taken'}, status=400)
                setattr(doctor_user, field, val)
        doctor_user.save()

        if 'specialization_id' in request.data:
            spec_id = request.data['specialization_id']
            profile.specialization = Specialty.objects.filter(id=spec_id).first() if spec_id else None
        if 'department_id' in request.data:
            dept_id = request.data['department_id']
            profile.department = HospitalDepartment.objects.filter(id=dept_id).first() if dept_id else None
        if 'is_available' in request.data:
            profile.is_available = request.data['is_available']
        profile.save()

        serializer = DoctorListSerializer(doctor_user)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        user_id = self.kwargs.get(self.lookup_field)
        try:
            user = User.objects.get(pk=user_id, role='doctor')
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get', 'put', 'patch', 'delete'], permission_classes=[IsAuthenticated, IsDoctor])
    def me(self, request):
        user = request.user
        # ✅ Auto‑create profile if missing
        profile, created = DoctorProfile.objects.get_or_create(user=user)
        if created:
            print(f"Auto-created doctor profile for {user.username}")

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

        if 'specialization_id' in request.data:
            spec_id = request.data['specialization_id']
            profile.specialization = Specialty.objects.filter(id=spec_id).first() if spec_id else None
        if 'department_id' in request.data:
            dept_id = request.data['department_id']
            profile.department = HospitalDepartment.objects.filter(id=dept_id).first() if dept_id else None
        if 'is_available' in request.data:
            profile.is_available = request.data['is_available']
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

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsAdminOrMedicalDirector])
    def all_doctors(self, request):
        doctors = User.objects.filter(role='doctor', is_active=True).select_related('doctor_profile__specialization', 'doctor_profile__department')
        serializer = DoctorListSerializer(doctors, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsAdminOrMedicalDirector])
    def toggle_active(self, request, user_id=None):
        doctor = get_object_or_404(User, pk=user_id, role='doctor')
        # ✅ Auto‑create profile if missing
        profile, created = DoctorProfile.objects.get_or_create(user=doctor)
        profile.is_available = not profile.is_available
        profile.save()
        return Response({'is_available': profile.is_available})

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsAdminOrMedicalDirector])
    def update_specialty(self, request, user_id=None):
        doctor = get_object_or_404(User, pk=user_id, role='doctor')
        # ✅ Auto‑create profile if missing
        profile, created = DoctorProfile.objects.get_or_create(user=doctor)
        new_specialty_id = request.data.get('specialization_id')
        if new_specialty_id:
            specialty = Specialty.objects.filter(id=new_specialty_id).first()
            profile.specialization = specialty
            profile.save()
            return Response({'specialization_id': specialty.id if specialty else None})
        return Response({'error': 'specialization_id required'}, status=400)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsDoctor])
    def my_consultations(self, request):
        consultations = Consultation.objects.filter(doctor=request.user).select_related('patient')
        data = []
        for c in consultations:
            data.append({
                'id': c.id,
                'patient_name': c.patient.get_full_name() or c.patient.username,
                'patient_mrn': getattr(c.patient.patient_profile, 'medical_record_number', 'N/A'),
                'status': c.status,
                'assigned_at': c.assigned_at,
                'chief_complaint': c.chief_complaint or '', 
            })
        return Response(data)

# doctors/views.py (add at the bottom)

class DoctorConsultationDetailView(generics.RetrieveAPIView):
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer
    permission_classes = [IsAuthenticated, IsDoctor]

    def get_queryset(self):
        return Consultation.objects.filter(doctor=self.request.user)
    

# doctors/views.py (add after DoctorConsultationDetailView)

class DoctorConsultationStatusUpdateView(generics.UpdateAPIView):
    """
    Allows a doctor to update consultation status, diagnosis, test results, and notes.
    """
    permission_classes = [IsAuthenticated, IsDoctor]
    queryset = Consultation.objects.all()
    lookup_field = 'pk'

    def patch(self, request, *args, **kwargs):
        consultation = self.get_object()
        # Ensure the doctor is the assigned doctor
        if consultation.doctor != request.user:
            return Response({'error': 'Not your consultation'}, status=status.HTTP_403_FORBIDDEN)

        # Update status if provided
        if 'status' in request.data:
            consultation.status = request.data['status']
        # Update diagnosis, test_results, notes if provided
        if 'diagnosis' in request.data:
            consultation.diagnosis = request.data['diagnosis']
        if 'test_results' in request.data:
            consultation.test_results = request.data['test_results']
        if 'notes' in request.data:
            consultation.notes = request.data['notes']
        consultation.save()
        return Response({'status': consultation.status, 'message': 'Updated successfully'})