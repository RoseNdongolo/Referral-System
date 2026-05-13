import requests
from django.conf import settings
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from hospitals.models import Hospital

def get_nearest_matching_hospital(required_specialty, patient_point):
    """Find nearest hospital that has the required specialty (case‑insensitive)."""
    return Hospital.objects.filter(
        specialties__name__iexact=required_specialty,
        is_active=True,
        location__isnull=False
    ).annotate(
        distance=Distance('location', patient_point)
    ).order_by('distance').first()

def fetch_google_maps_data(origin_lat, origin_lng, dest_lat, dest_lng):
    """
    Call Google Maps Distance Matrix API to get real distance, duration, and traffic.
    Replace with your actual API key and call.
    """
    api_key = settings.GOOGLE_MAPS_API_KEY
    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": f"{origin_lat},{origin_lng}",
        "destinations": f"{dest_lat},{dest_lng}",
        "key": api_key,
        "departure_time": "now",
        "traffic_model": "best_guess",
    }
    response = requests.get(url, params=params)
    data = response.json()
    if data['status'] == 'OK':
        element = data['rows'][0]['elements'][0]
        distance_km = element['distance']['value'] / 1000.0
        duration_minutes = element['duration_in_traffic']['value'] / 60.0
        return distance_km, duration_minutes, element.get('duration', {}).get('text'), element.get('duration_in_traffic', {}).get('text')
    return None, None, None, None