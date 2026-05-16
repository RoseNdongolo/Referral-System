// src/pages/medicalDirector/ManageHospitals.jsx
import { useEffect, useState } from 'react';
import api from '../../services/api';
import './ManageHospitals.css';

export default function ManageHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', code: '', address: '', phone_number: '', email: '',
    longitude: '', latitude: '',   // store lat/lng separately for editing
    has_emergency: false, has_surgery: false, has_icu: false, has_laboratory: false,
    is_active: true, specialty_ids: []
  });

  useEffect(() => {
    fetchHospitals();
    fetchSpecialties();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await api.get('/hospitals/hospitals/');
      setHospitals(res.data);
    } catch (err) {
      setError('Failed to load hospitals');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...formData };
    // Convert lat/lon to GeoJSON Point if both are provided
    if (data.latitude && data.longitude) {
      data.location = {
        type: "Point",
        coordinates: [parseFloat(data.longitude), parseFloat(data.latitude)]
      };
    }
    delete data.latitude;
    delete data.longitude;
    try {
      if (editingId) {
        await api.put(`/hospitals/hospitals/${editingId}/`, data);
      } else {
        await api.post('/hospitals/hospitals/', data);
      }
      resetForm();
      fetchHospitals();
    } catch (err) {
      setError('Save failed');
    }
  };

  const handleEdit = (hospital) => {
    setEditingId(hospital.id);
    let lat = '', lng = '';
    if (hospital.location && hospital.location.coordinates) {
      lng = hospital.location.coordinates[0];
      lat = hospital.location.coordinates[1];
    }
    setFormData({
      ...hospital,
      latitude: lat,
      longitude: lng,
      specialty_ids: hospital.specialties?.map(s => s.id) || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this hospital permanently?')) {
      try {
        await api.delete(`/hospitals/hospitals/${id}/`);
        fetchHospitals();
      } catch (err) {
        setError('Delete failed');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '', code: '', address: '', phone_number: '', email: '',
      longitude: '', latitude: '',
      has_emergency: false, has_surgery: false, has_icu: false, has_laboratory: false,
      is_active: true, specialty_ids: []
    });
    setError('');
  };

  if (loading) return <div className="loading-state">Loading hospitals...</div>;

  return (
    <div className="manage-hospitals-container">
      <h1>Manage Hospitals</h1>
      <button className="add-btn" onClick={() => setShowForm(true)}>+ Add Hospital</button>

      {showForm && (
        <div className="form-modal">
          <div className="form-card">
            <h3>{editingId ? 'Edit Hospital' : 'New Hospital'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Name *</label><input name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                <div className="form-group"><label>Code *</label><input name="code" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required /></div>
              </div>
              <div className="form-group"><label>Address</label><textarea name="address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows="2" /></div>
              <div className="form-row">
                <div className="form-group"><label>Phone</label><input name="phone_number" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} /></div>
                <div className="form-group"><label>Email</label><input name="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Longitude</label><input type="number" step="any" name="longitude" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} /></div>
                <div className="form-group"><label>Latitude</label><input type="number" step="any" name="latitude" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group checkbox"><label><input type="checkbox" checked={formData.has_emergency} onChange={e => setFormData({...formData, has_emergency: e.target.checked})} /> Emergency</label></div>
                <div className="form-group checkbox"><label><input type="checkbox" checked={formData.has_surgery} onChange={e => setFormData({...formData, has_surgery: e.target.checked})} /> Surgery</label></div>
                <div className="form-group checkbox"><label><input type="checkbox" checked={formData.has_icu} onChange={e => setFormData({...formData, has_icu: e.target.checked})} /> ICU</label></div>
                <div className="form-group checkbox"><label><input type="checkbox" checked={formData.has_laboratory} onChange={e => setFormData({...formData, has_laboratory: e.target.checked})} /> Laboratory</label></div>
              </div>
              <div className="form-group">
                <label>Specialties</label>
                <select multiple value={formData.specialty_ids} onChange={e => setFormData({...formData, specialty_ids: Array.from(e.target.selectedOptions, opt => parseInt(opt.value))})}>
                  {specialties.map(spec => <option key={spec.id} value={spec.id}>{spec.name}</option>)}
                </select>
                <small>Hold Ctrl/Cmd to select multiple</small>
              </div>
              <div className="form-group checkbox"><label><input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} /> Active</label></div>
              <div className="form-actions">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>
              </div>
              {error && <div className="error-message">{error}</div>}
            </form>
          </div>
        </div>
      )}

      <div className="hospitals-table-wrapper">
        <table className="hospitals-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Phone</th>
              <th>Specialties</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.length === 0 ? (
              <tr><td colSpan="6">No hospitals found.</td></tr>
            ) : (
              hospitals.map(h => (
                <tr key={h.id}>
                  <td>{h.name}</td>
                  <td>{h.code}</td>
                  <td>{h.phone_number || '-'}</td>
                  <td>{(h.specialties || []).map(s => s.name).join(', ') || '-'}</td>
                  <td><span className={`status-badge ${h.is_active ? 'active' : 'inactive'}`}>{h.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <button onClick={() => handleEdit(h)}>Edit</button>
                    <button onClick={() => handleDelete(h.id)}>Delete</button>
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