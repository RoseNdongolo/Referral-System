import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import receptionistService from '../../services/receptionistService';
import './EditPatient.css';

export default function EditPatient() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    national_id: '',
    date_of_birth: '',
    gender: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // If patient data passed via navigation state, use it
    if (location.state?.patient) {
      const p = location.state.patient;
      setFormData({
        username: p.username || '',
        first_name: p.first_name || '',
        last_name: p.last_name || '',
        email: p.email || '',
        phone_number: p.phone_number || '',
        national_id: p.national_id || '',
        date_of_birth: p.date_of_birth || '',
        gender: p.gender || '',
        address: p.address || '',
      });
      setLoading(false);
    } else {
      // Otherwise fetch from API
      receptionistService.getPatientById(id)
        .then(res => {
          const p = res.data;
          setFormData({
            username: p.username || '',
            first_name: p.first_name || '',
            last_name: p.last_name || '',
            email: p.email || '',
            phone_number: p.phone_number || '',
            national_id: p.national_id || '',
            date_of_birth: p.date_of_birth || '',
            gender: p.gender || '',
            address: p.address || '',
          });
        })
        .catch(err => setError('Failed to load patient'))
        .finally(() => setLoading(false));
    }
  }, [id, location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await receptionistService.updatePatient(id, formData);
      setSuccess('Patient updated successfully!');
      setTimeout(() => navigate('/receptionist/patients'), 1500);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.username?.[0] || 'Update failed';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Loading patient data...</div>;

  return (
    <div className="edit-patient-container">
      <h1>Edit Patient</h1>
      <form onSubmit={handleSubmit} className="edit-patient-form">
        <div className="form-row">
          <div className="form-group">
            <label>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>National ID</label>
            <input type="text" name="national_id" value={formData.national_id} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label>Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange} rows="3"></textarea>
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <div className="form-actions">
          <button type="submit" disabled={saving} className="submit-btn">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate('/receptionist/patients')} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}