import { useState } from "react";
import "./PatientRegistration.css";

export default function PatientRegistration() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone_number: "",
    email: "",
    national_id: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({});

    // Basic validation
    if (formData.password.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters." });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/patients/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Patient registered successfully!" });
        // Reset form
        setFormData({
          username: "",
          password: "",
          first_name: "",
          last_name: "",
          date_of_birth: "",
          gender: "",
          phone_number: "",
          email: "",
          national_id: "",
          address: "",
        });
        // Optional: redirect to patient list after 2 seconds
        setTimeout(() => {
          window.location.href = "/receptionist/patients";
        }, 2000);
      } else {
        // Display backend error
        const errorMsg = data.error || data.detail || Object.values(data).flat().join(", ");
        setMessage({ type: "error", text: errorMsg });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page">
      <h1>Register New Patient</h1>
      <p className="page-subtitle">Handle patient arrival and create a new record</p>

      {message.text && (
        <div className={`alert ${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-grid">
          {/* Credentials */}
          <div className="form-group">
            <label>Username <span>*</span></label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password <span>*</span></label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            <small>Minimum 8 characters</small>
          </div>

          {/* Personal info */}
          <div className="form-group">
            <label>First Name <span>*</span></label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Last Name <span>*</span></label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Date of Birth <span>*</span></label>
            <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Gender <span>*</span></label>
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Phone Number <span>*</span></label>
            <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>National ID</label>
            <input type="text" name="national_id" value={formData.national_id} onChange={handleChange} />
          </div>

          <div className="form-group full-width">
            <label>Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows="3" />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Registering Patient ..." : "Register Patient"}
        </button>
      </form>
    </div>
  );
}