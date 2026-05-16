import requests
from django.conf import settings

def geocode_address(address):
    """Convert address to (latitude, longitude) using Google Maps Geocoding API."""
    if not address:
        return None, None
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": address, "key": settings.GOOGLE_MAPS_API_KEY}
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            if data["status"] == "OK":
                location = data["results"][0]["geometry"]["location"]
                return location["lat"], location["lng"]
    except Exception:
        pass
    return None, None