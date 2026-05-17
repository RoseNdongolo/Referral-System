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

  useEffect(() => {
    fetchReferral();
  }, [id]);

  const fetchReferral = async () => {
    try {
      const res = await doctorService.getReferralById(id);
      setReferral(res.data);
      // Only store editable fields in editData
      setEditData({
        referral_reason: res.data.referral_reason || '',
        diagnosis: res.data.diagnosis || '',
        clinical_notes: res.data.clinical_notes || '',
        test_results: res.data.test_results || '',
      });
    } catch (err) {
      setError('Failed to load referral details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async () => {
    try {
      await doctorService.updateReferral(id, editData);
      // Update local referral with new values
      setReferral({ ...referral, ...editData });
      setIsEditing(false);
      alert('Referral updated successfully');
    } catch (err) {
      setError('Failed to update referral');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Change status to "${newStatus}"?`)) return;
    setUpdatingStatus(true);
    try {
      await doctorService.updateReferral(id, { status: newStatus });
      setReferral({ ...referral, status: newStatus });
      setStatusMessage(`Status updated to ${newStatus}`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <div className="loading-state">Loading referral details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!referral) return <div className="error-message">Referral not found</div>;

  const isPending = referral.status === 'pending';
  const canEdit = isPending; // only pending referrals can be edited

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
            <div className="detail-row"><strong>Created:</strong> {new Date(referral.created_at).toLocaleString()}</div>
            {canEdit && (
              <div className="detail-actions">
                <button onClick={() => setIsEditing(true)} className="edit-referral-btn">Edit Referral</button>
              </div>
            )}
          </>
        ) : (
          // Edit mode – only editable fields
          <div className="edit-form">
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
              <button onClick={handleSaveEdit} className="save-btn">Save</button>
              <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Status change dropdown (for pending referrals only) */}
      {isPending && (
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
      )}

      <div className="detail-actions">
        <Link to="/doctor/referral-history" className="back-btn">Back to History</Link>
      </div>
    </div>
  );
}