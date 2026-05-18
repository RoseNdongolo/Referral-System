// src/pages/admin/AdminHospitals.jsx
import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import './AdminHospitals.css';

export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone_number: '',
    email: '',
    has_emergency: false,
    has_surgery: false,
    has_icu: false,
    has_laboratory: false,
    is_active: true,
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await adminService.getAllHospitals();
      setHospitals(res.data);
    } catch (err) {
      setError('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (hospital = null) => {
    if (hospital) {
      setEditing(hospital);
      setFormData({
        name: hospital.name,
        code: hospital.code,
        address: hospital.address,
        phone_number: hospital.phone_number || '',
        email: hospital.email || '',
        has_emergency: hospital.has_emergency,
        has_surgery: hospital.has_surgery,
        has_icu: hospital.has_icu,
        has_laboratory: hospital.has_laboratory,
        is_active: hospital.is_active,
      });
    } else {
      setEditing(null);
      setFormData({
        name: '',
        code: '',
        address: '',
        phone_number: '',
        email: '',
        has_emergency: false,
        has_surgery: false,
        has_icu: false,
        has_laboratory: false,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await adminService.updateHospital(editing.id, formData);
      } else {
        await adminService.createHospital(formData);
      }
      setShowModal(false);
      fetchHospitals();
    } catch (err) {
      setError('Failed to save hospital');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hospital permanently?')) return;
    try {
      await adminService.deleteHospital(id);
      fetchHospitals();
    } catch (err) {
      setError('Failed to delete hospital');
    }
  };

  if (loading) return <div>Loading hospitals...</div>;

  return (
    <div className="admin-hospitals-container">
      <div className="admin-header">
        <h1>Manage Hospitals</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">+ Add Hospital</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="hospitals-table-wrapper">
        <table className="hospitals-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Phone</th>
              <th>Emergency</th>
              <th>Surgery</th>
              <th>ICU</th>
              <th>Lab</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.map(h => (
              <tr key={h.id}>
                <td>{h.name}</td>
                <td>{h.code}</td>
                <td>{h.phone_number}</td>
                <td>{h.has_emergency ? '✓' : '✗'}</td>
                <td>{h.has_surgery ? '✓' : '✗'}</td>
                <td>{h.has_icu ? '✓' : '✗'}</td>
                <td>{h.has_laboratory ? '✓' : '✗'}</td>
                <td>{h.is_active ? 'Active' : 'Inactive'}</td>
                <td className="action-buttons">
                  <button onClick={() => handleOpenModal(h)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(h.id)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal similar to user modal – reuse same styling */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editing ? 'Edit Hospital' : 'Add Hospital'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Code *</label>
                <input name="code" value={formData.code} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows="2" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone_number" value={formData.phone_number} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" value={formData.email} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group checkbox-group">
                <label><input type="checkbox" name="has_emergency" checked={formData.has_emergency} onChange={handleChange} /> Emergency</label>
                <label><input type="checkbox" name="has_surgery" checked={formData.has_surgery} onChange={handleChange} /> Surgery</label>
                <label><input type="checkbox" name="has_icu" checked={formData.has_icu} onChange={handleChange} /> ICU</label>
                <label><input type="checkbox" name="has_laboratory" checked={formData.has_laboratory} onChange={handleChange} /> Laboratory</label>
              </div>
              <div className="form-group checkbox">
                <label><input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} /> Active</label>
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