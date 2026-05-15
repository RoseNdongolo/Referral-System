import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import receptionistService from '../../services/receptionistService';
import './AssignPatient.css';

export default function AssignPatient() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      receptionistService.getUnassignedPatients(),
      receptionistService.getActiveDoctors()
    ])
      .then(([patientsRes, doctorsRes]) => {
        setPatients(patientsRes.data);
        setDoctors(doctorsRes.data);
      })
      .catch(err => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !selectedDoctor) {
      setError('Please select both a patient and a doctor');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await receptionistService.assignPatient({
        patient_id: selectedPatient,
        doctor_id: selectedDoctor,
        chief_complaint: chiefComplaint,
        notes: notes
      });
      setSuccess('Patient assigned successfully!');
      setSelectedPatient('');
      setSelectedDoctor('');
      setChiefComplaint('');
      setNotes('');
      // Optionally refresh unassigned list
      const patientsRes = await receptionistService.getUnassignedPatients();
      setPatients(patientsRes.data);
    } catch (err) {
      const msg = err.response?.data?.patient_id?.[0] || err.response?.data?.doctor_id?.[0] || 'Assignment failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="assign-patient-container">
      <h1>Assign Patient to Doctor</h1>
      <form onSubmit={handleSubmit} className="assign-patient-form">
        <div className="form-group">
          <label>Patient *</label>
          <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} required>
            <option value="">-- Select Patient --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.full_name} ({p.medical_record_number}) - {p.email}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Doctor *</label>
          <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} required>
            <option value="">-- Select Doctor --</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>
                {d.full_name} ({d.specialty}) - {d.email}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Chief Complaint (reason for visit)</label>
          <textarea value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} rows="2"></textarea>
        </div>
        <div className="form-group">
          <label>Additional Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="2"></textarea>
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <div className="form-actions">
          <button type="submit" disabled={submitting} className="submit-btn">
            {submitting ? 'Assigning...' : 'Assign Patient'}
          </button>
          <button type="button" onClick={() => navigate('/receptionist/patients')} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}