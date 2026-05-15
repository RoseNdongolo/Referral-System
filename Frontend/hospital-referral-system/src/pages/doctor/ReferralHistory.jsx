// src/pages/doctor/ReferralHistory.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import doctorService from '../../services/doctorService';
import './ReferralHistory.css';

export default function ReferralHistory() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    doctorService.getAllReferrals()
      .then(res => {
        const data = res.data.results || res.data;
        // Filter to only those created by this doctor (backend should filter automatically if you use doctor_referrals)
        setReferrals(data);
      })
      .catch(err => setError('Failed to load referrals'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="referral-history-container">
      <h1>My Referrals</h1>
      <div className="referrals-table-wrapper">
        <table className="referrals-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>To Hospital</th>
              <th>Specialty</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {referrals.length === 0 ? (
              <tr><td colSpan="6" className="empty-state">No referrals yet.</td></tr>
            ) : (
              referrals.map(r => (
                <tr key={r.id}>
                  <td>{r.patient_name}</td>
                  <td>{r.hospital_details?.name || r.hospital_name || 'N/A'}</td>
                  <td>{r.required_specialty}</td>
                  <td><span className={`status-badge status-${r.status}`}>{r.status}</span></td>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/doctor/referrals/${r.id}`} className="view-btn">View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}