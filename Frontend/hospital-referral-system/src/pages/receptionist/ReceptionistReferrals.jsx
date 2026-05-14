import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import receptionistService from '../../services/receptionistService';
import './ReceptionistReferrals.css';

export default function ReceptionistReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    receptionistService.getAllReferrals()
      .then(res => {
        const data = res.data.results || res.data;
        setReferrals(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredReferrals = filter === 'all' ? referrals : referrals.filter(r => r.status === filter);

  if (loading) return <div className="loading-state">Loading referrals...</div>;

  return (
    <div className="referrals-container">
      <h1>All Referrals</h1>
      <div className="filter-bar">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
        <button className={`filter-btn ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>Approved</button>
        <button className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>Rejected</button>
      </div>
      <div className="referrals-grid">
        {filteredReferrals.map(ref => (
          <div key={ref.id} className="referral-card">
            <div className="referral-header">
              <span className="patient-name">{ref.patient_name || ref.patient?.username}</span>
              <span className={`status-badge status-${ref.status}`}>{ref.status}</span>
            </div>
            <div className="referral-details">
              <p><strong>Hospital:</strong> {ref.hospital_details?.name}</p>
              <p><strong>Specialty:</strong> {ref.required_specialty}</p>
              <p><strong>Reason:</strong> {ref.referral_reason}</p>
              <p><strong>Diagnosis:</strong> {ref.diagnosis}</p>
              <p><strong>Doctor:</strong> {ref.doctor_name || ref.doctor?.username}</p>
              <p><strong>Created:</strong> {new Date(ref.created_at).toLocaleString()}</p>
            </div>
            <Link to={`/receptionist/referrals/${ref.id}`} className="view-link">View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}