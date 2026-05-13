import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import patientService from '../../services/patientService';
import './MapPage.css';

const containerStyle = { width: '100%', height: '500px' };

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const referralId = searchParams.get('referral');
  const [referral, setReferral] = useState(null);
  const [patientLocation, setPatientLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!referralId) {
      setLoading(false);
      return;
    }
    patientService.getReferralById(referralId)
      .then(res => setReferral(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [referralId]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setPatientLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => console.warn('Geolocation error:', err)
      );
    }
  }, []);

  useEffect(() => {
    if (patientLocation && referral?.hospital_details?.location) {
      const dest = {
        lat: referral.hospital_details.location.coordinates[1],
        lng: referral.hospital_details.location.coordinates[0],
      };
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: patientLocation,
          destination: dest,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') setDirections(result);
        }
      );
    }
  }, [patientLocation, referral]);

  const mapCenter = patientLocation || { lat: -1.286389, lng: 36.817223 };

  if (loading) return <div className="loading-state">Loading map data...</div>;
  if (!referralId) return <div className="error-state">No referral selected. Please go to My Referrals first.</div>;
  if (!referral) return <div className="error-state">Referral not found.</div>;

  return (
    <div className="map-page">
      <div className="map-header">
        <h1>Navigation to {referral.hospital_details?.name}</h1>
        <p>Referral reason: {referral.referral_reason}</p>
      </div>
      <div className="map-wrapper">
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={12}>
            {patientLocation && <Marker position={patientLocation} label="You" />}
            {referral.hospital_details?.location && (
              <Marker
                position={{
                  lat: referral.hospital_details.location.coordinates[1],
                  lng: referral.hospital_details.location.coordinates[0],
                }}
                label="Hospital"
              />
            )}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}