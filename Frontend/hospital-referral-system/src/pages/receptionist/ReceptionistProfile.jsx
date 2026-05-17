// src/pages/receptionist/ReceptionistProfile.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import receptionistService from '../../services/receptionistService';
import '../patient/Profile.css';  // reuse patient profile CSS

export default function ReceptionistProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordMessage, setPasswordMessage] = useState('');

  // Visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    receptionistService.getMyProfile()
      .then(res => {
        setProfile(res.data);
        setFormData({
          username: res.data.username || '',
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          email: res.data.email || '',
          phone_number: res.data.phone_number || '',
        });
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setMessage('');
    try {
      const updated = await receptionistService.updateMyProfile(formData);
      setProfile(updated.data);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error updating profile';
      setError(true);
      setMessage(msg);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordMessage('New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 8) {
      setPasswordMessage('Password must be at least 8 characters');
      return;
    }
    try {
      await receptionistService.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      setPasswordMessage('Password changed successfully!');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to change password';
      setPasswordMessage(msg);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    try {
      await receptionistService.deleteMyAccount();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      setError(true);
      setMessage('Could not delete account. Contact support.');
    }
  };

  if (!profile) return <div className="loading-state">Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile (Receptionist)</h1>
        <p>View and edit your personal information</p>
      </div>
      <div className="profile-card">
        {message && (
          <div className={`message-toast ${error ? 'message-error' : 'message-success'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} />
            <small>Changing username will affect login</small>
          </div>
          <div className="form-row">
            <div className="form-group half">
              <label>First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
            </div>
            <div className="form-group half">
              <label>Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} />
          </div>
          {profile.employee_id && (
            <div className="form-group">
              <label>Employee ID</label>
              <input type="text" value={profile.employee_id} disabled className="readonly-field" />
              <small>Cannot be changed</small>
            </div>
          )}
          {/* Desk number - always show */}
          <div className="form-group">
            <label>Desk Number</label>
            <input type="text" value={profile.desk_number || 'Not assigned'} disabled className="readonly-field" />
          </div>
          {/* Shift - always show */}
          <div className="form-group">
            <label>Shift</label>
            <input type="text" value={profile.shift || 'Not assigned'} disabled className="readonly-field" />
          </div>
          <button type="submit" className="submit-btn">Save Changes</button>
        </form>

        <hr className="profile-divider" />
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <div className="password-input-wrapper">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                name="old_password"
                value={passwordData.old_password}
                onChange={handlePasswordChange}
                required
              />
              <button type="button" className="toggle-password" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
              />
              <button type="button" className="toggle-password" onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                required
              />
              <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          {passwordMessage && (
            <div className={`message-toast ${passwordMessage.includes('successfully') ? 'message-success' : 'message-error'}`}>
              {passwordMessage}
            </div>
          )}
          <button type="submit" className="submit-btn secondary">Change Password</button>
        </form>

        <hr className="profile-divider" />
        <div className="delete-section">
          <button type="button" onClick={handleDeleteAccount} className="delete-btn">
            {showDeleteConfirm ? 'Confirm Delete Account' : 'Delete Account'}
          </button>
          {showDeleteConfirm && <p className="delete-warning">⚠️ This action is permanent and cannot be undone.</p>}
        </div>
      </div>
    </div>
  );
}