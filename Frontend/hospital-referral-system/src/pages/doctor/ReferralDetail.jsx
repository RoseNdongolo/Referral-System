import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import doctorService from '../../services/doctorService';
import './ReferralDetail.css';

export default function ReferralDetail() {
  const { id } = useParams();
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    doctorService.getReferralById(id)
      .then(res => setReferral(res.data))
      .catch(err => setError('Failed to load referral details'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-state">Loading referral details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!referral) return <div className="error-message">Referral not found</div>;

  return (
    <div className="referral-detail-container">
      <h1>Referral Details</h1>
      <div className="detail-card">
        <div className="detail-row">
          <strong>Patient:</strong> {referral.patient_name}
        </div>
        <div className="detail-row">
          <strong>MRN:</strong> {referral.patient_mrn || 'N/A'}
        </div>
        <div className="detail-row">
          <strong>To Hospital:</strong> {referral.hospital_details?.name || referral.hospital_name}
        </div>
        <div className="detail-row">
          <strong>Specialty:</strong> {referral.required_specialty}
        </div>
        <div className="detail-row">
          <strong>Reason:</strong> {referral.referral_reason}
        </div>
        <div className="detail-row">
          <strong>Diagnosis:</strong> {referral.diagnosis}
        </div>
        <div className="detail-row">
          <strong>Clinical Notes:</strong> {referral.clinical_notes || 'N/A'}
        </div>
        <div className="detail-row">
          <strong>Status:</strong> 
          <span className={`status-badge status-${referral.status}`}>{referral.status}</span>
        </div>
        <div className="detail-row">
          <strong>Created:</strong> {new Date(referral.created_at).toLocaleString()}
        </div>
        <div className="detail-actions">
          <Link to="/doctor/referral-history" className="back-btn">Back to History</Link>
        </div>
      </div>
    </div>
  );
}