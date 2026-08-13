// src/pages/patient/PatientDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaClipboardList, FaMap, FaStethoscope, FaHospital } from 'react-icons/fa';
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
        }

        setRecentReferrals(referrals.slice(0, 3));
      } catch (error) {
        // Silent fail in production – error can be sent to a logging service
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-state">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      {/* Welcome card */}
      <div className="welcome-card">
        <h1>Welcome back, {profile?.full_name || profile?.username}!</h1>
        <p>Manage your referrals and personal information</p>
      </div>

      {/* Quick action cards */}
      <div className="quick-actions">
        <Link to="/patient/my-referrals" className="action-card">
          <div className="action-icon">
            <FaClipboardList />
          </div>
          <h3>My Referrals</h3>
          <p>See all your referral history</p>
        </Link>
        <Link to="/patient/map" className="action-card">
          <div className="action-icon">
            <FaMap />
          </div>
          <h3>Navigation Map</h3>
          <p>Get directions to referred hospitals</p>
        </Link>
      </div>

      {/* Recent referrals */}
      <div className="info-card">
        <div className="flex-between">
          <h2>Recent Referrals</h2>
          <Link to="/patient/my-referrals" className="view-link">View all</Link>
        </div>
        {recentReferrals.length === 0 ? (
          <p className="empty-text">No referrals yet.</p>
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