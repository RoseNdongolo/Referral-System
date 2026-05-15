import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import doctorService from '../../services/doctorService';
import './DoctorProfile.css';

export default function DoctorProfile() {
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
    doctorService.getMyProfile()
      .then(res => {
        const data = res.data;
        setProfile(data);
        setFormData({
          username: data.username || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
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
      const updated = await doctorService.updateMyProfile(formData);
      setProfile(updated.data);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      let errorMsg = 'Error updating profile';
      if (err.response?.data) errorMsg = err.response.data.error || JSON.stringify(err.response.data);
      setError(true);
      setMessage(errorMsg);
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
      setPasswordMessage('New password must be at least 8 characters');
      return;
    }
    try {
      await doctorService.changePassword({
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
      await doctorService.deleteMyAccount();
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
    <div className="doctor-profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>View and edit your personal information</p>
      </div>
      <div className="profile-card">
        {message && (
          <div className={`message-toast ${error ? 'message-error' : 'message-success'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} autoComplete="off" />
            <small>Changing your username will affect login</small>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} autoComplete="off" />
            </div>
            <div className="form-group half">
              <label>Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} autoComplete="off" />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="off" />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} autoComplete="off" />
          </div>

          <button type="submit" className="submit-btn">Save Changes</button>
        </form>

        <hr className="profile-divider" />
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordSubmit} autoComplete="off">
          <div className="form-group">
            <label>Current Password</label>
            <div className="password-input-wrapper">
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="old_password"
                value={passwordData.old_password}
                onChange={handlePasswordChange}
                required
                autoComplete="off"
              />
              <button type="button" className="toggle-password" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
                autoComplete="new-password"
              />
              <button type="button" className="toggle-password" onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>
            <small>Minimum 8 characters</small>
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                required
                autoComplete="new-password"
              />
              <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? "Hide" : "Show"}
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
          {showDeleteConfirm && (
            <p className="delete-warning">⚠️ This action is permanent and cannot be undone.</p>
          )}
        </div>
      </div>
    </div>
  );
}