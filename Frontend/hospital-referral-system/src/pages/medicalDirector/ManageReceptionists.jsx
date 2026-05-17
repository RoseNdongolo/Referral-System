// src/pages/medicalDirector/ManageReceptionists.jsx
import { useEffect, useState } from 'react';
import medicalDirectorService from '../../services/medicalDirectorService';
import './ManageReceptionists.css';

export default function ManageReceptionists() {
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    employee_id: '',
    desk_number: '',
    shift: '',
    is_active: true
  });

  useEffect(() => {
    fetchReceptionists();
  }, []);

  const fetchReceptionists = async () => {
    try {
      const res = await medicalDirectorService.getAllReceptionists();
      setReceptionists(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load receptionists');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        // Update: remove password fields if empty
        const updateData = { ...formData };
        delete updateData.confirm_password;
        if (!updateData.password) delete updateData.password;
        await medicalDirectorService.updateReceptionist(editingId, updateData);
      } else {
        // Create: validate password
        if (!formData.password || formData.password !== formData.confirm_password) {
          setError('Password and confirm password must match');
          return;
        }
        const createData = { ...formData };
        delete createData.confirm_password;
        await medicalDirectorService.createReceptionist(createData);
      }
      resetForm();
      await fetchReceptionists(); // refresh list
    } catch (err) {
      console.error('Save error:', err);
      const msg = err.response?.data?.error || err.response?.data?.username?.[0] || 'Operation failed';
      setError(msg);
    }
  };

  const openModal = (receptionist = null) => {
    setEditingId(receptionist?.receptionist_id || null);
    if (receptionist) {
      setFormData({
        username: receptionist.username || '',
        password: '',
        confirm_password: '',
        first_name: receptionist.first_name || '',
        last_name: receptionist.last_name || '',
        email: receptionist.email || '',
        phone_number: receptionist.phone_number || '',
        employee_id: receptionist.employee_id || '',
        desk_number: receptionist.desk_number || '',
        shift: receptionist.shift || '',
        is_active: receptionist.is_active !== undefined ? receptionist.is_active : true
      });
    } else {
      setFormData({
        username: '', password: '', confirm_password: '',
        first_name: '', last_name: '', email: '', phone_number: '',
        employee_id: '', desk_number: '', shift: '', is_active: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      username: '', password: '', confirm_password: '',
      first_name: '', last_name: '', email: '', phone_number: '',
      employee_id: '', desk_number: '', shift: '', is_active: true
    });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this receptionist permanently?')) {
      try {
        await medicalDirectorService.deleteReceptionist(id);
        await fetchReceptionists();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await medicalDirectorService.toggleReceptionistActive(id, !currentStatus);
      await fetchReceptionists();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="loading-state">Loading receptionists...</div>;

  return (
    <div className="manage-receptionists-container">
      <h1>Manage Receptionists</h1>
      <button className="add-btn" onClick={() => openModal()}>+ Add Receptionist</button>

      <div className="receptionists-table-wrapper">
        <table className="receptionists-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Shift</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {receptionists.length === 0 ? (
              <tr>
                <td colSpan="7">No receptionists found.</td>
              </tr>
            ) : (
              receptionists.map(r => (
                <tr key={r.receptionist_id}>
                  <td>{r.employee_id}</td>
                  <td>{r.full_name}</td>
                  <td>{r.username}</td>
                  <td>{r.email}</td>
                  <td>{r.shift || '-'}</td>
                  <td>
                    <span className={`status-badge ${r.is_active ? 'status-active' : 'status-inactive'}`}>
                      {r.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => openModal(r)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(r.receptionist_id)} className="delete-btn">Delete</button>
                    <button onClick={() => toggleActive(r.receptionist_id, r.is_active)} className="toggle-btn">
                      {r.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Receptionist' : 'Add New Receptionist'}</h3>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Username *</label><input name="username" value={formData.username} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Email *</label><input name="email" value={formData.email} onChange={handleChange} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>First Name *</label><input name="first_name" value={formData.first_name} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Last Name *</label><input name="last_name" value={formData.last_name} onChange={handleChange} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Phone Number</label><input name="phone_number" value={formData.phone_number} onChange={handleChange} /></div>
                  <div className="form-group"><label>Employee ID *</label><input name="employee_id" value={formData.employee_id} onChange={handleChange} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Desk Number</label><input name="desk_number" value={formData.desk_number} onChange={handleChange} /></div>
                  <div className="form-group"><label>Shift</label>
                    <select name="shift" value={formData.shift} onChange={handleChange}>
                      <option value="">Select shift</option>
                      <option value="morning">Morning</option>
                      <option value="evening">Evening</option>
                      <option value="night">Night</option>
                    </select>
                  </div>
                </div>
                <div className="form-group checkbox">
                  <label><input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} /> Active</label>
                </div>
                {!editingId && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Password *</label>
                      <div className="password-wrapper">
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required />
                        <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Confirm Password *</label>
                      <div className="password-wrapper">
                        <input type={showConfirm ? "text" : "password"} name="confirm_password" value={formData.confirm_password} onChange={handleChange} required />
                        <button type="button" className="toggle-password" onClick={() => setShowConfirm(!showConfirm)}>
                          {showConfirm ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {error && <div className="error-message">{error}</div>}
              </div>
              <div className="modal-footer">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}