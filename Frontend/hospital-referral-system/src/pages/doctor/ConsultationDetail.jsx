// src/pages/doctor/ConsultationDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import doctorService from '../../services/doctorService';
import './ConsultationDetail.css';

export default function ConsultationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [status, setStatus] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [testResults, setTestResults] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [referralData, setReferralData] = useState({
    required_specialty: '',
    referral_reason: '',
    diagnosis: '',
    clinical_notes: '',
    test_results: '',
  });

  useEffect(() => {
    fetchConsultation();
    fetchSpecialties();
  }, [id]);

  // Pre‑fill referral form when consultation loads
  useEffect(() => {
    if (consultation) {
      setReferralData(prev => ({
        ...prev,
        diagnosis: consultation.diagnosis || '',
        clinical_notes: consultation.notes || '',
        test_results: consultation.test_results || '',
      }));
    }
  }, [consultation]);

  const fetchConsultation = async () => {
    try {
      const res = await doctorService.getConsultationDetail(id);
      setConsultation(res.data);
      setStatus(res.data.status);
      setDiagnosis(res.data.diagnosis || '');
      setTestResults(res.data.test_results || '');
      setNotes(res.data.notes || '');
    } catch (err) {
      console.error(err);
      setError('Consultation not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const res = await doctorService.getAllSpecialties();
      setSpecialties(res.data);
    } catch (err) {
      console.error('Failed to load specialties');
      setSpecialties([]);
    }
  };

  const handleSaveClinical = async () => {
    setUpdating(true);
    try {
      await doctorService.updateConsultationStatus(id, status, { diagnosis, test_results: testResults, notes });
      setConsultation(prev => ({ ...prev, diagnosis, test_results: testResults, notes }));
      alert('Clinical data saved');
    } catch (err) {
      setError('Failed to save clinical data');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      await doctorService.updateConsultationStatus(id, status);
      setConsultation(prev => ({ ...prev, status }));
      alert('Status updated');
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleReferralChange = (e) => {
    setReferralData({ ...referralData, [e.target.name]: e.target.value });
  };

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    if (!referralData.required_specialty || !referralData.referral_reason) {
      setError('Please fill required fields');
      return;
    }
    try {
      await doctorService.createReferral({
        consultation: consultation.id,
        required_specialty: referralData.required_specialty,
        referral_reason: referralData.referral_reason,
        diagnosis: referralData.diagnosis,
        clinical_notes: referralData.clinical_notes,
        test_results: referralData.test_results,
      });
      alert('Referral created successfully');
      setShowReferralForm(false);
    } catch (err) {
      setError('Failed to create referral');
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!consultation) return <div className="error-message">Consultation not found</div>;

  return (
    <div className="consultation-detail-container">
      <h1>Consultation with {consultation.patient_name}</h1>
      <div className="info-card">
        <p><strong>MRN:</strong> {consultation.patient_mrn}</p>
        <p><strong>Chief Complaint:</strong> {consultation.chief_complaint || 'N/A'}</p>
        <p><strong>Notes:</strong></p>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="2" style={{width: '100%'}} />
        <p><strong>Diagnosis:</strong></p>
        <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows="2" style={{width: '100%'}} />
        <p><strong>Test Results:</strong></p>
        <textarea value={testResults} onChange={(e) => setTestResults(e.target.value)} rows="2" style={{width: '100%'}} />
        <button onClick={handleSaveClinical} disabled={updating} className="save-clinical-btn">Save Clinical Data</button>
        <p><strong>Status:</strong> 
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="referred">Referred Out</option>
          </select>
          <button onClick={handleStatusUpdate} disabled={updating} className="update-btn">
            {updating ? 'Updating...' : 'Update Status'}
          </button>
        </p>
      </div>

      <button className="referral-btn" onClick={() => setShowReferralForm(!showReferralForm)}>
        {showReferralForm ? 'Cancel' : 'Create Referral'}
      </button>

      {showReferralForm && (
        <div className="referral-form">
          <h3>New Referral</h3>
          <form onSubmit={handleCreateReferral}>
            <div className="form-group">
              <label>Required Specialty *</label>
              <select name="required_specialty" value={referralData.required_specialty} onChange={handleReferralChange} required>
                <option value="">Select specialty</option>
                {specialties.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Referral Reason *</label>
              <textarea name="referral_reason" value={referralData.referral_reason} onChange={handleReferralChange} required />
            </div>
            <div className="form-group">
              <label>Diagnosis</label>
              <textarea name="diagnosis" value={referralData.diagnosis} onChange={handleReferralChange} placeholder="Leave empty to use consultation diagnosis" />
            </div>
            <div className="form-group">
              <label>Clinical Notes</label>
              <textarea name="clinical_notes" value={referralData.clinical_notes} onChange={handleReferralChange} placeholder="Leave empty to use consultation notes" />
            </div>
            <div className="form-group">
              <label>Test Results</label>
              <textarea name="test_results" value={referralData.test_results} onChange={handleReferralChange} placeholder="Leave empty to use consultation test results" />
            </div>
            <button type="submit" className="submit-btn">Submit Referral</button>
          </form>
        </div>
      )}
    </div>
  );
}