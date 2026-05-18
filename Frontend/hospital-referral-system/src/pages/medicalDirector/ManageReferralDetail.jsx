// src/pages/medicalDirector/ManageReferralDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import medicalDirectorService from '../../services/medicalDirectorService';
import './ManageReferralDetail.css';

export default function ManageReferralDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    medicalDirectorService.getReferralById(id)
      .then(res => setReferral(res.data))
      .catch(err => {
        console.error(err);
        setError('Failed to load referral details');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="detail-loading">Loading referral details...</div>;
  if (error) return <div className="detail-error">{error}</div>;
  if (!referral) return <div className="detail-error">Referral not found</div>;

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Helper to get status badge class
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  return (
    <div className="detail-container">
      <div className="detail-header">
        <h1>Referral Details</h1>
        <button onClick={() => navigate('/medical-director/referrals')} className="back-btn">
          ← Back to List
        </button>
      </div>

      <div className="detail-card">
        <div className="detail-section">
          <h2>Patient Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Full Name:</span>
              <span className="detail-value">{referral.patient_name || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">MRN:</span>
              <span className="detail-value">{referral.patient_mrn || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Patient ID:</span>
              <span className="detail-value">{referral.patient || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Referral Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Referral ID:</span>
              <span className="detail-value">#{referral.id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className={`status-badge ${getStatusClass(referral.status)}`}>
                {referral.status || 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Required Specialty:</span>
              <span className="detail-value">{referral.required_specialty || 'N/A'}</span>
            </div>
            <div className="detail-item full-width">
              <span className="detail-label">Referral Reason:</span>
              <span className="detail-value">{referral.referral_reason || 'N/A'}</span>
            </div>
            <div className="detail-item full-width">
              <span className="detail-label">Additional Notes:</span>
              <span className="detail-value">{referral.additional_notes || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Clinical Information</h2>
          <div className="detail-grid">
            <div className="detail-item full-width">
              <span className="detail-label">Diagnosis:</span>
              <span className="detail-value">{referral.diagnosis || 'N/A'}</span>
            </div>
            <div className="detail-item full-width">
              <span className="detail-label">Clinical Notes:</span>
              <span className="detail-value">{referral.clinical_notes || 'N/A'}</span>
            </div>
            <div className="detail-item full-width">
              <span className="detail-label">Test Results:</span>
              <span className="detail-value">{referral.test_results || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Doctor Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Doctor Name:</span>
              <span className="detail-value">{referral.doctor_name || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Doctor ID:</span>
              <span className="detail-value">{referral.doctor || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Hospital Details</h2>
          {referral.hospital_details ? (
            <>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Hospital Name:</span>
                  <span className="detail-value">{referral.hospital_details.name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Code:</span>
                  <span className="detail-value">{referral.hospital_details.code || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{referral.hospital_details.phone_number || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{referral.hospital_details.email || 'N/A'}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{referral.hospital_details.address || 'N/A'}</span>
                </div>
              </div>
              <div className="detail-subsection">
                <h3>Facilities</h3>
                <div className="facilities-list">
                  <span className={`facility-badge ${referral.hospital_details.has_emergency ? 'active' : 'inactive'}`}>
                    Emergency {referral.hospital_details.has_emergency ? '✓' : '✗'}
                  </span>
                  <span className={`facility-badge ${referral.hospital_details.has_surgery ? 'active' : 'inactive'}`}>
                    Surgery {referral.hospital_details.has_surgery ? '✓' : '✗'}
                  </span>
                  <span className={`facility-badge ${referral.hospital_details.has_icu ? 'active' : 'inactive'}`}>
                    ICU {referral.hospital_details.has_icu ? '✓' : '✗'}
                  </span>
                  <span className={`facility-badge ${referral.hospital_details.has_laboratory ? 'active' : 'inactive'}`}>
                    Laboratory {referral.hospital_details.has_laboratory ? '✓' : '✗'}
                  </span>
                </div>
              </div>
              <div className="detail-subsection">
                <h3>Specialties</h3>
                <div className="specialties-list">
                  {referral.hospital_details.specialties?.length > 0 ? (
                    referral.hospital_details.specialties.map(spec => (
                      <div key={spec.id} className="specialty-card">
                        <strong>{spec.name}</strong>
                        <p>{spec.description}</p>
                      </div>
                    ))
                  ) : (
                    <span className="detail-value">No specialties listed</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="detail-item">
              <span className="detail-label">Hospital:</span>
              <span className="detail-value">{referral.hospital_name || 'N/A'}</span>
            </div>
          )}
        </div>

        <div className="detail-section">
          <h2>GIS & Navigation</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Distance:</span>
              <span className="detail-value">{referral.distance_km ? `${referral.distance_km} km` : 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Est. Travel Time:</span>
              <span className="detail-value">{referral.estimated_travel_time_minutes ? `${referral.estimated_travel_time_minutes} min` : 'N/A'}</span>
            </div>
            {referral.hospital_details?.location?.coordinates && (
              <div className="detail-item full-width">
                <span className="detail-label">Hospital Location (Coordinates):</span>
                <span className="detail-value">
                  Lat: {referral.hospital_details.location.coordinates[1].toFixed(6)}, 
                  Lng: {referral.hospital_details.location.coordinates[0].toFixed(6)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h2>Audit Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Created At:</span>
              <span className="detail-value">{formatDate(referral.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="detail-actions">
          <Link to={`/medical-director/referrals/${referral.id}/edit`} className="edit-btn">Edit Referral</Link>
          <button onClick={() => navigate('/medical-director/referrals')} className="secondary-btn">Close</button>
        </div>
      </div>
    </div>
  );
}