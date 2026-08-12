# hospitals/models.py
from django.db import models
from patients.services import geocode_address   # reuse the existing geocoding function
import requests

class Specialty(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


def snap_to_road(lat, lng):
    """
    Convert coordinates to the nearest point on a road using OSRM public API.
    Returns (new_lat, new_lng) or the original pair if snapping fails.
    """
    url = f"http://router.project-osrm.org/nearest/v1/driving/{lng},{lat}"
    try:
        resp = requests.get(url, timeout=5)
        data = resp.json()
        if data.get('code') == 'Ok' and data.get('waypoints'):
            snapped_lng, snapped_lat = data['waypoints'][0]['location']
            return snapped_lat, snapped_lng
    except Exception as e:
        print(f"Snapping failed for ({lat},{lng}): {e}")
    return lat, lng


class Hospital(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    address = models.TextField()
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    has_emergency = models.BooleanField(default=False)
    has_surgery = models.BooleanField(default=False)
    has_icu = models.BooleanField(default=False)
    has_laboratory = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    specialties = models.ManyToManyField(Specialty, related_name='hospitals', blank=True)

    def save(self, *args, **kwargs):
        # 1. Auto‑geocode if address exists and coordinates are missing
        if self.address and (self.latitude is None or self.longitude is None):
            lat, lng = geocode_address(self.address)
            if lat is not None and lng is not None:
                self.latitude = lat
                self.longitude = lng

        # 2. If we have coordinates (either from geocoding or manual input), snap them to the nearest road
        if self.latitude is not None and self.longitude is not None:
            snapped_lat, snapped_lng = snap_to_road(float(self.latitude), float(self.longitude))
            self.latitude = snapped_lat
            self.longitude = snapped_lng

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def location(self):
        if self.latitude is not None and self.longitude is not None:
            return {"type": "Point", "coordinates": [float(self.longitude), float(self.latitude)]}
        return None


class HospitalDepartment(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.hospital.name} - {self.name}"