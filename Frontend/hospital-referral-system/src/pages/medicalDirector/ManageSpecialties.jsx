// src/pages/medicalDirector/ManageSpecialties.jsx
import { useEffect, useState } from 'react';
import api from '../../services/api';
import './ManageSpecialties.css';

export default function ManageSpecialties() {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const res = await api.get('/hospitals/specialties/');
      setSpecialties(res.data);
    } catch (err) {
      setError('Failed to load specialties');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/hospitals/specialties/${editingId}/`, formData);
      } else {
        await api.post('/hospitals/specialties/', formData);
      }
      resetForm();
      fetchSpecialties();
    } catch (err) {
      setError('Save failed');
    }
  };

  const handleEdit = (spec) => {
    setEditingId(spec.id);
    setFormData({ name: spec.name, description: spec.description || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this specialty permanently?')) {
      try {
        await api.delete(`/hospitals/specialties/${id}/`);
        fetchSpecialties();
      } catch (err) {
        setError('Delete failed');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setError('');
  };

  if (loading) return <div className="loading-state">Loading specialties...</div>;

  return (
    <div className="manage-specialties-container">
      <h1>Medical Specialties</h1>
      <button className="add-btn" onClick={() => setShowForm(true)}>+ Add Specialty</button>

      {showForm && (
        <div className="form-modal">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <button type="submit">Save</button>
            <button type="button" onClick={resetForm}>Cancel</button>
            {error && <div className="error-message">{error}</div>}
          </form>
        </div>
      )}

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
            {specialties.length === 0 ? (
              <tr>
                <td colSpan="3">No specialties found. Add one.</td>
              </tr>
            ) : (
              specialties.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.description || '-'}</td>
                  <td>
                    <button onClick={() => handleEdit(s)}>Edit</button>
                    <button onClick={() => handleDelete(s.id)}>Delete</button>
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