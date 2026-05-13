import { useEffect, useState } from "react";
import "./AdminHospitals.css";

const API_URL = "http://localhost:8000/api/hospitals/";

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    id: null,
    name: "",
    location: "",
    address: "",
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(API_URL, {
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error("Failed to fetch hospitals");

      const data = await res.json();
      setHospitals(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError("Could not load hospitals from backend.");
      setHospitals([]);
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
      location: "",
      address: "",
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
        headers: authHeaders(),
        body: JSON.stringify({
          name: form.name,
          location: form.location,
          address: form.address,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      await fetchHospitals();
      resetForm();
    } catch (err) {
      setError("Could not save hospital.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (hospital) => {
    setForm({
      id: hospital.id,
      name: hospital.name || "",
      location: hospital.location || "",
      address: hospital.address || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this hospital?")) return;

    try {
      setSaving(true);
      setError("");

      const res = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error("Delete failed");

      setHospitals((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError("Could not delete hospital.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <p className="loading-text">Loading hospitals...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Manage Hospitals</h1>
        <p>Add, update, and remove hospitals.</p>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="card form-card">
        <h2>{form.id ? "Edit Hospital" : "Add Hospital"}</h2>

        <form onSubmit={handleSubmit} className="item-form">
          <div className="form-grid">
            <input
              type="text"
              name="name"
              placeholder="Hospital Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : form.id ? "Update Hospital" : "Create Hospital"}
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
        <h2>All Hospitals</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.length > 0 ? (
                hospitals.map((hospital) => (
                  <tr key={hospital.id}>
                    <td>{hospital.name || "N/A"}</td>
                    <td>{hospital.location || "N/A"}</td>
                    <td>{hospital.address || "N/A"}</td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => handleEdit(hospital)}>Edit</button>
                        <button className="danger" onClick={() => handleDelete(hospital.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-row">
                    No hospitals found
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