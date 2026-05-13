import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import patientService from '../../services/patientService';
import './PatientDashboard.css';

export default function PatientDashboard() {
  const [profile, setProfile] = useState(null);
  const [recentReferrals, setRecentReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, referralsRes] = await Promise.all([
          patientService.getMyProfile(),
          patientService.getMyReferrals(),
        ]);
        setProfile(profileRes.data);

        let referrals = [];
        if (Array.isArray(referralsRes.data)) {
          referrals = referralsRes.data;
        } else if (referralsRes.data?.results && Array.isArray(referralsRes.data.results)) {
          referrals = referralsRes.data.results;
        } else {
          console.warn('Unexpected referrals response structure:', referralsRes.data);
        }

        setRecentReferrals(referrals.slice(0, 3));
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-state">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="welcome-card">
        <h1>Welcome, {profile?.full_name || profile?.username}!</h1>
      </div>

      <div className="info-card">
        <h2>Your Information</h2>
        <p><strong>Medical Record #:</strong> {profile?.medical_record_number}</p>
        <p><strong>Email:</strong> {profile?.email}</p>
        <p><strong>Phone:</strong> {profile?.phone_number || 'Not provided'}</p>
        <Link to="/patient/profile" className="edit-link">Edit Profile →</Link>
      </div>

      <div className="info-card">
        <div className="flex-between">
          <h2>Recent Referrals</h2>
          <Link to="/patient/my-referrals" className="view-link">View all</Link>
        </div>
        {recentReferrals.length === 0 ? (
          <p>No referrals yet.</p>
        ) : (
          <ul className="referral-list">
            {recentReferrals.map(ref => (
              <li key={ref.id} className="referral-item">
                <p><strong>To:</strong> {ref.hospital_details?.name || 'Hospital'}</p>
                <p><strong>Reason:</strong> {ref.referral_reason}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`status-badge status-${ref.status}`}>{ref.status}</span>
                </p>
                <Link to={`/patient/map?referral=${ref.id}`} className="map-link">
                  View on Map →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}