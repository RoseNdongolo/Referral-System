// src/pages/patient/MyReferrals.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import patientService from '../../services/patientService';
import './MyReferrals.css';

export default function MyReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Load referrals initially and then every 30 seconds
  useEffect(() => {
    loadReferrals();
    const interval = setInterval(loadReferrals, 30000); // auto‑refresh every 30 sec
    return () => clearInterval(interval);
  }, []);

  const loadReferrals = () => {
    setLoading(true);
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
        setError('');
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load your referrals. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  // Filter by status and search term
  const filteredReferrals = referrals
    .filter(r => filter === 'all' || r.status === filter)
    .filter(r => {
      const searchLower = search.toLowerCase();
      const hospital = (r.hospital_details?.name || r.hospital_name || '').toLowerCase();
      const specialty = (r.required_specialty || '').toLowerCase();
      const reason = (r.referral_reason || '').toLowerCase();
      return hospital.includes(searchLower) || specialty.includes(searchLower) || reason.includes(searchLower);
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const openModal = (referral) => {
    // Refresh the specific referral details before showing modal
    patientService.getReferralById(referral.id)
      .then(res => setSelectedReferral(res.data))
      .catch(err => {
        console.error('Failed to fetch latest referral details', err);
        setSelectedReferral(referral); // fallback to old data
      });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReferral(null);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="loading-state">Loading your referrals...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="my-referrals-container">
      <div className="referrals-header">
        <h1>My Referrals</h1>
        <p>View your referral history and navigate to the recommended hospital.</p>
        <button onClick={loadReferrals} className="refresh-btn">🔄 Refresh List</button>
      </div>

      {/* Toolbar: Filter, Search, Sort */}
      <div className="toolbar">
        <div className="filter-buttons">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
          <button className={`filter-btn ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>Approved</button>
          <button className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>Rejected</button>
          <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
        </div>
        <div className="search-sort">
          <input
            type="text"
            placeholder="Search by hospital, specialty, reason..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="sort-select">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {/* Referrals Grid */}
      {filteredReferrals.length === 0 ? (
        <div className="empty-state">No referrals found.</div>
      ) : (
        <div className="referrals-grid">
          {filteredReferrals.map(ref => (
            <div key={ref.id} className="referral-card">
              <div className="referral-header">
                <span className="hospital-name">{ref.hospital_details?.name || ref.hospital_name || 'N/A'}</span>
                <span className={`status-badge status-${ref.status}`}>{ref.status}</span>
              </div>
              <div className="referral-details">
                <p><strong>Specialty:</strong> {ref.required_specialty || 'N/A'}</p>
                <p><strong>Reason:</strong> {ref.referral_reason || 'N/A'}</p>
                <p><strong>Diagnosis:</strong> {ref.diagnosis || 'N/A'}</p>
                <p><strong>Created:</strong> {new Date(ref.created_at).toLocaleString()}</p>
                {ref.distance_km && (
                  <p><strong>Distance:</strong> {ref.distance_km} km</p>
                )}
                {ref.estimated_travel_time_minutes && (
                  <p><strong>Est. travel time:</strong> {ref.estimated_travel_time_minutes} min</p>
                )}
              </div>
              <div className="card-actions">
                <button onClick={() => openModal(ref)} className="view-details-btn">View Details</button>
                <Link to={`/patient/map?referral=${ref.id}`} className="navigate-link">
                  Navigate to Hospital →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedReferral && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Referral Details</h2>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body" id="print-area">
              <div className="detail-row">
                <strong>Hospital:</strong> {selectedReferral.hospital_details?.name || selectedReferral.hospital_name || 'N/A'}
              </div>
              <div className="detail-row">
                <strong>Specialty:</strong> {selectedReferral.required_specialty || 'N/A'}
              </div>
              <div className="detail-row">
                <strong>Status:</strong> <span className={`status-badge status-${selectedReferral.status}`}>{selectedReferral.status}</span>
              </div>
              <div className="detail-row">
                <strong>Referral Reason:</strong> {selectedReferral.referral_reason || 'N/A'}
              </div>
              <div className="detail-row">
                <strong>Diagnosis / Clinical Notes:</strong> {selectedReferral.diagnosis || 'N/A'}
              </div>
              {selectedReferral.additional_notes && (
                <div className="detail-row">
                  <strong>Additional Notes:</strong> {selectedReferral.additional_notes}
                </div>
              )}
              {selectedReferral.distance_km && (
                <div className="detail-row">
                  <strong>Distance:</strong> {selectedReferral.distance_km} km
                </div>
              )}
              {selectedReferral.estimated_travel_time_minutes && (
                <div className="detail-row">
                  <strong>Estimated Travel Time:</strong> {selectedReferral.estimated_travel_time_minutes} minutes
                </div>
              )}
              <div className="detail-row">
                <strong>Created At:</strong> {new Date(selectedReferral.created_at).toLocaleString()}
              </div>
            </div>
            <div className="modal-footer">
              <button className="print-btn" onClick={handlePrint}>Print</button>
              <Link to={`/patient/map?referral=${selectedReferral.id}`} className="navigate-modal-btn">
                Navigate to Hospital
              </Link>
              <button className="close-btn-secondary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}