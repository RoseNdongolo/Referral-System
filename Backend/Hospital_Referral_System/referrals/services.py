from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from hospitals.models import Hospital


def get_best_hospital(required_specialty):
    return Hospital.objects.filter(
        specialties__name__icontains=required_specialty,
        is_active=True
    ).first()


def get_nearest_matching_hospital(required_specialty, patient_point):
    return Hospital.objects.filter(
        specialties__name__icontains=required_specialty,
        is_active=True,
        location__isnull=False
    ).annotate(
        distance=Distance('location', patient_point)
    ).order_by('distance').first()