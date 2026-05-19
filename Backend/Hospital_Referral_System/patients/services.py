# patients/services.py
import requests
from django.conf import settings

def geocode_address(address):
    """
    Convert an address string to latitude and longitude using Google Geocoding API.
    Returns (lat, lng) tuple or (None, None) on error.
    """
    if not address:
        return None, None
    
    api_key = getattr(settings, 'GOOGLE_MAPS_API_KEY', None)
    if not api_key:
        print("Google Maps API key not configured")
        return None, None
    
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        'address': address,
        'key': api_key
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        if data['status'] == 'OK' and data['results']:
            location = data['results'][0]['geometry']['location']
            lat = location['lat']
            lng = location['lng']
            return lat, lng
        else:
            print(f"Geocoding failed for '{address}': {data['status']}")
            return None, None
    except Exception as e:
        print(f"Geocoding error: {e}")
        return None, None