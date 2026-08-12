// src/pages/admin/AdminDoctors.jsx
import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import './AdminDoctors.css';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    specialization_id: '',
    password: '',
    is_active: true,
  });
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await adminService.getAllSpecialists();
      let doctorsData = [];
      if (res.data && Array.isArray(res.data)) {
        doctorsData = res.data;
      } else if (res.data && res.data.results && Array.isArray(res.data.results)) {
        doctorsData = res.data.results;
      }
      const normalized = doctorsData.map(doc => ({
        ...doc,
        id: doc.id,
        specialization_name: doc.specialization_name,
        specialization_id: doc.specialization_id,
        first_name: doc.first_name || '',
        last_name: doc.last_name || '',
      }));
      setDoctors(normalized);
    } catch (err) {
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const res = await adminService.getAllSpecialties();
      setSpecialties(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (doc = null) => {
    if (doc) {
      setEditing(doc);
      setFormData({
        username: doc.username || '',
        email: doc.email || '',
        first_name: doc.first_name || '',
        last_name: doc.last_name || '',
        specialization_id: doc.specialization_id || '',
        password: '',
        is_active: doc.is_active === undefined ? true : doc.is_active,
      });
    } else {
      setEditing(null);
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        specialization_id: '',
        password: '',
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        if (updateData.specialization_id) updateData.specialization_id = parseInt(updateData.specialization_id);
        else updateData.specialization_id = null;
        await adminService.updateSpecialist(editing.id, updateData);
      } else {
        if (!formData.password) {
          setError('Password is required');
          return;
        }
        const payload = {
          ...formData,
          specialization_id: formData.specialization_id ? parseInt(formData.specialization_id) : null,
        };
        await adminService.createSpecialist(payload);
      }
      setShowModal(false);
      fetchDoctors();
    } catch (err) {
      setError('Failed to save doctor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor permanently?')) return;
    try {
      await adminService.deleteSpecialist(id);
      fetchDoctors();
    } catch (err) {
      setError('Failed to delete doctor');
    }
  };

  const handleToggleActive = async (doctor) => {
    try {
      await adminService.updateSpecialist(doctor.id, { is_active: !doctor.is_active });
      fetchDoctors();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  if (loading) return <div>Loading doctors...</div>;

  return (
    <div className="admin-specialists-container">
      <div className="admin-header">
        <h1>Manage Doctors</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">+ Add Doctor</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="specialists-table-wrapper">
        <table className="specialists-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Specialty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map(doc => (
              <tr key={doc.id}>
                <td>{doc.first_name} {doc.last_name} ({doc.username})</td>
                <td>{doc.email}</td>
                <td>{doc.specialization_name || 'Not set'}</td>
                <td>
                  <button
                    className={`status-toggle ${doc.is_active ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleActive(doc)}
                  >
                    {doc.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="action-buttons">
                  <button onClick={() => handleOpenModal(doc)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(doc.id)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editing ? 'Edit Doctor' : 'Add Doctor'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username *</label>
                <input name="username" value={formData.username} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input name="first_name" value={formData.first_name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input name="last_name" value={formData.last_name} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Specialization</label>
                <select name="specialization_id" value={formData.specialization_id} onChange={handleChange}>
                  <option value="">Select specialty</option>
                  {specialties.map(spec => (
                    <option key={spec.id} value={spec.id}>{spec.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{editing ? 'Password (leave blank to keep unchanged)' : 'Password *'}</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required={!editing} />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}