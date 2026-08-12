import requests

def get_distance_matrix(origin_coords, dest_coords_list):
    """
    origin_coords: (lon, lat)
    dest_coords_list: list of (lon, lat)
    Returns (durations_sec, distances_m) as two lists.
    Uses public OSRM API (free, no key).
    """
    if not dest_coords_list:
        return [], []
    # Format: lon,lat;lon,lat...
    coords = [f"{origin_coords[0]},{origin_coords[1]}"] + [f"{d[0]},{d[1]}" for d in dest_coords_list]
    url = "http://router.project-osrm.org/table/v1/driving/" + ";".join(coords)
    params = {"annotations": "duration,distance"}
    try:
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        if data.get('code') == 'Ok':
            durations = data['durations'][0][1:]   # skip self
            distances = data['distances'][0][1:]
            return durations, distances
        else:
            print(f"OSRM error: {data.get('code')}")
            return [], []
    except Exception as e:
        print(f"OSRM request failed: {e}")
        return [], []