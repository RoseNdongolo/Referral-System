// src/pages/admin/AdminProfile.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import './AdminProfile.css';

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    phone_number: '',
  });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await adminService.getMyProfile();
      setProfile(res.data);
      setFormData({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        email: res.data.email || '',
        username: res.data.username || '',
        phone_number: res.data.phone_number || '',
      });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.updateMyProfile(formData);
      setProfile(res.data);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    try {
      await adminService.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setShowPasswordForm(false);
      setSuccess('Password changed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to change password. Check your old password.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      await adminService.deleteMyAccount();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    } catch (err) {
      setError('Failed to delete account');
    }
  };

  if (loading) return <div className="profile-loading">Loading profile...</div>;

  return (
    <div className="admin-profile-container">
      <h1>My Profile</h1>
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="profile-card">
        {!isEditing ? (
          // Read-only view
          <>
            <div className="profile-field">
              <label>Username:</label>
              <span>{profile?.username}</span>
            </div>
            <div className="profile-field">
              <label>Email:</label>
              <span>{profile?.email}</span>
            </div>
            <div className="profile-field">
              <label>First Name:</label>
              <span>{profile?.first_name || 'N/A'}</span>
            </div>
            <div className="profile-field">
              <label>Last Name:</label>
              <span>{profile?.last_name || 'N/A'}</span>
            </div>
            <div className="profile-field">
              <label>Phone Number:</label>
              <span>{profile?.phone_number || 'N/A'}</span>
            </div>
            <div className="profile-field">
              <label>Role:</label>
              <span className="role-badge admin">Admin</span>
            </div>
            <div className="profile-actions">
              <button onClick={() => setIsEditing(true)} className="edit-profile-btn">Edit Profile</button>
              <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="change-password-btn">
                {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
              </button>
              <button onClick={handleDeleteAccount} className="delete-account-btn">Delete Account</button>
            </div>
          </>
        ) : (
          // Edit mode
          <form onSubmit={handleSaveEdit} className="edit-form">
            <div className="form-group">
              <label>Username *</label>
              <input name="username" value={formData.username} onChange={handleEditChange} required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleEditChange} required />
            </div>
            <div className="form-group">
              <label>First Name</label>
              <input name="first_name" value={formData.first_name} onChange={handleEditChange} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="last_name" value={formData.last_name} onChange={handleEditChange} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input name="phone_number" value={formData.phone_number} onChange={handleEditChange} />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">Save</button>
              <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        )}

        {showPasswordForm && !isEditing && (
          <form onSubmit={handlePasswordChange} className="password-form">
            <h3>Change Password</h3>
            <div className="form-group">
              <label>Old Password *</label>
              <input type="password" name="old_password" value={passwordData.old_password} onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>New Password * (min 8 characters)</label>
              <input type="password" name="new_password" value={passwordData.new_password} onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Confirm New Password *</label>
              <input type="password" name="confirm_password" value={passwordData.confirm_password} onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })} required />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">Change Password</button>
              <button type="button" onClick={() => setShowPasswordForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}