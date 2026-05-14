import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import receptionistService from '../../services/receptionistService';
import './PatientRegistration.css';

export default function PatientRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    national_id: '',
    date_of_birth: '',
    gender: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) delete errors[e.target.name];
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';
    if (formData.password && formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSuccess('');
    const { confirm_password, ...dataToSend } = formData;
    try {
      await receptionistService.registerPatient(dataToSend);
      setSuccess('Patient registered successfully!');
      setFormData({
        username: '', password: '', confirm_password: '', first_name: '', last_name: '',
        email: '', phone_number: '', national_id: '', date_of_birth: '', gender: '', address: '',
      });
      setTimeout(() => navigate('/receptionist/patients'), 2000);
    } catch (err) {
      const backendErrors = err.response?.data?.errors || err.response?.data;
      setErrors(backendErrors || { general: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-header">
        <h1>Register New Patient</h1>
        <p>Create a new patient account. The patient will use the username and password to log in.</p>
        <p className="note">The patient can change their password later from their profile.</p>
      </div>

      <form onSubmit={handleSubmit} className="registration-form" autoComplete="off">
        <div className="form-section">
          <h3>Login Credentials</h3>
          <div className="form-row">
            <div className="form-group half">
              <label>Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g., john_doe"
                autoComplete="off"
              />
              {errors.username && <span className="error">{errors.username}</span>}
            </div>
            <div className="form-group half">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="patient@example.com"
                autoComplete="off"
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group half">
              <label>Password * (min 8 chars)</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Temporary password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
            <div className="form-group half">
              <label>Confirm Password *</label>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirm_password && <span className="error">{errors.confirm_password}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group half">
              <label>First Name *</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} autoComplete="off" />
              {errors.first_name && <span className="error">{errors.first_name}</span>}
            </div>
            <div className="form-group half">
              <label>Last Name *</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} autoComplete="off" />
              {errors.last_name && <span className="error">{errors.last_name}</span>}
            </div>
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} autoComplete="off" />
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
          <div className="form-group">
            <label>Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows="2" autoComplete="off"></textarea>
          </div>
        </div>

        {errors.general && <div className="error-message">{errors.general}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Registering...' : 'Register Patient'}
          </button>
          <button type="button" onClick={() => navigate('/receptionist/patients')} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}