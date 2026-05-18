// src/pages/admin/AdminReferralDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import './AdminReferralDetail.css';

export default function AdminReferralDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReferral();
  }, [id]);

  const fetchReferral = async () => {
    try {
      const res = await adminService.getReferralById(id);
      setReferral(res.data);
      setEditData({
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

  const handleSaveEdit = async () => {
    setUpdating(true);
    try {
      await adminService.patchReferral(id, editData);
      setReferral({ ...referral, ...editData });
      setIsEditing(false);
      alert('Referral updated successfully');
    } catch (err) {
      setError('Failed to update referral');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this referral permanently? This action cannot be undone.')) return;
    try {
      await adminService.deleteReferral(id);
      navigate('/admin/referrals');
    } catch (err) {
      setError('Failed to delete referral');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  if (loading) return <div className="detail-loading">Loading referral details...</div>;
  if (error) return <div className="detail-error">{error}</div>;
  if (!referral) return <div className="detail-error">Referral not found</div>;

  return (
    <div className="detail-container">
      <div className="detail-header">
        <h1>Referral Details (Admin)</h1>
        <button onClick={() => navigate('/admin/referrals')} className="back-btn">← Back to List</button>
      </div>
      <div className="detail-card">
        {!isEditing ? (
          // Read-only view
          <>
            <div className="detail-section">
              <h2>Patient Information</h2>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Patient:</span><span className="detail-value">{referral.patient_name}</span></div>
                <div className="detail-item"><span className="detail-label">MRN:</span><span className="detail-value">{referral.patient_mrn || 'N/A'}</span></div>
              </div>
            </div>
            <div className="detail-section">
              <h2>Referral Information</h2>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">ID:</span><span className="detail-value">#{referral.id}</span></div>
                <div className="detail-item"><span className="detail-label">Status:</span><span className={`status-badge ${getStatusClass(referral.status)}`}>{referral.status}</span></div>
                <div className="detail-item"><span className="detail-label">Specialty:</span><span className="detail-value">{referral.required_specialty}</span></div>
                <div className="detail-item full-width"><span className="detail-label">Referral Reason:</span><span className="detail-value">{referral.referral_reason}</span></div>
              </div>
            </div>
            <div className="detail-section">
              <h2>Clinical Information</h2>
              <div className="detail-grid">
                <div className="detail-item full-width"><span className="detail-label">Diagnosis:</span><span className="detail-value">{referral.diagnosis || 'N/A'}</span></div>
                <div className="detail-item full-width"><span className="detail-label">Clinical Notes:</span><span className="detail-value">{referral.clinical_notes || 'N/A'}</span></div>
                <div className="detail-item full-width"><span className="detail-label">Test Results:</span><span className="detail-value">{referral.test_results || 'N/A'}</span></div>
              </div>
            </div>
            <div className="detail-section">
              <h2>Doctor & Hospital</h2>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Doctor:</span><span className="detail-value">{referral.doctor_name}</span></div>
                <div className="detail-item"><span className="detail-label">Hospital:</span><span className="detail-value">{referral.hospital_details?.name || referral.hospital_name}</span></div>
              </div>
            </div>
            <div className="detail-actions">
              <button onClick={() => setIsEditing(true)} className="edit-btn">Edit Referral</button>
              <button onClick={handleDelete} className="delete-btn">Delete Referral</button>
            </div>
          </>
        ) : (
          // Edit mode
          <div className="edit-form">
            <h2>Edit Referral</h2>
            <div className="form-group"><label>Referral Reason *</label><textarea name="referral_reason" value={editData.referral_reason} onChange={handleEditChange} required /></div>
            <div className="form-group"><label>Diagnosis</label><textarea name="diagnosis" value={editData.diagnosis} onChange={handleEditChange} /></div>
            <div className="form-group"><label>Clinical Notes</label><textarea name="clinical_notes" value={editData.clinical_notes} onChange={handleEditChange} /></div>
            <div className="form-group"><label>Test Results</label><textarea name="test_results" value={editData.test_results} onChange={handleEditChange} /></div>
            <div className="form-group"><label>Status</label><select name="status" value={editData.status} onChange={handleEditChange}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="completed">Completed</option></select></div>
            <div className="form-actions">
              <button onClick={handleSaveEdit} className="save-btn" disabled={updating}>Save Changes</button>
              <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}