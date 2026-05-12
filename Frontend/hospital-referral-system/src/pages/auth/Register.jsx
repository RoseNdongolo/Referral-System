import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api.js";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    role: "patient",
    first_name: "",
    last_name: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await api.post("/accounts/register/", {
        username: form.username,
        email: form.email,
        password: form.password,
        phone_number: form.phone_number,
        role: form.role,
        first_name: form.first_name,
        last_name: form.last_name,
      });

      setSuccess("Registration successful. Please log in.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      const data = err.response?.data;
      setError(
        typeof data === "object"
          ? Object.values(data).flat().join(" ")
          : "Registration failed"
      );
    }
  };

  return (
    <div style={{ maxWidth: "420px", margin: "80px auto", padding: "20px" }}>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} style={{ width: "100%", marginBottom: "10px", padding: "10px" }} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} style={{ width: "100%", marginBottom: "10px", padding: "10px" }} required />
        <input name="phone_number" placeholder="Phone Number" value={form.phone_number} onChange={handleChange} style={{ width: "100%", marginBottom: "10px", padding: "10px" }} />
        <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} style={{ width: "100%", marginBottom: "10px", padding: "10px" }} />
        <input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} style={{ width: "100%", marginBottom: "10px", padding: "10px" }} />

        <select name="role" value={form.role} onChange={handleChange} style={{ width: "100%", marginBottom: "10px", padding: "10px" }}>
          <option value="patient">Patient</option>
          <option value="receptionist">Receptionist</option>
          <option value="doctor">Doctor</option>
          <option value="medical_director">Medical Director</option>
        </select>

        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} style={{ width: "100%", marginBottom: "10px", padding: "10px" }} required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} style={{ width: "100%", marginBottom: "10px", padding: "10px" }} required />

        <button type="submit" style={{ width: "100%", padding: "10px" }}>
          Create Account
        </button>
      </form>

      <p style={{ marginTop: "15px" }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;