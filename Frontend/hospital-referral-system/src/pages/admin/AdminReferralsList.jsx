// src/pages/admin/AdminReferralsList.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import './AdminReferralsList.css';

export default function AdminReferralsList() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const res = await adminService.getAllReferrals();
      setReferrals(res.data.results || res.data);
      setError('');
    } catch (err) {
      console.error('Fetch error:', err);
      // Check for 401 (Unauthorized)
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login');
        }, 2000);
      } else {
        setError('Failed to load referrals. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (ref) => {
    setEditingId(ref.id);
    setEditData({
      referral_reason: ref.referral_reason || '',
      diagnosis: ref.diagnosis || '',
      clinical_notes: ref.clinical_notes || '',
      test_results: ref.test_results || '',
      status: ref.status,
    });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async (id) => {
    try {
      await adminService.patchReferral(id, editData);
      setEditingId(null);
      fetchReferrals();
    } catch (err) {
      setError('Failed to update referral');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this referral permanently? This cannot be undone.')) return;
    try {
      await adminService.deleteReferral(id);
      fetchReferrals();
    } catch (err) {
      setError('Failed to delete referral');
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/admin/referrals/${id}`);
  };

  if (loading) return <div className="loading-state">Loading referrals...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-referrals-container">
      <h1>All Referrals (Admin)</h1>
      <button onClick={fetchReferrals} className="refresh-btn">🔄 Refresh</button>
      <div className="referrals-table-wrapper">
        <table className="referrals-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Hospital</th>
              <th>Specialty</th>
              <th>Status</th>
              <th>Reason (short)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {referrals.length === 0 ? (
              <tr><td colSpan="7">No referrals found.</td></tr>
            ) : (
              referrals.map(ref => (
                <tr key={ref.id}>
                  <td>{ref.patient_name || ref.patient?.username}</td>
                  <td>{ref.doctor_name || ref.doctor?.username}</td>
                  <td>{ref.hospital_details?.name || ref.hospital_name}</td>
                  <td>{ref.required_specialty}</td>
                  <td>
                    {editingId === ref.id ? (
                      <select name="status" value={editData.status} onChange={handleEditChange}>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                      </select>
                    ) : (
                      <span className={`status-badge status-${ref.status}`}>{ref.status}</span>
                    )}
                  </td>
                  <td>
                    {editingId === ref.id ? (
                      <textarea name="referral_reason" value={editData.referral_reason} onChange={handleEditChange} rows="2" style={{ width: '200px' }} />
                    ) : (
                      ref.referral_reason?.substring(0, 60) + (ref.referral_reason?.length > 60 ? '…' : '')
                    )}
                  </td>
                  <td className="action-buttons">
                    {editingId === ref.id ? (
                      <>
                        <button onClick={() => handleSaveEdit(ref.id)} className="save-btn">Save</button>
                        <button onClick={() => setEditingId(null)} className="cancel-btn">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditClick(ref)} className="edit-btn">Edit</button>
                        <button onClick={() => handleDelete(ref.id)} className="delete-btn">Delete</button>
                        <button onClick={() => handleViewDetail(ref.id)} className="detail-btn">Detail</button>
                      </>
                    )}
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