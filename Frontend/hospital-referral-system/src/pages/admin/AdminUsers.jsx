import { useEffect, useState } from "react";
import "./AdminUsers.css";

const API_URL = "http://localhost:8000/api/accounts/users/";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
});

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    id: null,
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    role: "patient",
    phone_number: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(API_URL, { headers: authHeaders() });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
      setError("Could not load users from backend.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setForm({
      id: null,
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      role: "patient",
      phone_number: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        email: form.email,
        role: form.role,
        phone_number: form.phone_number,
      };

      const method = form.id ? "PUT" : "POST";
      const url = form.id ? `${API_URL}${form.id}/` : API_URL;

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Save failed");
      }

      await fetchUsers();
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not save user.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user) => {
    setForm({
      id: user.id,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      username: user.username || "",
      email: user.email || "",
      role: user.role || "patient",
      phone_number: user.phone_number || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      setSaving(true);
      setError("");

      const res = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((user) => user.id !== id));
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      console.error(err);
      setError("Could not delete user.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <p className="loading-text">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Manage Users</h1>
        <p>Create and manage all system users (Admin, Doctor, Receptionist, etc.)</p>
      </div>

      {error && <div className="page-error">{error}</div>}

      {/* Form */}
      <div className="card">
        <h2>{form.id ? "Edit User" : "Add New User"}</h2>
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-grid">
            <input
              name="first_name"
              placeholder="First Name"
              value={form.first_name}
              onChange={handleChange}
              required
            />
            <input
              name="last_name"
              placeholder="Last Name"
              value={form.last_name}
              onChange={handleChange}
              required
            />
            <input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              name="phone_number"
              placeholder="Phone Number"
              value={form.phone_number}
              onChange={handleChange}
            />
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="patient">Patient</option>
              <option value="receptionist">Receptionist</option>
              <option value="doctor">Doctor</option>
              <option value="medical_director">Medical Director</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : form.id ? "Update User" : "Create User"}
            </button>
            {form.id && (
              <button type="button" className="secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="card">
        <h2>All Users</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.full_name || `${user.first_name} ${user.last_name}`}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.phone_number || "—"}</td>
                  <td>
                    <button onClick={() => handleEdit(user)}>Edit</button>
                    <button className="danger" onClick={() => handleDelete(user.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-row">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}