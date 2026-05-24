import { useEffect, useState } from 'react';
import api from '../../services/api'; // use your api instance
import './AdminDepartments.css';

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', hospital: '' });
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    fetchDepartments();
    fetchHospitals();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/hospitals/departments/'); // adjust endpoint if needed
      setDepartments(res.data);
    } catch (err) {
      setError('Failed to load departments');
    } finally {
      setLoading(false);
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
    if (!formData.name || !formData.hospital) {
      setError('Please fill all fields');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/hospitals/departments/${editingId}/`, formData);
      } else {
        await api.post('/hospitals/departments/', formData);
      }
      resetForm();
      fetchDepartments();
    } catch (err) {
      setError('Save failed');
    }
  };

  const handleEdit = (dept) => {
    setEditingId(dept.id);
    setFormData({ name: dept.name, hospital: dept.hospital });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this department permanently?')) {
      try {
        await api.delete(`/hospitals/departments/${id}/`);
        fetchDepartments();
      } catch (err) {
        setError('Delete failed');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', hospital: '' });
    setError('');
  };

  if (loading) return <div className="loading-state">Loading departments...</div>;

  return (
    <div className="manage-departments-container">
      <h1>Manage Departments</h1>
      <button className="add-btn" onClick={() => setShowForm(true)}>+ Add Department</button>

      {showForm && (
        <div className="form-modal">
          <div className="form-card">
            <h3>{editingId ? 'Edit Department' : 'New Department'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Department Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hospital</label>
                <select
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  required
                >
                  <option value="">Select Hospital</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
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

      <div className="departments-table-wrapper">
        <table className="departments-table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Hospital</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr><td colSpan="3">No departments found. Add one.</td></tr>
            ) : (
              departments.map(dept => (
                <tr key={dept.id}>
                  <td>{dept.name}</td>
                  <td>{dept.hospital_name || dept.hospital}</td>
                  <td>
                    <button onClick={() => handleEdit(dept)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(dept.id)} className="delete-btn">Delete</button>
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