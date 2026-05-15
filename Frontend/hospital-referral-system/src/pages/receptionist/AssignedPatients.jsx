import { useEffect, useState } from 'react';
import receptionistService from '../../services/receptionistService';
import './AssignedPatients.css';

export default function AssignedPatients() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  const loadAssignments = () => {
    receptionistService.getAssignedPatients()
      .then(res => setAssignments(res.data))
      .catch(err => setError('Failed to load assigned patients'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleUnassign = async (consultationId, patientName, doctorName) => {
    if (!window.confirm(`Unassign ${patientName} from Dr. ${doctorName}?`)) return;
    try {
      await receptionistService.unassignPatient(consultationId);
      setActionMessage({ type: 'success', text: `${patientName} unassigned successfully` });
      // Refresh the list
      loadAssignments();
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to unassign' });
    } finally {
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  if (loading) return <div className="loading-state">Loading assigned patients...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="assigned-patients-container">
      <h1>Assigned Patients</h1>
      <p>List of patients assigned to doctors and their current status.</p>
      {actionMessage && (
        <div className={`toast-message ${actionMessage.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {actionMessage.text}
        </div>
      )}
      <div className="assignments-table-wrapper">
        <table className="assignments-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>MRN</th>
              <th>Assigned Doctor</th>
              <th>Status</th>
              <th>Chief Complaint</th>
              <th>Assigned Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr><td colSpan="7" style={{textAlign: 'center'}}>No assigned patients yet. Use "Assign Patient" page.</td></tr>
            ) : (
              assignments.map(a => (
                <tr key={a.id}>
                  <td>{a.patient_name}</td>
                  <td>{a.patient_mrn}</td>
                  <td>{a.doctor_name}</td>
                  <td><span className={`status-badge status-${a.status.toLowerCase().replace(' ', '-')}`}>{a.status}</span></td>
                  <td>{a.chief_complaint || '-'}</td>
                  <td>{a.assigned_at}</td>
                  <td>
                    <button
                      onClick={() => handleUnassign(a.id, a.patient_name, a.doctor_name)}
                      className="unassign-btn"
                    >
                      Unassign
                    </button>
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