import requests

def geocode_address(address):
    """
    Convert address to coordinates using public Nominatim (free, no key).
    Returns (lat, lng) or (None, None).
    """
    if not address:
        return None, None
    headers = {'User-Agent': 'HospitalReferralSystem/1.0 (hospital@referral.com)'}
    url = "https://nominatim.openstreetmap.org/search"
    params = {'q': address, 'format': 'json', 'limit': 1}
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=5)
        data = resp.json()
        if data:
            return float(data[0]['lat']), float(data[0]['lon'])
    except Exception as e:
        print(f"Geocoding error: {e}")
    return None, None