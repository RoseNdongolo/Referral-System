// src/pages/doctor/NewReferral.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import doctorService from '../../services/doctorService';
import './NewReferral.css';

export default function NewReferral() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState('');
  const [formData, setFormData] = useState({
    required_specialty: '',
    hospital_id: '',
    referral_reason: '',
    diagnosis: '',
    clinical_notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    doctorService.getMyConsultations()
      .then(res => setConsultations(res.data))
      .catch(err => setError('Failed to load patients'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedConsultation) {
      setError('Please select a patient');
      return;
    }
    const consultation = consultations.find(c => c.id === parseInt(selectedConsultation));
    if (!consultation) return;
    setSubmitting(true);
    try {
      await doctorService.createReferral({
        consultation: consultation.id,
        patient: consultation.patient,
        doctor: consultation.doctor,
        ...formData,
      });
      navigate('/doctor/referral-history');
    } catch (err) {
      setError('Failed to create referral');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="new-referral-container">
      <h1>New Referral</h1>
      <form onSubmit={handleSubmit} className="new-referral-form">
        <div className="form-group">
          <label>Select Patient *</label>
          <select value={selectedConsultation} onChange={e => setSelectedConsultation(e.target.value)} required>
            <option value="">-- Choose a patient --</option>
            {consultations.map(c => (
              <option key={c.id} value={c.id}>
                {c.patient_name} (MRN: {c.patient_mrn}) – {c.status}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Required Specialty *</label>
          <input type="text" name="required_specialty" value={formData.required_specialty} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Target Hospital</label>
          <select name="hospital_id" value={formData.hospital_id} onChange={handleChange}>
            <option value="">Select hospital</option>
            {/* You can fetch hospitals from API */}
          </select>
        </div>
        <div className="form-group">
          <label>Referral Reason *</label>
          <textarea name="referral_reason" value={formData.referral_reason} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Diagnosis</label>
          <textarea name="diagnosis" value={formData.diagnosis} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Clinical Notes</label>
          <textarea name="clinical_notes" value={formData.clinical_notes} onChange={handleChange} />
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="form-actions">
          <button type="submit" disabled={submitting} className="submit-btn">
            {submitting ? 'Creating...' : 'Create Referral'}
          </button>
          <button type="button" onClick={() => navigate('/doctor')} className="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  );
}