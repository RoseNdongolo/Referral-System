import { useEffect, useState } from 'react';
import receptionistService from '../../services/receptionistService';
import './ReceptionistReferrals.css';

export default function ReceptionistReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = () => {
    receptionistService.getAllReferrals()
      .then(res => {
        const data = res.data.results || res.data;
        setReferrals(data);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load referrals. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  // Filter by status and search term
  const filteredReferrals = referrals
    .filter(r => filter === 'all' || r.status === filter)
    .filter(r => {
      const searchLower = search.toLowerCase();
      const patientName = (r.patient_name || r.patient?.username || '').toLowerCase();
      const patientMrn = (r.patient_mrn || '').toLowerCase();
      const hospital = (r.hospital_details?.name || r.hospital_name || '').toLowerCase();
      const doctor = (r.doctor_name || r.doctor?.username || '').toLowerCase();
      return patientName.includes(searchLower) || 
             patientMrn.includes(searchLower) ||
             hospital.includes(searchLower) ||
             doctor.includes(searchLower);
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const openModal = (referral) => {
    setSelectedReferral(referral);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReferral(null);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="loading-state">Loading referrals...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="referrals-container">
      <h1>All Referrals</h1>

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
            placeholder="Search by patient, MRN, hospital, doctor..."
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
                <span className="patient-name">{ref.patient_name || ref.patient?.username}</span>
                <span className={`status-badge status-${ref.status}`}>{ref.status}</span>
              </div>
              <div className="referral-details">
                <p><strong>Hospital:</strong> {ref.hospital_details?.name || ref.hospital_name || 'N/A'}</p>
                <p><strong>Specialty:</strong> {ref.required_specialty || 'N/A'}</p>
                <p><strong>Reason:</strong> {ref.referral_reason || 'N/A'}</p>
                <p><strong>Diagnosis:</strong> {ref.diagnosis || 'N/A'}</p>
                <p><strong>Doctor:</strong> {ref.doctor_name || ref.doctor?.username}</p>
                <p><strong>Created:</strong> {new Date(ref.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => openModal(ref)} className="view-link">View Details</button>
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
                <strong>Patient:</strong> {selectedReferral.patient_name || selectedReferral.patient?.username}
              </div>
              <div className="detail-row">
                <strong>MRN:</strong> {selectedReferral.patient_mrn || 'N/A'}
              </div>
              <div className="detail-row">
                <strong>Referring Doctor:</strong> {selectedReferral.doctor_name || selectedReferral.doctor?.username}
              </div>
              <div className="detail-row">
                <strong>Target Hospital:</strong> {selectedReferral.hospital_details?.name || selectedReferral.hospital_name}
              </div>
              <div className="detail-row">
                <strong>Specialist / Department:</strong> {selectedReferral.required_specialty || 'N/A'}
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
              <div className="detail-row">
                <strong>Created At:</strong> {new Date(selectedReferral.created_at).toLocaleString()}
              </div>
              <div className="detail-row">
                <strong>Last Updated:</strong> {selectedReferral.updated_at ? new Date(selectedReferral.updated_at).toLocaleString() : 'N/A'}
              </div>
              {selectedReferral.additional_notes && (
                <div className="detail-row">
                  <strong>Additional Notes:</strong> {selectedReferral.additional_notes}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="print-btn" onClick={handlePrint}>Print</button>
              <button className="close-btn-secondary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}