// src/pages/doctor/NewReferral.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import doctorService from '../../services/doctorService';
import './NewReferral.css';

export default function NewReferral() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [formData, setFormData] = useState({
    required_specialty: '',
    hospital_id: '',
    referral_reason: '',
    diagnosis: '',
    clinical_notes: '',
    test_results: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load consultations and specialties on mount
  useEffect(() => {
    Promise.all([
      doctorService.getMyConsultations(),
      doctorService.getAllSpecialties()
    ])
      .then(([consRes, specsRes]) => {
        setConsultations(consRes.data);
        setSpecialties(specsRes.data);
        console.log('Loaded specialties:', specsRes.data); // ✅ debug
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setError('Failed to load data');
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch hospitals when required_specialty changes
  useEffect(() => {
    if (formData.required_specialty) {
      setLoadingHospitals(true);
      // Clear previously selected hospital when specialty changes
      setFormData(prev => ({ ...prev, hospital_id: '' }));
      console.log('Fetching hospitals for specialty:', formData.required_specialty); // ✅ debug
      doctorService.getHospitalsBySpecialty(formData.required_specialty)
        .then(res => {
          console.log('Hospitals response:', res.data); // ✅ debug
          setHospitals(res.data);
        })
        .catch(err => {
          console.error('Error fetching hospitals:', err);
          setHospitals([]);
        })
        .finally(() => setLoadingHospitals(false));
    } else {
      setHospitals([]);
      setFormData(prev => ({ ...prev, hospital_id: '' }));
    }
  }, [formData.required_specialty]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedConsultation) {
      setError('Please select a patient');
      return;
    }
    if (!formData.required_specialty || !formData.referral_reason || !formData.hospital_id) {
      setError('Please fill required fields: specialty, reason, and destination hospital');
      return;
    }
    const consultation = consultations.find(c => c.id === parseInt(selectedConsultation));
    if (!consultation) return;
    setSubmitting(true);
    try {
      await doctorService.createReferral({
        consultation: consultation.id,
        required_specialty: formData.required_specialty,
        hospital: parseInt(formData.hospital_id),
        referral_reason: formData.referral_reason,
        diagnosis: formData.diagnosis,
        clinical_notes: formData.clinical_notes,
        test_results: formData.test_results,
      });
      navigate('/doctor/referral-history');
    } catch (err) {
      console.error('Create referral error:', err);
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
          <select name="required_specialty" value={formData.required_specialty} onChange={handleChange} required>
            <option value="">-- Select specialty --</option>
            {specialties.map(s => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Destination Hospital *</label>
          <select name="hospital_id" value={formData.hospital_id} onChange={handleChange} required disabled={loadingHospitals}>
            <option value="">-- Select a hospital --</option>
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>
                {h.name} {h.address ? `- ${h.address.substring(0, 40)}` : ''}
              </option>
            ))}
          </select>
          {loadingHospitals && <small>Loading hospitals...</small>}
          {!loadingHospitals && formData.required_specialty && hospitals.length === 0 && (
            <small style={{color: 'orange'}}>No hospital has this specialty. Choose another specialty.</small>
          )}
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
        <div className="form-group">
          <label>Test Results</label>
          <textarea name="test_results" value={formData.test_results} onChange={handleChange} />
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