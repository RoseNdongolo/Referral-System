// src/pages/patient/PatientConsultations.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import patientService from '../../services/patientService';
import './PatientConsultations.css';

export default function PatientConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    patientService.getMyConsultations()
      .then(res => setConsultations(res.data))
      .catch(err => setError('Failed to load your medical records'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">Loading your records...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="patient-consultations-container">
      <h1>My Medical Records</h1>
      <div className="consultations-table-wrapper">
        <table className="consultations-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Chief Complaint</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {consultations.length === 0 ? (
              <tr><td colSpan="5">No medical records found.</td></tr>
            ) : (
              consultations.map(c => (
                <tr key={c.id}>
                  <td>Dr. {c.doctor_name}</td>
                  <td>{c.chief_complaint || 'N/A'}</td>
                  <td>{c.status}</td>
                  <td>{new Date(c.assigned_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/patient/consultations/${c.id}`} className="view-btn">View Results</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}