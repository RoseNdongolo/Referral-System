import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../services/api.js";

const ResetPassword = () => {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await api.post("/accounts/password-reset-confirm/", {
        uidb64,
        token,
        password: form.password,
      });

      if (res.data.message) {
        navigate("/login");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Password reset failed"
      );
    }
  };

  return (
    <div style={{ maxWidth: "420px", margin: "80px auto", padding: "20px" }}>
      <h2>Reset Password</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          name="password"
          placeholder="New password"
          value={form.password}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm new password"
          value={form.confirmPassword}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
          required
        />
        <button type="submit" style={{ width: "100%", padding: "10px" }}>
          Reset Password
        </button>
      </form>

      <p style={{ marginTop: "15px" }}>
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
};

export default ResetPassword;