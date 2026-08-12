# patients/views.py
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
import logging
import time   # <-- added for generating MRN

from accounts.permissions import IsReceptionist, IsPatientOwner, IsDoctor, IsAdminOrMedicalDirector, IsReceptionistOrMedicalDirector
from .models import PatientProfile, Consultation
from .serializers import (
    PatientProfileSerializer,
    PatientRegistrationSerializer,
    UnassignedPatientSerializer,
    ActiveDoctorSerializer,
    AssignPatientSerializer,
    ConsultationSerializer
)

logger = logging.getLogger(__name__)
User = get_user_model()


class PatientProfileViewSet(ModelViewSet):
    queryset = PatientProfile.objects.select_related('user').all()
    serializer_class = PatientProfileSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return PatientRegistrationSerializer
        return PatientProfileSerializer

    def get_permissions(self):
        # Allow receptionists AND medical directors (and admins) to manage patients
        if self.action in ['list', 'create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsReceptionistOrMedicalDirector]
        elif self.action in ['me', 'change_password']:
            permission_classes = [IsAuthenticated, IsPatientOwner]
        elif self.action in ['unassigned_patients', 'active_doctors', 'assign_patient', 'assigned_patients', 'unassign']:
            permission_classes = [IsAuthenticated, IsReceptionist]
        elif self.action in ['my_consultations', 'update_consultation_status', 'consultation_detail']:
            permission_classes = [IsAuthenticated, IsDoctor]
        # Add patient consultation actions
        elif self.action in ['patient_consultations', 'patient_consultation_detail']:
            permission_classes = [IsAuthenticated, IsPatientOwner]
        else:
            permission_classes = [IsAuthenticated, IsPatientOwner]
        return [permission() for permission in permission_classes]

    # ==================== Standard CRUD ====================
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

    # UPDATED update method with password handling
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        profile = self.get_object()
        user = profile.user

        # Update user fields (excluding password)
        user_fields = ['first_name', 'last_name', 'email', 'username']
        for field in user_fields:
            if field in request.data:
                val = request.data[field]
                if field == 'username' and val != user.username:
                    if User.objects.filter(username=val).exists():
                        return Response({'error': 'Username already taken'}, status=400)
                setattr(user, field, val)

        # Handle password change if provided
        if 'password' in request.data and request.data['password']:
            user.set_password(request.data['password'])
            user.save()
        else:
            user.save()

        # Update profile fields
        profile_fields = ['address', 'national_id', 'gender', 'date_of_birth', 'phone_number']
        profile_data = {}
        for field in profile_fields:
            if field in request.data:
                val = request.data[field]
                if val == '':
                    val = None
                profile_data[field] = val

        serializer = self.get_serializer(profile, data=profile_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(self.get_serializer(profile).data)

    # ==================== Patient self‑service ====================
    @action(detail=False, methods=['get', 'put', 'patch', 'delete'], permission_classes=[IsAuthenticated])
    def me(self, request):
        # ✅ Auto-create patient profile if it does not exist
        profile, created = PatientProfile.objects.get_or_create(
            user=request.user,
            defaults={
                'medical_record_number': f"MRN-{request.user.id}-{int(time.time())}",
                'phone_number': request.user.phone_number or '',
            }
        )
        if created:
            logger.info(f"Auto-created patient profile for {request.user.username}")

        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)

        if request.method == 'DELETE':
            request.user.delete()
            return Response(status=204)

        # PUT / PATCH
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

    # ==================== Receptionist actions ====================
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsReceptionist])
    def unassigned_patients(self, request):
        patients_with_open_consult = Consultation.objects.filter(
            status__in=['assigned', 'in_progress']
        ).values_list('patient_id', flat=True)
        patients = User.objects.filter(role='patient', is_active=True).exclude(id__in=patients_with_open_consult)
        serializer = UnassignedPatientSerializer(patients, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsReceptionist])
    def active_doctors(self, request):
        doctors = User.objects.filter(role='doctor', is_active=True)
        serializer = ActiveDoctorSerializer(doctors, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsReceptionist])
    def assign_patient(self, request):
        serializer = AssignPatientSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            consultation = serializer.save()
            return Response(
                {"message": "Patient assigned successfully", "consultation_id": consultation.id},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsReceptionist])
    def assigned_patients(self, request):
        consultations = Consultation.objects.select_related('patient', 'doctor', 'assigned_by').all().order_by('-assigned_at')
        data = []
        for c in consultations:
            data.append({
                'id': c.id,
                'patient_id': c.patient.id,
                'patient_name': f"{c.patient.first_name} {c.patient.last_name}".strip() or c.patient.username,
                'patient_mrn': getattr(c.patient.patient_profile, 'medical_record_number', 'N/A'),
                'doctor_id': c.doctor.id,
                'doctor_name': f"Dr. {c.doctor.first_name} {c.doctor.last_name}".strip() or c.doctor.username,
                'status': c.get_status_display(),
                'assigned_at': c.assigned_at.strftime('%Y-%m-%d %H:%M'),
                'chief_complaint': c.chief_complaint or '',
                'notes': c.notes or '',
            })
        return Response(data)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, IsReceptionist])
    def unassign(self, request, pk=None):
        try:
            consultation = Consultation.objects.get(pk=pk)
            patient_name = consultation.patient.get_full_name() or consultation.patient.username
            doctor_name = consultation.doctor.get_full_name() or consultation.doctor.username
            consultation.delete()
            return Response({
                "message": f"Patient {patient_name} has been unassigned from Dr. {doctor_name}"
            }, status=status.HTTP_200_OK)
        except Consultation.DoesNotExist:
            return Response({"error": "Consultation not found"}, status=status.HTTP_404_NOT_FOUND)

    # ==================== Doctor actions ====================
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsDoctor])
    def my_consultations(self, request):
        consultations = Consultation.objects.filter(doctor=request.user).order_by('-assigned_at')
        serializer = ConsultationSerializer(consultations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsDoctor])
    def update_consultation_status(self, request, pk=None):
        consultation = get_object_or_404(Consultation, pk=pk, doctor=request.user)
        new_status = request.data.get('status')
        if new_status not in dict(Consultation.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=400)
        consultation.status = new_status
        consultation.save()
        return Response({'status': consultation.status})

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsDoctor])
    def consultation_detail(self, request, pk=None):
        consultation = get_object_or_404(Consultation, pk=pk, doctor=request.user)
        serializer = ConsultationSerializer(consultation)
        return Response(serializer.data)

    # ==================== Patient consultation actions (for viewing results) ====================
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsPatientOwner], url_path='my-consultations')
    def patient_consultations(self, request):
        """Return consultations for the logged-in patient."""
        consultations = Consultation.objects.filter(patient=request.user).select_related('doctor')
        serializer = ConsultationSerializer(consultations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsPatientOwner], url_path='consultation-detail')
    def patient_consultation_detail(self, request, pk=None):
        """Return a single consultation detail for the patient."""
        consultation = get_object_or_404(Consultation, pk=pk, patient=request.user)
        serializer = ConsultationSerializer(consultation)
        return Response(serializer.data)
    


    @action(detail=False, methods=['get'], url_path='referral/(?P<consultation_id>[^/.]+)/nearest-hospitals')
    def nearest_hospitals_for_referral(self, request, consultation_id):
        from django.shortcuts import get_object_or_404
        from hospitals.models import Hospital
        from hospitals.services import get_distance_matrix
        consultation = get_object_or_404(Consultation, id=consultation_id, patient=request.user)
        specialty = consultation.required_specialty
        if not specialty:
            return Response({"error": "Referral has no specialty"}, status=400)
        profile = request.user.patient_profile
        if not profile.latitude or not profile.longitude:
            return Response({"error": "Patient location missing"}, status=400)
        hospitals_qs = Hospital.objects.filter(is_active=True, specialties__name__iexact=specialty).distinct()
        valid = [(h, float(h.longitude), float(h.latitude)) for h in hospitals_qs if h.longitude and h.latitude]
        if not valid:
            return Response({"error": f"No hospitals with specialty '{specialty}' have coordinates"}, status=404)
        hospitals_list, lons, lats = zip(*[(h, lon, lat) for h, lon, lat in valid])
        dest_coords = [(lon, lat) for lon, lat in zip(lons, lats)]
        patient_coord = (float(profile.longitude), float(profile.latitude))
        durations, distances = get_distance_matrix(patient_coord, dest_coords)
        results = []
        for idx, h in enumerate(hospitals_list):
            results.append({
                "id": h.id,
                "name": h.name,
                "distance_km": round(distances[idx]/1000, 2),
                "duration_min": round(durations[idx]/60, 1),
                "address": h.address,
                "recommended": False
            })
        results.sort(key=lambda x: x["distance_km"])
        if results:
            results[0]["recommended"] = True
        return Response({"specialty": specialty, "hospitals": results})