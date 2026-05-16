// src/pages/medicalDirector/ManagePatients.jsx
import { useEffect, useState } from 'react';
import api from '../../services/api';
import './ManagePatients.css';

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    national_id: '',
    date_of_birth: '',
    gender: '',
    password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients/patient-profiles/');
      setPatients(res.data.results || res.data);
    } catch (err) {
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        // For edit: send all fields; password is optional
        const updateData = { ...formData };
        // Remove confirm_password (not needed by backend)
        delete updateData.confirm_password;
        // If password is empty, delete it from the request (so backend won't change it)
        if (!updateData.password) delete updateData.password;
        await api.put(`/patients/patient-profiles/${editingId}/`, updateData);
      } else {
        // For create: validate password match
        if (!formData.password || formData.password !== formData.confirm_password) {
          setError('Password and confirm password must match and be provided');
          return;
        }
        const createData = { ...formData };
        delete createData.confirm_password;
        await api.post('/patients/patient-profiles/', createData);
      }
      resetForm();
      fetchPatients();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.username?.[0] || 'Save failed';
      setError(msg);
    }
  };

  const handleEdit = (patient) => {
    setEditingId(patient.id);
    // Exclude password fields
    const { password, confirm_password, ...patientData } = patient;
    setFormData({ ...patientData, password: '', confirm_password: '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this patient permanently? This will also delete the user account.')) {
      try {
        await api.delete(`/patients/patient-profiles/${id}/`);
        fetchPatients();
      } catch (err) {
        setError('Delete failed');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      address: '',
      national_id: '',
      date_of_birth: '',
      gender: '',
      password: '',
      confirm_password: ''
    });
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="loading-state">Loading patients...</div>;

  return (
    <div className="manage-patients-container">
      <h1>Manage Patients</h1>
      <button className="add-btn" onClick={() => setShowForm(true)}>+ Add Patient</button>

      {showForm && (
        <div className="form-modal">
          <div className="form-card">
            <h3>{editingId ? 'Edit Patient' : 'New Patient'}</h3>
            <form onSubmit={handleSubmit}>
              {/* Username and Email */}
              <div className="form-row">
                <div className="form-group"><label>Username *</label><input name="username" value={formData.username} onChange={handleChange} required /></div>
                <div className="form-group"><label>Email *</label><input name="email" value={formData.email} onChange={handleChange} required /></div>
              </div>
              {/* First and Last Name */}
              <div className="form-row">
                <div className="form-group"><label>First Name *</label><input name="first_name" value={formData.first_name} onChange={handleChange} required /></div>
                <div className="form-group"><label>Last Name *</label><input name="last_name" value={formData.last_name} onChange={handleChange} required /></div>
              </div>
              {/* Phone and National ID */}
              <div className="form-row">
                <div className="form-group"><label>Phone Number</label><input name="phone_number" value={formData.phone_number} onChange={handleChange} /></div>
                <div className="form-group"><label>National ID</label><input name="national_id" value={formData.national_id} onChange={handleChange} /></div>
              </div>
              {/* DOB and Gender */}
              <div className="form-row">
                <div className="form-group"><label>Date of Birth</label><input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} /></div>
                <div className="form-group"><label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>
              {/* Address */}
              <div className="form-group"><label>Address</label><textarea name="address" value={formData.address} onChange={handleChange} rows="2" /></div>
              
              {/* Password fields – shown for both create and edit (optional for edit) */}
              <div className="form-row">
                <div className="form-group">
                  <label>{editingId ? 'New Password (optional)' : 'Password *'}</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required={!editingId}
                    />
                    <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>{editingId ? 'Confirm New Password' : 'Confirm Password *'}</label>
                  <div className="password-wrapper">
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      required={!editingId}
                    />
                    <button type="button" className="toggle-password" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>
              </div>
              {error && <div className="error-message">{error}</div>}
            </form>
          </div>
        </div>
      )}

      <div className="patients-table-wrapper">
        <table className="patients-table">
          <thead>
            <tr>
              <th>MRN</th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p.id}>
                <td>{p.medical_record_number}</td>
                <td>{p.full_name || `${p.first_name} ${p.last_name}`}</td>
                <td>{p.username}</td>
                <td>{p.email}</td>
                <td>{p.phone_number || '-'}</td>
                <td>
                  <button onClick={() => handleEdit(p)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}