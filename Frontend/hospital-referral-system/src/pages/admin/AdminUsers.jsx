import { useEffect, useState } from "react";
import "./AdminUsers.css";

const API_URL = "http://localhost:8000/api/users/";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    id: null,
    name: "",
    username: "",
    email: "",
    role: "patient",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(API_URL, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError("Could not load users from backend.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      username: "",
      email: "",
      role: "patient",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      const method = form.id ? "PUT" : "POST";
      const url = form.id ? `${API_URL}${form.id}/` : API_URL;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          username: form.username,
          email: form.email,
          role: form.role,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      await fetchUsers();
      resetForm();
    } catch (err) {
      setError("Could not save user.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user) => {
    setForm({
      id: user.id,
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      role: user.role || "patient",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      setSaving(true);
      setError("");

      const res = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
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
        <p>Create, edit, and delete users directly from the backend.</p>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="card form-card">
        <h2>{form.id ? "Edit User" : "Add User"}</h2>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-grid">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <select name="role" value={form.role} onChange={handleChange}>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
              <option value="receptionist">Receptionist</option>
              <option value="medical_director">Medical Director</option>
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

      <div className="card table-card">
        <h2>All Users</h2>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name || "N/A"}</td>
                    <td>{user.username || "N/A"}</td>
                    <td>{user.email || "N/A"}</td>
                    <td>
                      <span className={`role ${user.role || "unknown"}`}>
                        {user.role || "unknown"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => handleEdit(user)}>Edit</button>
                        <button
                          className="danger"
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-row">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}