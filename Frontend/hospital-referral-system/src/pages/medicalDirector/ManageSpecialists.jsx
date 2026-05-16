// src/pages/medicalDirector/ManageSpecialists.jsx
import { useEffect, useState } from 'react';
import api from '../../services/api';
import './ManageSpecialists.css';

export default function ManageSpecialists() {
  const [specialists, setSpecialists] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', specialty: '', hospital: '', department: '', phone: '', email: ''
  });

  useEffect(() => {
    fetchSpecialists();
    fetchSpecialties();
    fetchHospitals();
  }, []);

  const fetchSpecialists = async () => {
    try {
      const res = await api.get('/specialists/specialists/');
      setSpecialists(res.data);
    } catch (err) {
      setError('Failed to load specialists');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const res = await api.get('/hospitals/specialties/');
      setSpecialties(res.data);
    } catch (err) {
      console.error('Failed to load specialties');
    }
  };

  const fetchHospitals = async () => {
    try {
      const res = await api.get('/hospitals/hospitals/');
      setHospitals(res.data);
    } catch (err) {
      console.error('Failed to load hospitals');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/specialists/specialists/${editingId}/`, formData);
      } else {
        await api.post('/specialists/specialists/', formData);
      }
      resetForm();
      fetchSpecialists();
    } catch (err) {
      setError('Save failed');
    }
  };

  const handleEdit = (spec) => {
    setEditingId(spec.id);
    setFormData({
      name: spec.name || '',
      specialty: spec.specialty || '',
      hospital: spec.hospital || '',
      department: spec.department || '',
      phone: spec.phone || '',
      email: spec.email || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this specialist permanently?')) {
      try {
        await api.delete(`/specialists/specialists/${id}/`);
        fetchSpecialists();
      } catch (err) {
        setError('Delete failed');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', specialty: '', hospital: '', department: '', phone: '', email: '' });
    setError('');
  };

  if (loading) return <div className="loading-state">Loading specialists...</div>;

  return (
    <div className="manage-specialists-container">
      <h1>Manage External Specialists</h1>
      <button className="add-btn" onClick={() => setShowForm(true)}>+ Add Specialist</button>

      {showForm && (
        <div className="form-modal">
          <div className="form-card">
            <h3>{editingId ? 'Edit Specialist' : 'New Specialist'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Specialty</label>
                <select name="specialty" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})}>
                  <option value="">Select specialty</option>
                  {specialties.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Hospital (affiliation)</label>
                <select name="hospital" value={formData.hospital} onChange={e => setFormData({...formData, hospital: e.target.value})}>
                  <option value="">Select hospital</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <input name="department" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
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

      <div className="specialists-table-wrapper">
        <table className="specialists-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialty</th>
              <th>Hospital</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {specialists.length === 0 ? (
              <tr>
                <td colSpan="6">No specialists found.</td>
              </tr>
            ) : (
              specialists.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.specialty_name || '-'}</td>
                  <td>{s.hospital_name || '-'}</td>
                  <td>{s.phone || '-'}</td>
                  <td>{s.email || '-'}</td>
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