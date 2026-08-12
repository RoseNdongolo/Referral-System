// src/pages/patient/Profile.jsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import patientService from '../../services/patientService';
import AddressAutocomplete from '../../components/AddressAutocomplete';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    latitude: null,
    longitude: null,
    national_id: '',
    gender: '',
    date_of_birth: '',
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const oldPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  useEffect(() => {
    patientService.getMyProfile()
      .then(res => {
        const data = res.data;
        setProfile(data);
        setFormData({
          username: data.username || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          address: data.address || '',
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          national_id: data.national_id || '',
          gender: data.gender || '',
          date_of_birth: data.date_of_birth || '',
        });
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressSelect = (location) => {
    setFormData({
      ...formData,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordFocus = (e) => {
    e.target.removeAttribute('readonly');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setMessage('');

    const dataToSend = { ...formData };
    if (!dataToSend.date_of_birth) dataToSend.date_of_birth = null;
    // Ensure latitude/longitude are sent as numbers or null
    dataToSend.latitude = dataToSend.latitude ? parseFloat(dataToSend.latitude) : null;
    dataToSend.longitude = dataToSend.longitude ? parseFloat(dataToSend.longitude) : null;

    try {
      const updated = await patientService.updateMyProfile(dataToSend);
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
      await patientService.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      setPasswordMessage('Password changed successfully!');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (err) {
      setPasswordMessage(err.response?.data?.error || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    try {
      await patientService.deleteMyAccount();
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
            <label>Medical Record Number</label>
            <input type="text" value={profile.medical_record_number} disabled className="readonly-field" />
            <small>Cannot be changed</small>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} autoComplete="off" />
          </div>

          {/* Address with Autocomplete – used for admin + fallback location */}
          <div className="form-group">
            <label>Address (Administrative & Navigation Fallback)</label>
            <AddressAutocomplete
              placeholder="Start typing your address..."
              defaultValue={formData.address}
              onSelect={handleAddressSelect}
            />
            <small>
              Used for hospital records. If live location fails on the map, this address will be used as your starting point.
            </small>
          </div>

          {/* Read‑only coordinates for reference */}
          <div className="form-row">
            <div className="form-group half">
              <label>Latitude</label>
              <input type="text" value={formData.latitude || ''} disabled className="readonly-field" />
            </div>
            <div className="form-group half">
              <label>Longitude</label>
              <input type="text" value={formData.longitude || ''} disabled className="readonly-field" />
            </div>
          </div>

          <div className="form-group">
            <label>National ID</label>
            <input type="text" name="national_id" value={formData.national_id} onChange={handleChange} autoComplete="off" />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group half">
              <label>Date of Birth</label>
              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} autoComplete="off" />
            </div>
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
                ref={oldPasswordRef}
                type={showCurrentPassword ? "text" : "password"}
                name="old_password"
                value={passwordData.old_password}
                onChange={handlePasswordChange}
                required
                autoComplete="off"
                readOnly
                onFocus={handlePasswordFocus}
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
                ref={newPasswordRef}
                type={showNewPassword ? "text" : "password"}
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
                autoComplete="new-password"
                readOnly
                onFocus={handlePasswordFocus}
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
                ref={confirmPasswordRef}
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                required
                autoComplete="new-password"
                readOnly
                onFocus={handlePasswordFocus}
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