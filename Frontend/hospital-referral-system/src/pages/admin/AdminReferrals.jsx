import { useEffect, useState } from "react";
import "./AdminReferrals.css";

const API_URL = "http://localhost:8000/api/referrals/";

const authHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    id: null,
    patient_name: "",
    hospital_name: "",
    status: "pending",
  });

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(API_URL, {
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error("Failed to fetch referrals");

      const data = await res.json();
      setReferrals(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError("Could not load referrals from backend.");
      setReferrals([]);
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
      patient_name: "",
      hospital_name: "",
      status: "pending",
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
          patient_name: form.patient_name,
          hospital_name: form.hospital_name,
          status: form.status,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      await fetchReferrals();
      resetForm();
    } catch (err) {
      setError("Could not save referral.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (referral) => {
    setForm({
      id: referral.id,
      patient_name: referral.patient_name || "",
      hospital_name: referral.hospital_name || "",
      status: referral.status || "pending",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this referral?")) return;

    try {
      setSaving(true);
      setError("");

      const res = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error("Delete failed");

      setReferrals((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError("Could not delete referral.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <p className="loading-text">Loading referrals...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Manage Referrals</h1>
        <p>View all referrals and update their status.</p>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="card form-card">
        <h2>{form.id ? "Edit Referral" : "Add Referral"}</h2>

        <form onSubmit={handleSubmit} className="item-form">
          <div className="form-grid">
            <input
              type="text"
              name="patient_name"
              placeholder="Patient Name"
              value={form.patient_name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="hospital_name"
              placeholder="Hospital Name"
              value={form.hospital_name}
              onChange={handleChange}
              required
            />
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : form.id ? "Update Referral" : "Create Referral"}
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
        <h2>All Referrals</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Hospital</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {referrals.length > 0 ? (
                referrals.map((referral) => (
                  <tr key={referral.id}>
                    <td>{referral.patient_name || "N/A"}</td>
                    <td>{referral.hospital_name || "N/A"}</td>
                    <td>{referral.status || "pending"}</td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => handleEdit(referral)}>Edit</button>
                        <button className="danger" onClick={() => handleDelete(referral.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-row">
                    No referrals found
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