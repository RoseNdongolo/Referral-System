// src/pages/patient/MapPage.jsx
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaExclamationTriangle, FaSyncAlt, FaGoogle, FaShip, FaPlane } from 'react-icons/fa';
import patientService from '../../services/patientService';
import './MapPage.css';

// Custom marker with letter inside a circle
const createLetterIcon = (letter, color, bgColor = 'white') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${bgColor}; color: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; border: 2px solid ${color}; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${letter}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const patientIcon = createLetterIcon('P', '#1a73e8', '#e8f0fe');
const hospitalIcon = createLetterIcon('H', '#d32f2f', '#fce8e6');

const DEFAULT_CENTER = [-6.792354, 39.208328];

// Haversine distance
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Snap to road
const snapToRoad = async (lat, lng) => {
  const url = `https://router.project-osrm.org/nearest/v1/driving/${lng},${lat}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === 'Ok' && data.waypoints?.length) {
      const [snappedLng, snappedLat] = data.waypoints[0].location;
      return { lat: snappedLat, lng: snappedLng };
    }
  } catch (err) { /* ignore */ }
  return { lat, lng };
};

// Route layer component
const RouteLayer = ({ origin, destination, setRouteInfo, setIsLongDistance }) => {
  const map = useMap();
  const [polyline, setPolyline] = useState(null);

  useEffect(() => {
    if (!map || !origin || !destination) return;

    const fetchAndDraw = async () => {
      const dist = haversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);
      
      // If distance > 100 km, skip OSRM – likely cross‑water or long distance
      if (dist > 100) {
        setIsLongDistance(true);
        const distanceKm = dist.toFixed(1);
        const durationMin = Math.round(dist * 2);
        setRouteInfo({ distance: distanceKm, duration: durationMin });

        const straightLine = L.polyline(
          [[origin.lat, origin.lng], [destination.lat, destination.lng]],
          { color: '#FF8C00', weight: 5, opacity: 0.9, dashArray: '8, 6' }
        );
        if (polyline) map.removeLayer(polyline);
        straightLine.addTo(map);
        setPolyline(straightLine);
        map.fitBounds(straightLine.getBounds());
        return;
      }

      // Try OSRM for shorter distances
      const snappedOrigin = await snapToRoad(origin.lat, origin.lng);
      const snappedDest = await snapToRoad(destination.lat, destination.lng);
      const url = `https://router.project-osrm.org/route/v1/driving/${snappedOrigin.lng},${snappedOrigin.lat};${snappedDest.lng},${snappedDest.lat}?overview=full&geometries=geojson`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.code === 'Ok' && data.routes?.length) {
          const route = data.routes[0];
          const distanceKm = (route.distance / 1000).toFixed(1);
          const durationMin = Math.round(route.duration / 60);
          setRouteInfo({ distance: distanceKm, duration: durationMin });
          setIsLongDistance(false);

          const coords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          const newPolyline = L.polyline(coords, {
            color: '#EA4335',
            weight: 5,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round'
          });
          if (polyline) map.removeLayer(polyline);
          newPolyline.addTo(map);
          setPolyline(newPolyline);
          map.fitBounds(newPolyline.getBounds());
          return;
        }
      } catch (err) {
        // fall through to straight line
      }

      // Fallback: straight line
      setIsLongDistance(true);
      const distanceKm = dist.toFixed(1);
      const durationMin = Math.round(dist * 2);
      setRouteInfo({ distance: distanceKm, duration: durationMin });

      const straightLine = L.polyline(
        [[origin.lat, origin.lng], [destination.lat, destination.lng]],
        { color: '#FF8C00', weight: 5, opacity: 0.9, dashArray: '8, 6' }
      );
      if (polyline) map.removeLayer(polyline);
      straightLine.addTo(map);
      setPolyline(straightLine);
      map.fitBounds(straightLine.getBounds());
    };

    fetchAndDraw();
    return () => {
      if (polyline) map.removeLayer(polyline);
    };
  }, [map, origin, destination, setRouteInfo, setIsLongDistance]);

  return null;
};

