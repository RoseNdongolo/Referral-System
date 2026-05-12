import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await api.post("/accounts/password-reset/", { email });
      setMessage(res.data.message || "Password reset link sent to email.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to send reset link"
      );
    }
  };

  return (
    <div style={{ maxWidth: "420px", margin: "80px auto", padding: "20px" }}>
      <h2>Forgot Password</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
          required
        />
        <button type="submit" style={{ width: "100%", padding: "10px" }}>
          Send Reset Link
        </button>
      </form>

      <p style={{ marginTop: "15px" }}>
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;