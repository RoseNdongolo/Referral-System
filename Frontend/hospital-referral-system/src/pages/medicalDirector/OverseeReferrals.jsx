// src/pages/medicalDirector/OverseeReferrals.jsx
import { useEffect, useState } from 'react';
import medicalDirectorService from '../../services/medicalDirectorService';
import './OverseeReferrals.css';

export default function OverseeReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    medicalDirectorService.getAllReferrals()
      .then(res => {
        const data = res.data.results || res.data;
        setReferrals(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredReferrals = referrals
    .filter(r => filter === 'all' || r.status === filter)
    .filter(r => {
      const query = search.toLowerCase();
      return (
        (r.patient_name || '').toLowerCase().includes(query) ||
        (r.doctor_name || '').toLowerCase().includes(query) ||
        (r.hospital_details?.name || '').toLowerCase().includes(query) ||
        (r.required_specialty || '').toLowerCase().includes(query)
      );
    });

  if (loading) return <div className="loading-state">Loading referrals...</div>;

  return (
    <div className="oversee-referrals-container">
      <h1>All Referrals</h1>
      <div className="toolbar">
        <div className="filter-buttons">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
          <button className={`filter-btn ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>Approved</button>
          <button className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>Rejected</button>
          <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
        </div>
        <input
          type="text"
          placeholder="Search by patient, doctor, hospital, specialty..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="referrals-table-wrapper">
        <table className="referrals-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Hospital</th>
              <th>Specialty</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReferrals.length === 0 ? (
              <tr><td colSpan="7" className="empty-state">No referrals found.</td></tr>
            ) : (
              filteredReferrals.map(ref => (
                <tr key={ref.id}>
                  <td>{ref.patient_name || ref.patient?.username}</td>
                  <td>{ref.doctor_name || ref.doctor?.username}</td>
                  <td>{ref.hospital_details?.name || ref.hospital_name}</td>
                  <td>{ref.required_specialty}</td>
                  <td><span className={`status-badge status-${ref.status}`}>{ref.status}</span></td>
                  <td>{new Date(ref.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="view-btn" onClick={() => window.location.href = `/medical-director/referrals/${ref.id}`}>View</button>
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