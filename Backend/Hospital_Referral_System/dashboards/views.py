from django.http import JsonResponse
from django.utils import timezone
from datetime import timedelta

from accounts.models import User
from hospitals.models import Hospital
from referrals.models import Referral


def admin_dashboard_stats(request):
    today = timezone.now().date()
    last_3_days = []

    for i in range(2, -1, -1):
        day = today - timedelta(days=i)
        new_patients = User.objects.filter(role="patient", date_joined__date=day).count()
        total_patients = User.objects.filter(role="patient", date_joined__date__lte=day).count()

        last_3_days.append({
            "date": day.strftime("%Y-%m-%d"),
            "new_patients": new_patients,
            "total_patients": total_patients,
        })

    data = {
        "total_users": User.objects.count(),
        "total_hospitals": Hospital.objects.count(),
        "total_specialists": User.objects.filter(role="doctor").count(),
        "total_referrals": Referral.objects.count(),
        "dental_referrals_percent": 0,
        "orthopedic_referrals_percent": 0,
        "cardiac_referrals_percent": 0,
        "patient_stats": last_3_days,
    }
    return JsonResponse(data)


def admin_recent_referrals(request):
    limit = int(request.GET.get("limit", 5))
    referrals = Referral.objects.select_related("patient", "hospital").order_by("-created_at")[:limit]

    data = []
    for ref in referrals:
        data.append({
            "id": ref.id,
            "patient_name": getattr(ref.patient, "first_name", "") or getattr(ref.patient, "username", "N/A"),
            "hospital_name": getattr(ref.hospital, "name", "N/A"),
            "created_at": ref.created_at.isoformat() if ref.created_at else None,
            "status": getattr(ref, "status", "Pending"),
        })

    return JsonResponse(data, safe=False)


def doctor_dashboard_stats(request):
    data = {
        "assigned_patients": User.objects.filter(role="patient").count(),
        "today_diagnoses": 0,
        "pending_referrals": Referral.objects.filter(status="pending").count(),
    }
    return JsonResponse(data)


def receptionist_dashboard_stats(request):
    data = {
        "today_registrations": User.objects.filter(role="patient", date_joined__date=timezone.now().date()).count(),
        "total_patients": User.objects.filter(role="patient").count(),
        "pending_checkins": 0,
    }
    return JsonResponse(data)


def patient_dashboard_stats(request):
    data = {
        "my_referrals": Referral.objects.count(),
        "pending_referrals": Referral.objects.filter(status="pending").count(),
        "completed_referrals": Referral.objects.filter(status="completed").count(),
    }
    return JsonResponse(data)