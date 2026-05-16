// src/pages/medicalDirector/MedicalDirectorProfile.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import medicalDirectorService from '../../services/medicalDirectorService';
import './MedicalDirectorProfile.css';

export default function MedicalDirectorProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    username: '', first_name: '', last_name: '', email: '', phone_number: '',
    staff_code: '', department: '', office_number: '',
  });
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    medicalDirectorService.getMyProfile()
      .then(res => {
        const data = res.data;
        setProfile(data);
        setFormData({
          username: data.username || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          staff_code: data.staff_code || '',
          department: data.department || '',
          office_number: data.office_number || '',
        });
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false); setMessage('');
    try {
      await medicalDirectorService.updateMyProfile(formData);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(true);
      setMessage('Error updating profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage('New passwords do not match'); return;
    }
    try {
      await medicalDirectorService.changePassword({ old_password: passwordData.old_password, new_password: passwordData.new_password });
      setMessage('Password changed successfully!');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setMessage('Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) { setShowDeleteConfirm(true); return; }
    try {
      await medicalDirectorService.deleteMyAccount();
      localStorage.clear();
      navigate('/login');
    } catch (err) {
      setMessage('Could not delete account');
    }
  };

  if (!profile) return <div className="loading-state">Loading profile...</div>;

  return (
    <div className="medical-director-profile-container">
      <h1>My Profile</h1>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-row">
          <div className="form-group"><label>Username</label><input name="username" value={formData.username} onChange={handleChange} /></div>
          <div className="form-group"><label>Email</label><input name="email" value={formData.email} onChange={handleChange} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>First Name</label><input name="first_name" value={formData.first_name} onChange={handleChange} /></div>
          <div className="form-group"><label>Last Name</label><input name="last_name" value={formData.last_name} onChange={handleChange} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Phone Number</label><input name="phone_number" value={formData.phone_number} onChange={handleChange} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Staff Code</label><input name="staff_code" value={formData.staff_code} onChange={handleChange} disabled /></div>
          <div className="form-group"><label>Department</label><input name="department" value={formData.department} onChange={handleChange} /></div>
          <div className="form-group"><label>Office Number</label><input name="office_number" value={formData.office_number} onChange={handleChange} /></div>
        </div>
        <button type="submit" className="submit-btn">Save Changes</button>
      </form>

      <hr />
      <h3>Change Password</h3>
      <form onSubmit={handlePasswordSubmit} className="password-form">
        <div className="form-group">
          <label>Current Password</label>
          <div className="password-wrapper">
            <input type={showCurrentPassword ? "text" : "password"} name="old_password" value={passwordData.old_password} onChange={handlePasswordChange} required />
            <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>Show</button>
          </div>
        </div>
        <div className="form-group">
          <label>New Password</label>
          <div className="password-wrapper">
            <input type={showNewPassword ? "text" : "password"} name="new_password" value={passwordData.new_password} onChange={handlePasswordChange} required />
            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}>Show</button>
          </div>
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <div className="password-wrapper">
            <input type={showConfirmPassword ? "text" : "password"} name="confirm_password" value={passwordData.confirm_password} onChange={handlePasswordChange} required />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>Show</button>
          </div>
        </div>
        <button type="submit" className="submit-btn">Change Password</button>
      </form>

      <hr />
      <div className="delete-section">
        <button onClick={handleDeleteAccount} className="delete-btn">{showDeleteConfirm ? 'Confirm Delete' : 'Delete Account'}</button>
        {showDeleteConfirm && <p className="warning">⚠️ Permanent!</p>}
      </div>
      {message && <div className={`message-toast ${error ? 'error' : 'success'}`}>{message}</div>}
    </div>
  );
}