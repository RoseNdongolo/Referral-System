import { useEffect, useState } from "react";
import adminService from "../../services/adminService";   // ← Updated Import
import "./AdminSpecialists.css";

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
    department: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    fetchSpecialists();
  }, []);

  const fetchSpecialists = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await adminService.getSpecialists();
      setSpecialists(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
      setError("Could not load specialists.");
      setSpecialists([]);
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
      name: "",
      specialty: "",
      hospital: "",
      department: "",
      phone: "",
      email: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name,
        specialty: form.specialty,
        hospital: form.hospital || null,
        department: form.department,
        phone: form.phone,
        email: form.email,
      };

      if (form.id) {
        await adminService.updateSpecialist(form.id, payload);
      } else {
        await adminService.createSpecialist(payload);
      }

      await fetchSpecialists();
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Could not save specialist.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      name: item.name || "",
      specialty: item.specialty || "",
      hospital: item.hospital || "",
      department: item.department || "",
      phone: item.phone || "",
      email: item.email || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this specialist?")) return;

    try {
      setSaving(true);
      setError("");

      await adminService.deleteSpecialist(id);
      setSpecialists((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
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

      {/* Add / Edit Form */}
      <div className="card">
        <h2>{form.id ? "Edit Specialist" : "Add Specialist"}</h2>
        <form onSubmit={handleSubmit} className="item-form">
          <div className="form-grid">
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              name="specialty"
              placeholder="Specialty"
              value={form.specialty}
              onChange={handleChange}
              required
            />
            <input
              name="hospital"
              placeholder="Hospital ID"
              value={form.hospital}
              onChange={handleChange}
            />
            <input
              name="department"
              placeholder="Department"
              value={form.department}
              onChange={handleChange}
            />
            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
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

      {/* Specialists Table */}
      <div className="card">
        <h2>All Specialists</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialty</th>
              <th>Hospital</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {specialists.length > 0 ? (
              specialists.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.specialty}</td>
                  <td>{s.hospital_name || s.hospital || "N/A"}</td>
                  <td>{s.department || "N/A"}</td>
                  <td>
                    <button onClick={() => handleEdit(s)}>Edit</button>
                    <button className="danger" onClick={() => handleDelete(s.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No specialists found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}