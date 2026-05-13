import { useEffect, useState } from 'react';
import patientService from '../../services/patientService';
import './Profile.css';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    patientService.getMyProfile()
      .then(res => {
        setProfile(res.data);
        setFormData(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setMessage('');
    try {
      const res = await patientService.updateMyProfile(formData);
      setProfile(res.data);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(true);
      setMessage('Error updating profile');
    }
  };

  if (!profile) return <div className="loading-state">Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Edit Profile</h1>
        <p>Update your personal information</p>
      </div>
      <div className="profile-card">
        {message && (
          <div className={`message-toast ${error ? 'message-error' : 'message-success'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>National ID</label>
            <input
              type="text"
              name="national_id"
              value={formData.national_id || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender || ''} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth || ''}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="submit-btn">Save Changes</button>
        </form>
      </div>
    </div>
  );
}