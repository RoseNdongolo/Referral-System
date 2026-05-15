import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import doctorService from '../../services/doctorService';
import './ConsultationDetail.css';

export default function ConsultationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [referralData, setReferralData] = useState({
    required_specialty: '',
    hospital_id: '',
    referral_reason: '',
    diagnosis: '',
    clinical_notes: '',
  });
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    fetchConsultation();
    fetchHospitals();
  }, [id]);

  const fetchConsultation = async () => {
    try {
      const res = await doctorService.getConsultationDetail(id);
      setConsultation(res.data);
      setStatus(res.data.status);
    } catch (err) {
      console.error(err);
      setError('Consultation not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    // Fetch hospitals from your endpoint (e.g., '/hospitals/')
    // For now, leave empty or implement later.
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
        patient: consultation.patient,
        doctor: consultation.doctor,
        ...referralData,
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
        <p><strong>Notes:</strong> {consultation.notes || 'N/A'}</p>
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
              <input type="text" name="required_specialty" value={referralData.required_specialty} onChange={handleReferralChange} required />
            </div>
            <div className="form-group">
              <label>Target Hospital</label>
              <select name="hospital_id" value={referralData.hospital_id} onChange={handleReferralChange}>
                <option value="">Select hospital</option>
                {/* Map hospitals from state */}
              </select>
            </div>
            <div className="form-group">
              <label>Referral Reason *</label>
              <textarea name="referral_reason" value={referralData.referral_reason} onChange={handleReferralChange} required />
            </div>
            <div className="form-group">
              <label>Diagnosis</label>
              <textarea name="diagnosis" value={referralData.diagnosis} onChange={handleReferralChange} />
            </div>
            <div className="form-group">
              <label>Clinical Notes</label>
              <textarea name="clinical_notes" value={referralData.clinical_notes} onChange={handleReferralChange} />
            </div>
            <button type="submit" className="submit-btn">Submit Referral</button>
          </form>
        </div>
      )}
    </div>
  );
}