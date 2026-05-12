import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import loginImage from "../../assets/login.jpg";
import "./Login.css";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      username: form.username.trim(),
      password: form.password,
    };

    try {
      const res = await api.post("/accounts/login/", payload);
      login(res.data.access, res.data.user);

      const redirectMap = {
        receptionist: "/receptionist",
        doctor: "/doctor",
        medical_director: "/medical-director",
        patient: "/patient",
        admin: "/admin",
      };

      navigate(redirectMap[res.data.user?.role] || "/");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Invalid username or password"
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div
          className="auth-left"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.45)), url(${loginImage})`,
          }}
        >
          <div className="logo">
            <span>🩺</span> MEDIGRAPH
          </div>

          <div className="auth-hero">
            <h1>
              Empowering Healthcare,
              <br />
              One Click at a Time
            </h1>
            <p>Your Health. Your Records. Your Control.</p>
          </div>
        </div>

        <div className="auth-right">
          <h2 className="auth-title">Extended Care Web Referral Login</h2>
          <p className="auth-subtitle">CarePort Logon Page</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="auth-btn">
              Secure Login
            </button>
          </form>

          <div className="auth-links">
            <Link to="/register">Create account</Link>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;