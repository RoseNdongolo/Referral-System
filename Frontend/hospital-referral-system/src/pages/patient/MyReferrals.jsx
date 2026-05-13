import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import patientService from '../../services/patientService';
import './MyReferrals.css';

export default function MyReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientService.getMyReferrals()
      .then(res => {
        let data = [];
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (res.data?.results && Array.isArray(res.data.results)) {
          data = res.data.results;
        } else {
          console.warn('Unexpected referrals response:', res.data);
        }
        setReferrals(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">Loading referrals...</div>;

  return (
    <div className="referrals-container">
      <div className="referrals-header">
        <h1>My Referrals</h1>
      </div>
      {referrals.length === 0 ? (
        <div className="empty-state">No referrals found.</div>
      ) : (
        <div className="referral-grid">
          {referrals.map(ref => (
            <div key={ref.id} className="referral-card">
              <div className="referral-field">
                <strong>Hospital:</strong> {ref.hospital_details?.name}
              </div>
              <div className="referral-field">
                <strong>Specialty required:</strong> {ref.required_specialty}
              </div>
              <div className="referral-field">
                <strong>Reason:</strong> {ref.referral_reason}
              </div>
              <div className="referral-field">
                <strong>Diagnosis:</strong> {ref.diagnosis}
              </div>
              <div className="referral-field">
                <strong>Status:</strong>
                <span className={`status-badge status-${ref.status}`}>{ref.status}</span>
              </div>
              <div className="referral-field">
                <strong>Created:</strong> {new Date(ref.created_at).toLocaleDateString()}
              </div>
              <Link to={`/patient/map?referral=${ref.id}`} className="nav-link">
                Navigate to Hospital →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}