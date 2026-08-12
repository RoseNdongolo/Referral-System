# referrals/services.py
import requests
from math import radians, sin, cos, sqrt, atan2
from hospitals.models import Hospital

def haversine(lat1, lng1, lat2, lng2):
    """Straight-line distance in km."""
    R = 6371
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

def get_osrm_distance_and_time(origin_lat, origin_lng, dest_lat, dest_lng):
    """
    Use public OSRM API to get driving distance (km) and time (minutes).
    Returns (distance_km, duration_min) or (None, None) on failure.
    """
    url = f"https://router.project-osrm.org/route/v1/driving/{origin_lng},{origin_lat};{dest_lng},{dest_lat}"
    try:
        resp = requests.get(url, timeout=5)
        data = resp.json()
        if data.get('code') == 'Ok' and data.get('routes'):
            route = data['routes'][0]
            dist_km = route['distance'] / 1000.0
            dur_min = route['duration'] / 60.0
            return round(dist_km, 2), round(dur_min)
    except Exception as e:
        print(f"OSRM error: {e}")
    return None, None

def get_distance_and_time(origin_lat, origin_lng, dest_lat, dest_lng):
    """
    Try OSRM first; fallback to straight-line (Haversine) with 2 min/km estimate.
    Returns (distance_km, duration_min).
    """
    dist_km, dur_min = get_osrm_distance_and_time(origin_lat, origin_lng, dest_lat, dest_lng)
    if dist_km is None:
        dist_km = haversine(origin_lat, origin_lng, dest_lat, dest_lng)
        dur_min = dist_km * 2  # rough estimate (2 min per km)
    return dist_km, dur_min

def get_nearest_matching_hospital(required_specialty, patient_lat, patient_lng):
    """
    Find nearest hospital (by Haversine) that has the required specialty and valid coordinates.
    Returns the Hospital object or None.
    """
    candidates = Hospital.objects.filter(
        specialties__name__iexact=required_specialty,
        is_active=True,
        latitude__isnull=False,
        longitude__isnull=False
    ).distinct()
    if not candidates:
        return None
    best = None
    best_dist = float('inf')
    for h in candidates:
        dist = haversine(patient_lat, patient_lng, float(h.latitude), float(h.longitude))
        if dist < best_dist:
            best_dist = dist
            best = h
    return best