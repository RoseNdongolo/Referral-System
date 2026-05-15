// src/pages/doctor/MyPatients.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import doctorService from '../../services/doctorService';
import './MyPatients.css';

export default function MyPatients() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = () => {
    doctorService.getMyConsultations()
      .then(res => setConsultations(res.data))
      .catch(err => setError('Failed to load patients'))
      .finally(() => setLoading(false));
  };

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="my-patients-container">
      <h1>My Patients</h1>
      <div className="patients-table-wrapper">
        <table className="patients-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>MRN</th>
              <th>Status</th>
              <th>Chief Complaint</th>
              <th>Assigned Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {consultations.length === 0 ? (
              <tr><td colSpan="6" className="empty-state">No patients assigned.</td></tr>
            ) : (
              consultations.map(c => (
                <tr key={c.id}>
                  <td>{c.patient_name}</td>
                  <td>{c.patient_mrn}</td>
                  <td><span className={`status-badge status-${c.status}`}>{c.status}</span></td>
                  <td>{c.chief_complaint || '-'}</td>
                  <td>{new Date(c.assigned_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/doctor/consultation/${c.id}`} className="view-btn">Diagnose</Link>
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