// Fit bounds to show both markers
const FitBounds = ({ origin, destination }) => {
  const map = useMap();
  useEffect(() => {
    if (origin && destination) {
      const bounds = L.latLngBounds(
        [origin.lat, origin.lng],
        [destination.lat, destination.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [origin, destination, map]);
  return null;
};

// Fullscreen control
const FullscreenControl = () => {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const container = map.getContainer();
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="leaflet-control leaflet-bar" style={{ position: 'absolute', bottom: 20, right: 10, zIndex: 1000 }}>
      <button
        onClick={toggleFullscreen}
        className="fullscreen-btn"
        style={{ background: 'white', border: '2px solid rgba(0,0,0,0.2)', borderRadius: 4, padding: '5px 8px', cursor: 'pointer' }}
      >
        {isFullscreen ? '⤬' : '⤢'}
      </button>
    </div>
  );
};

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const referralId = searchParams.get('referral');
  const [referral, setReferral] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [fallbackLocation, setFallbackLocation] = useState(null);
  const [hospitalLocation, setHospitalLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [geolocationError, setGeolocationError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [isLongDistance, setIsLongDistance] = useState(false);
  const [patientAddress, setPatientAddress] = useState('');
  const watchIdRef = useRef(null);

  // Geolocation
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeolocationError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLiveLocation({ lat: latitude, lng: longitude });
        setGeolocationError(null);
        setUsingFallback(false);
        setLoading(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        let msg = "Unable to get your location. ";
        if (err.code === 1) msg = "Location permission denied. Please allow location access and refresh the page.";
        else if (err.code === 2) msg = "Location unavailable. Check your device settings.";
        else if (err.code === 3) msg = "Location request timed out. Please try again.";
        setGeolocationError(msg);
        if (fallbackLocation) {
          setUsingFallback(true);
          setLoading(false);
        } else {
          setLoading(false);
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [fallbackLocation]);

  // Fetch data
  useEffect(() => {
    if (!referralId) {
      navigate('/patient/my-referrals');
      return;
    }
    fetchData();
  }, [referralId, navigate]);

  const fetchData = async () => {
    try {
      const referralRes = await patientService.getReferralById(referralId);
      setReferral(referralRes.data);

      const profileRes = await patientService.getMyProfile();
      const patient = profileRes.data;
      if (patient.latitude && patient.longitude) {
        setFallbackLocation({
          lat: parseFloat(patient.latitude),
          lng: parseFloat(patient.longitude),
        });
        setPatientAddress(patient.address || 'Patient Location');
      }

      const hospital = referralRes.data.hospital_details;
      if (hospital && hospital.latitude && hospital.longitude) {
        setHospitalLocation({
          lat: parseFloat(hospital.latitude),
          lng: parseFloat(hospital.longitude),
        });
      } else {
        setError('Hospital location missing. Please contact the hospital administrator.');
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) setError('Session expired. Please log in again.');
      else setError('Failed to load map data.');
    } finally {
      setLoading(prev => prev && false);
    }
  };

  const retryGeolocation = () => {
    setGeolocationError(null);
    setLoading(true);
    setUsingFallback(false);
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLiveLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGeolocationError(null);
        setUsingFallback(false);
        setLoading(false);
      },
      (err) => {
        setGeolocationError("Still unable to get location. Please check permissions.");
        if (fallbackLocation) {
          setUsingFallback(true);
          setLoading(false);
        } else {
          setLoading(false);
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  };

  const openGoogleMaps = () => {
    const origin = originLocation;
    if (!origin || !hospitalLocation) return;
    const originStr = `${origin.lat},${origin.lng}`;
    const destStr = `${hospitalLocation.lat},${hospitalLocation.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const openTravelOptions = () => {
    const origin = originLocation;
    if (!origin || !hospitalLocation) return;
    const originStr = `${origin.lat},${origin.lng}`;
    const destStr = `${hospitalLocation.lat},${hospitalLocation.lng}`;
    // Search Google for ferry/flight options
    const query = encodeURIComponent(`ferry from ${origin.lat},${origin.lng} to ${destStr}`);
    const url = `https://www.google.com/search?q=${query}`;
    window.open(url, '_blank');
  };

  const originLocation = liveLocation || fallbackLocation;

  if (loading) return <div className="loading-state">Loading map data...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (geolocationError && !fallbackLocation) {
    return (
      <div className="error-state">
        <p>{geolocationError}</p>
        <button onClick={retryGeolocation} className="retry-btn">Retry</button>
      </div>
    );
  }
  if (!referral || !hospitalLocation || !originLocation) {
    return <div className="error-state">Unable to determine your location. Please update your address in profile.</div>;
  }

  return (
    <div className="map-page">
      <div className="map-header">
        <h1>Navigation to {referral.hospital_details?.name}</h1>
        <p>
          <strong>Distance:</strong> {routeInfo ? `${routeInfo.distance} km` : (referral.distance_km ? `${referral.distance_km} km` : 'Calculating...')} &nbsp;|&nbsp;
          <strong>Est. travel time:</strong> {routeInfo ? `${routeInfo.duration} min` : (referral.estimated_travel_time_minutes ? `${referral.estimated_travel_time_minutes} min` : 'Calculating...')}
          {routeInfo && routeInfo.distance > 100 && <span> (straight‑line estimate – road unavailable)</span>}
        </p>
        <p>Referral reason: {referral.referral_reason}</p>
        {usingFallback && (
          <div className="map-warning">
            <FaExclamationTriangle className="warning-icon" />
            Using saved address as fallback (live location unavailable).
            <button onClick={retryGeolocation} className="retry-gps-btn">Retry GPS</button>
          </div>
        )}
        {isLongDistance && (
          <div className="map-info">
            <FaShip className="info-icon" />
            <strong>Road route not available.</strong> Travel may require ferry or air transport.
            The distance shown is a straight‑line estimate.
            <button onClick={openTravelOptions} className="travel-options-btn">
              <FaPlane className="btn-icon" /> View Travel Options
            </button>
          </div>
        )}
        <div className="button-group">
          <button onClick={() => window.location.reload()} className="center-btn">
            <FaSyncAlt className="btn-icon" /> Refresh location
          </button>
          <button onClick={openGoogleMaps} className="google-maps-btn">
            <FaGoogle className="btn-icon" /> Navigate with Google Maps
          </button>
        </div>
      </div>
      <div className="map-wrapper">
        <MapContainer
          center={[originLocation.lat, originLocation.lng]}
          zoom={13}
          style={{ width: '100%', height: '500px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[originLocation.lat, originLocation.lng]} icon={patientIcon}>
            <Popup>
              <strong>Patient</strong><br />
              {usingFallback ? '📍 Saved address (fallback)' : '📍 Live GPS'}
            </Popup>
          </Marker>
          <Marker position={[hospitalLocation.lat, hospitalLocation.lng]} icon={hospitalIcon}>
            <Popup><strong>{referral.hospital_details?.name}</strong><br />Destination</Popup>
          </Marker>
          <RouteLayer 
            origin={originLocation} 
            destination={hospitalLocation} 
            setRouteInfo={setRouteInfo}
            setIsLongDistance={setIsLongDistance}
          />
          <FitBounds origin={originLocation} destination={hospitalLocation} />
          <FullscreenControl />
        </MapContainer>
      </div>
    </div>
  );
}