// src/pages/admin/AdminSpecialties.jsx
import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import './AdminSpecialties.css';

export default function AdminSpecialties() {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const res = await adminService.getAllSpecialties();
      setSpecialties(res.data);
    } catch (err) {
      setError('Failed to load specialties');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (spec = null) => {
    if (spec) {
      setEditing(spec);
      setFormData({ name: spec.name, description: spec.description || '' });
    } else {
      setEditing(null);
      setFormData({ name: '', description: '' });
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
        await adminService.updateSpecialty(editing.id, formData);
      } else {
        await adminService.createSpecialty(formData);
      }
      setShowModal(false);
      fetchSpecialties();
    } catch (err) {
      setError('Failed to save specialty');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this specialty permanently?')) return;
    try {
      await adminService.deleteSpecialty(id);
      fetchSpecialties();
    } catch (err) {
      setError('Failed to delete specialty');
    }
  };

  if (loading) return <div>Loading specialties...</div>;

  return (
    <div className="admin-specialties-container">
      <div className="admin-header">
        <h1>Manage Specialties</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">+ Add Specialty</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="specialties-table-wrapper">
        <table className="specialties-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {specialties.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.description}</td>
                <td className="action-buttons">
                  <button onClick={() => handleOpenModal(s)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editing ? 'Edit Specialty' : 'Add Specialty'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
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