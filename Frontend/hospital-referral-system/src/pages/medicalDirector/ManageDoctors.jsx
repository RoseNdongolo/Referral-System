// src/pages/medicalDirector/ManageDoctors.jsx
import { useEffect, useState } from 'react';
import medicalDirectorService from '../../services/medicalDirectorService';
import './ManageDoctors.css';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    specialization: '',
    department: '',
    is_available: true
  });
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  useEffect(() => {
    loadDoctors();
    loadSpecialties();
    loadDepartments();
  }, []);

  const loadDoctors = () => {
    medicalDirectorService.getAllDoctors()
      .then(res => setDoctors(res.data))
      .catch(err => setError('Failed to load doctors'))
      .finally(() => setLoading(false));
  };

  const loadSpecialties = async () => {
    try {
      const res = await medicalDirectorService.getAllSpecialties();
      setSpecialties(res.data);
    } catch (err) {
      console.error('Failed to load specialties');
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await medicalDirectorService.getAllDepartments();
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to load departments');
    }
  };

  const toggleActive = async (doctorId) => {
    try {
      await medicalDirectorService.toggleDoctorActive(doctorId);
      setDoctors(doctors.map(doc =>
        doc.doctor_id === doctorId
          ? { ...doc, is_available: !doc.is_available }
          : doc
      ));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const openModal = (doctor = null) => {
    setEditingDoctor(doctor);
    setModalError('');
    setModalSuccess('');
    if (doctor) {
      setFormData({
        username: doctor.username || '',
        password: '',
        first_name: doctor.first_name || '',
        last_name: doctor.last_name || '',
        email: doctor.email || '',
        phone_number: doctor.phone_number || '',
        specialization: doctor.specialization || '',
        department: doctor.department || '',
        is_available: doctor.is_available !== undefined ? doctor.is_available : true
      });
    } else {
      setFormData({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        specialization: '',
        department: '',
        is_available: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDoctor(null);
    setFormData({
      username: '', password: '', first_name: '', last_name: '', email: '',
      phone_number: '', specialization: '', department: '', is_available: true
    });
    setModalError('');
    setModalSuccess('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    try {
      if (editingDoctor) {
        await medicalDirectorService.updateDoctor(editingDoctor.doctor_id, formData);
        setModalSuccess('Doctor updated successfully');
      } else {
        if (!formData.password) {
          setModalError('Password is required for new doctor');
          return;
        }
        await medicalDirectorService.createDoctor(formData);
        setModalSuccess('Doctor created successfully');
      }
      setTimeout(() => {
        loadDoctors();
        closeModal();
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.username?.[0] || 'Operation failed';
      setModalError(msg);
    }
  };

  const handleDelete = async (doctorId) => {
    if (window.confirm('Delete this doctor permanently? This will also delete the user account.')) {
      try {
        await medicalDirectorService.deleteDoctor(doctorId);
        loadDoctors();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  if (loading) return <div className="loading-state">Loading doctors...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="manage-doctors-container">
      <h1>Manage Doctors</h1>
      <button className="add-btn" onClick={() => openModal()}>+ Add Doctor</button>

      <div className="doctors-table-wrapper">
        <table className="doctors-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Email</th>
              <th>Specialty</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">No doctors found.</td>
              </tr>
            ) : (
              doctors.map(doc => (
                <tr key={doc.doctor_id}>
                  <td>{doc.full_name}</td>
                  <td>{doc.email}</td>
                  <td>{doc.specialization}</td>
                  <td>{doc.department || '-'}</td>
                  <td>
                    <span className={`status-badge ${doc.is_available ? 'status-active' : 'status-inactive'}`}>
                      {doc.is_available ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => openModal(doc)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(doc.doctor_id)} className="delete-btn">Delete</button>
                    <button onClick={() => toggleActive(doc.doctor_id)} className="toggle-btn">
                      {doc.is_available ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h3>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Username *</label><input name="username" value={formData.username} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Email *</label><input type="email" name="email" value={formData.email} onChange={handleChange} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>First Name *</label><input name="first_name" value={formData.first_name} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Last Name *</label><input name="last_name" value={formData.last_name} onChange={handleChange} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Phone Number</label><input name="phone_number" value={formData.phone_number} onChange={handleChange} /></div>
                  <div className="form-group"><label>Password {!editingDoctor && '*'}</label><input type="password" name="password" value={formData.password} onChange={handleChange} required={!editingDoctor} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Specialty</label>
                    <select name="specialization" value={formData.specialization} onChange={handleChange}>
                      <option value="">Select specialty</option>
                      {specialties.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Department</label>
                    <select name="department" value={formData.department} onChange={handleChange}>
                      <option value="">Select department</option>
                      {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group checkbox">
                  <label><input type="checkbox" name="is_available" checked={formData.is_available} onChange={handleChange} /> Active</label>
                </div>
                {modalError && <div className="error-message">{modalError}</div>}
                {modalSuccess && <div className="success-message">{modalSuccess}</div>}
              </div>
              <div className="modal-footer">
                <button type="submit" className="save-btn">{editingDoctor ? 'Save Changes' : 'Create Doctor'}</button>
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}