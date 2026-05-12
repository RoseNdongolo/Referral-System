import { useEffect, useState } from "react";
import "./AdminSpecialists.css";

const API_URL = "http://localhost:8000/api/specialists/";

export default function AdminSpecialists() {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    id: null,
    name: "",
    specialty: "",
    hospital: "",
  });

  useEffect(() => {
    fetchSpecialists();
  }, []);

  const fetchSpecialists = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch specialists");

      const data = await res.json();
      setSpecialists(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError("Could not load specialists from backend.");
      setSpecialists([]);
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
      specialty: "",
      hospital: "",
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
          specialty: form.specialty,
          hospital: form.hospital,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      await fetchSpecialists();
      resetForm();
    } catch (err) {
      setError("Could not save specialist.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (specialist) => {
    setForm({
      id: specialist.id,
      name: specialist.name || "",
      specialty: specialist.specialty || "",
      hospital: specialist.hospital || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this specialist?")) return;

    try {
      setSaving(true);
      setError("");

      const res = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setSpecialists((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError("Could not delete specialist.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <p className="loading-text">Loading specialists...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Manage Specialists</h1>
        <p>Assign specialists to hospitals and departments.</p>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="card form-card">
        <h2>{form.id ? "Edit Specialist" : "Add Specialist"}</h2>

        <form onSubmit={handleSubmit} className="item-form">
          <div className="form-grid">
            <input
              type="text"
              name="name"
              placeholder="Specialist Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="specialty"
              placeholder="Specialty"
              value={form.specialty}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="hospital"
              placeholder="Hospital"
              value={form.hospital}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : form.id ? "Update Specialist" : "Create Specialist"}
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
        <h2>All Specialists</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialty</th>
                <th>Hospital</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {specialists.length > 0 ? (
                specialists.map((specialist) => (
                  <tr key={specialist.id}>
                    <td>{specialist.name || "N/A"}</td>
                    <td>{specialist.specialty || "N/A"}</td>
                    <td>{specialist.hospital || "N/A"}</td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => handleEdit(specialist)}>Edit</button>
                        <button className="danger" onClick={() => handleDelete(specialist.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-row">
                    No specialists found
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