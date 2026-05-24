// src/pages/doctor/ReferralDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import doctorService from '../../services/doctorService';
import './ReferralDetail.css';

export default function ReferralDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [specialties, setSpecialties] = useState([]);        // all specialties
  const [hospitals, setHospitals] = useState([]);            // hospitals filtered by specialty
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  useEffect(() => {
    fetchReferral();
    fetchSpecialties();
  }, [id]);

  const fetchSpecialties = async () => {
    try {
      const res = await doctorService.getAllSpecialties();
      setSpecialties(res.data);
    } catch (err) {
      console.error('Failed to load specialties');
    }
  };

  // When specialty changes in edit mode, fetch hospitals for that specialty
  useEffect(() => {
    if (isEditing && editData.required_specialty) {
      setLoadingHospitals(true);
      doctorService.getHospitalsBySpecialty(editData.required_specialty)
        .then(res => setHospitals(res.data))
        .catch(() => setHospitals([]))
        .finally(() => setLoadingHospitals(false));
    } else {
      setHospitals([]);
    }
  }, [editData.required_specialty, isEditing]);

  const fetchReferral = async () => {
    try {
      const res = await doctorService.getReferralById(id);
      setReferral(res.data);
      setEditData({
        required_specialty: res.data.required_specialty || '',
        hospital_id: res.data.hospital?.id || res.data.hospital,
        referral_reason: res.data.referral_reason || '',
        diagnosis: res.data.diagnosis || '',
        clinical_notes: res.data.clinical_notes || '',
        test_results: res.data.test_results || '',
        status: res.data.status,
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load referral details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // ✅ FIXED: after saving, refetch the referral to get updated hospital details
  const handleSaveEdit = async () => {
    const updatePayload = {
      required_specialty: editData.required_specialty,
      hospital: editData.hospital_id,
      referral_reason: editData.referral_reason,
      diagnosis: editData.diagnosis,
      clinical_notes: editData.clinical_notes,
      test_results: editData.test_results,
    };
    try {
      await doctorService.updateReferral(id, updatePayload);
      // Refetch the entire referral from the server
      await fetchReferral();
      setIsEditing(false);
      setStatusMessage('Referral updated successfully');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      setError('Failed to update referral');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Change status to "${newStatus}"?`)) return;
    setUpdatingStatus(true);
    try {
      await doctorService.updateReferral(id, { status: newStatus });
      // Refetch to ensure status is consistent
      await fetchReferral();
      setStatusMessage(`Status updated to ${newStatus}`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this referral? This action cannot be undone.')) return;
    try {
      await doctorService.deleteReferral(id);
      alert('Referral deleted successfully');
      navigate('/doctor/referral-history');
    } catch (err) {
      setError('Failed to delete referral');
    }
  };

  if (loading) return <div className="loading-state">Loading referral details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!referral) return <div className="error-message">Referral not found</div>;

  return (
    <div className="referral-detail-container">
      <h1>Referral Details</h1>
      {statusMessage && <div className="success-message">{statusMessage}</div>}
      <div className="detail-card">
        {!isEditing ? (
          // Read-only view
          <>
            <div className="detail-row"><strong>Patient:</strong> {referral.patient_name}</div>
            <div className="detail-row"><strong>MRN:</strong> {referral.patient_mrn || 'N/A'}</div>
            <div className="detail-row"><strong>Referring Doctor:</strong> {referral.doctor_name}</div>
            <div className="detail-row"><strong>Target Hospital:</strong> {referral.hospital_details?.name || referral.hospital_name}</div>
            <div className="detail-row"><strong>Specialty:</strong> {referral.required_specialty}</div>
            <div className="detail-row"><strong>Status:</strong> 
              <span className={`status-badge status-${referral.status}`}>{referral.status}</span>
            </div>
            <div className="detail-row"><strong>Referral Reason:</strong> {referral.referral_reason}</div>
            <div className="detail-row"><strong>Diagnosis:</strong> {referral.diagnosis || 'N/A'}</div>
            <div className="detail-row"><strong>Clinical Notes:</strong> {referral.clinical_notes || 'N/A'}</div>
            <div className="detail-row"><strong>Test Results:</strong> {referral.test_results || 'N/A'}</div>
            <div className="detail-row"><strong>Distance:</strong> {referral.distance_km ? `${referral.distance_km} km` : 'N/A'}</div>
            <div className="detail-row"><strong>Travel Time:</strong> {referral.estimated_travel_time_minutes ? `${referral.estimated_travel_time_minutes} min` : 'N/A'}</div>
            <div className="detail-row"><strong>Created:</strong> {new Date(referral.created_at).toLocaleString()}</div>
            <div className="detail-actions">
              <button onClick={() => setIsEditing(true)} className="edit-referral-btn">Edit Referral</button>
              <button onClick={handleDelete} className="delete-referral-btn">Delete Referral</button>
            </div>
          </>
        ) : (
          // Edit mode
          <div className="edit-form">
            <div className="form-group">
              <label>Required Specialty *</label>
              <select name="required_specialty" value={editData.required_specialty} onChange={handleEditChange} required>
                <option value="">-- Select specialty --</option>
                {specialties.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Destination Hospital *</label>
              <select name="hospital_id" value={editData.hospital_id} onChange={handleEditChange} required disabled={loadingHospitals}>
                <option value="">-- Select a hospital --</option>
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} {h.address ? `- ${h.address.substring(0, 40)}` : ''}
                  </option>
                ))}
              </select>
              {loadingHospitals && <small>Loading hospitals...</small>}
              {!loadingHospitals && editData.required_specialty && hospitals.length === 0 && (
                <small style={{color: 'orange'}}>No hospital has this specialty. Choose another specialty.</small>
              )}
            </div>

            <div className="form-group">
              <label>Referral Reason *</label>
              <textarea name="referral_reason" value={editData.referral_reason || ''} onChange={handleEditChange} required />
            </div>
            <div className="form-group">
              <label>Diagnosis</label>
              <textarea name="diagnosis" value={editData.diagnosis || ''} onChange={handleEditChange} />
            </div>
            <div className="form-group">
              <label>Clinical Notes</label>
              <textarea name="clinical_notes" value={editData.clinical_notes || ''} onChange={handleEditChange} />
            </div>
            <div className="form-group">
              <label>Test Results</label>
              <textarea name="test_results" value={editData.test_results || ''} onChange={handleEditChange} />
            </div>
            <div className="form-actions">
              <button onClick={handleSaveEdit} className="save-btn">Save Changes</button>
              <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Status change dropdown (always visible) */}
      <div className="status-change-section">
        <h3>Update Status</h3>
        <select onChange={(e) => handleStatusChange(e.target.value)} value={referral.status} disabled={updatingStatus}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
        {updatingStatus && <span> Updating...</span>}
      </div>

      <div className="detail-actions">
        <Link to="/doctor/referral-history" className="back-btn">Back to History</Link>
      </div>
    </div>
  );
}