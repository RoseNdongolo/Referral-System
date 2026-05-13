from django.urls import path
from .views import (
    admin_dashboard_stats,
    admin_recent_referrals,
    doctor_dashboard_stats,
    receptionist_dashboard_stats,
    patient_dashboard_stats,
    medical_director_dashboard_stats,   # new import
)

urlpatterns = [
    path("admin/dashboard-stats/", admin_dashboard_stats, name="admin-dashboard-stats"),
    path("admin/recent-referrals/", admin_recent_referrals, name="admin-recent-referrals"),
    path("doctor/dashboard-stats/", doctor_dashboard_stats, name="doctor-dashboard-stats"),
    path("receptionist/dashboard-stats/", receptionist_dashboard_stats, name="receptionist-dashboard-stats"),
    path("patient/dashboard-stats/", patient_dashboard_stats, name="patient-dashboard-stats"),
    path("medical-director/dashboard-stats/", medical_director_dashboard_stats, name="medical-director-dashboard-stats"),
]