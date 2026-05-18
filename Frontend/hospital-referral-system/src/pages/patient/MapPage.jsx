// src/pages/patient/MapPage.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import patientService from '../../services/patientService';
import './MapPage.css';

const DEFAULT_CENTER = { lat: -26.2041, lng: 28.0473 };

// Decode Google’s encoded polyline
const decodePolyline = (encoded) => {
  let points = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let shift = 0, result = 0, byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += deltaLat;
    shift = 0; result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += deltaLng;
    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
};

// Component that fetches and draws the route
const RouteLayer = ({ origin, destination, setRouteInfo }) => {
  const map = useMap();
  const [polyline, setPolyline] = useState(null);

  useEffect(() => {
    if (!map || !origin || !destination) return;

    const fetchRoute = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';

      const requestBody = {
        origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
        destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
        units: 'METRIC',
      };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distanceKm = (route.distanceMeters / 1000).toFixed(1);
          const durationMin = Math.round(parseInt(route.duration.replace('s', '')) / 60);
          setRouteInfo({ distance: distanceKm, duration: durationMin });

          const path = decodePolyline(route.polyline.encodedPolyline);
          if (polyline) polyline.setMap(null);
          const newPolyline = new window.google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 0.7,
            strokeWeight: 4,
          });
          newPolyline.setMap(map);
          setPolyline(newPolyline);
        }
      } catch (error) {
        console.error('Routes API error:', error);
      }
    };

    fetchRoute();
    return () => { if (polyline) polyline.setMap(null); };
  }, [map, origin, destination]);

  return null;
};

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const referralId = searchParams.get('referral');
  const [referral, setReferral] = useState(null);
  const [patientLocation, setPatientLocation] = useState(null);
  const [hospitalLocation, setHospitalLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = import.meta.env.VITE_MAP_ID;

  useEffect(() => {
    if (!envApiKey) {
      setError('Google Maps API key missing.');
      setLoading(false);
      return;
    }
    if (!mapId) {
      setError('Map ID is missing. Please add VITE_MAP_ID to your .env file.');
      setLoading(false);
      return;
    }
    if (!referralId) {
      setError('No referral selected.');
      setLoading(false);
      return;
    }
    fetchData();
  }, [referralId]);

  const fetchData = async () => {
    try {
      const referralRes = await patientService.getReferralById(referralId);
      setReferral(referralRes.data);

      const profileRes = await patientService.getMyProfile();
      const patient = profileRes.data;
      if (patient.latitude && patient.longitude) {
        setPatientLocation({
          lat: parseFloat(patient.latitude),
          lng: parseFloat(patient.longitude),
        });
      } else {
        setError('Patient address not geocoded. Please update your address.');
        return;
      }

      const hospital = referralRes.data.hospital_details;
      if (hospital && hospital.location && hospital.location.coordinates) {
        const [lng, lat] = hospital.location.coordinates;
        setHospitalLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
      } else {
        setError('Hospital location missing.');
        return;
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) setError('Session expired. Please log in again.');
      else setError('Failed to load map data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-state">Loading map data...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!referral || !patientLocation || !hospitalLocation) return null;

  const mapCenter = patientLocation;

  return (
    <div className="map-page">
      <div className="map-header">
        <h1>Navigation to {referral.hospital_details?.name}</h1>
        <p>
          <strong>Distance:</strong> {routeInfo ? `${routeInfo.distance} km` : 'Calculating...'} &nbsp;|&nbsp;
          <strong>Est. travel time:</strong> {routeInfo ? `${routeInfo.duration} min` : 'Calculating...'}
        </p>
        <p>Referral reason: {referral.referral_reason}</p>
      </div>
      <div className="map-wrapper">
        <APIProvider apiKey={envApiKey}>
          <Map
            defaultCenter={mapCenter}
            defaultZoom={12}
            style={{ width: '100%', height: '500px' }}
            mapId={mapId}
          >
            <AdvancedMarker position={patientLocation}>
              <Pin glyph="P" background="#4285F4" borderColor="#fff" />
            </AdvancedMarker>
            <AdvancedMarker position={hospitalLocation}>
              <Pin glyph="H" background="#EA4335" borderColor="#fff" />
            </AdvancedMarker>
            <RouteLayer origin={patientLocation} destination={hospitalLocation} setRouteInfo={setRouteInfo} />
          </Map>
        </APIProvider>
      </div>
    </div>
  );
}