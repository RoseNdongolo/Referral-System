// src/pages/patient/PatientConsultationDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import patientService from '../../services/patientService';
import './PatientConsultationDetail.css';

export default function PatientConsultationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    patientService.getConsultationDetail(id)
      .then(res => setConsultation(res.data))
      .catch(err => setError('Unable to load medical record'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-state">Loading your medical record...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!consultation) return <div className="error-message">Record not found</div>;

  return (
    <div className="patient-consultation-detail-container">
      <div className="detail-header">
        <h1>Medical Consultation Results</h1>
        <button onClick={() => navigate('/patient/consultations')} className="back-btn">← Back to Records</button>
      </div>
      <div className="detail-card">
        <div className="detail-section">
          <h2>Consultation Information</h2>
          <div className="detail-grid">
            <div className="detail-item"><span className="detail-label">Doctor:</span><span className="detail-value">Dr. {consultation.doctor_name}</span></div>
            <div className="detail-item"><span className="detail-label">Date:</span><span className="detail-value">{new Date(consultation.assigned_at).toLocaleString()}</span></div>
            <div className="detail-item"><span className="detail-label">Status:</span><span className="detail-value">{consultation.status}</span></div>
            <div className="detail-item full-width"><span className="detail-label">Chief Complaint:</span><span className="detail-value">{consultation.chief_complaint || 'N/A'}</span></div>
          </div>
        </div>
        <div className="detail-section">
          <h2>Diagnosis</h2>
          <div className="diagnosis-box">{consultation.diagnosis || 'Not yet diagnosed'}</div>
        </div>
        <div className="detail-section">
          <h2>Test Results</h2>
          <div className="test-results-box">{consultation.test_results || 'No test results available'}</div>
        </div>
        <div className="detail-section">
          <h2>Clinical Notes</h2>
          <div className="notes-box">{consultation.notes || 'No additional notes'}</div>
        </div>
        {consultation.referral_created && (
          <div className="detail-section">
            <h2>Referral</h2>
            <p>A referral was created from this consultation. <Link to={`/patient/my-referrals/${consultation.referral_id}`}>View referral details</Link></p>
          </div>
        )}
      </div>
    </div>
  );
}