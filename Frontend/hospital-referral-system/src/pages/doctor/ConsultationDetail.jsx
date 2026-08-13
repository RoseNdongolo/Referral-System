// src/pages/doctor/ConsultationDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import doctorService from '../../services/doctorService';
import './ConsultationDetail.css';

// ---------- Helper functions ----------
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Simple keyword-based specialty suggestion
const suggestSpecialty = (diagnosis, chiefComplaint, testResults) => {
  const text = `${diagnosis} ${chiefComplaint} ${testResults}`.toLowerCase();
  if (text.includes('heart') || text.includes('chest pain') || text.includes('cardiac') || text.includes('angina'))
    return 'Cardiology';
  if (text.includes('brain') || text.includes('stroke') || text.includes('seizure') || text.includes('headache'))
    return 'Neurology';
  if (text.includes('bone') || text.includes('joint') || text.includes('fracture') || text.includes('orthopedic'))
    return 'Orthopedics';
  if (text.includes('cancer') || text.includes('tumour') || text.includes('oncology'))
    return 'Oncology';
  if (text.includes('lung') || text.includes('pneumonia') || text.includes('asthma') || text.includes('breathing'))
    return 'General Medicine'; // or 'Pulmonology' if you have it
  if (text.includes('kidney') || text.includes('urine') || text.includes('urology'))
    return 'Urology';
  if (text.includes('child') || text.includes('infant') || text.includes('pediatric'))
    return 'Pediatrics';
  // default fallback
  return 'General Medicine';
};

const generateReferralReason = (chiefComplaint, diagnosis, testResults) => {
  let reason = `Patient presents with ${chiefComplaint || 'symptoms'}.`;
  if (diagnosis) reason += ` Diagnosis: ${diagnosis}.`;
  if (testResults) reason += ` Test results: ${testResults}.`;
  reason += ' Needs specialist evaluation and management.';
  return reason;
};

// ---------- Component ----------
export default function ConsultationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [status, setStatus] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [testResults, setTestResults] = useState('');
  const [notes, setNotes] = useState('');
  const [patientLat, setPatientLat] = useState(null);
  const [patientLng, setPatientLng] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [referralData, setReferralData] = useState({
    required_specialty: '',
    hospital_id: '',
    referral_reason: '',
    diagnosis: '',
    clinical_notes: '',
    test_results: '',
  });

  // ----- Fetch data on mount -----
  useEffect(() => {
    fetchConsultation();
    fetchSpecialties();
  }, [id]);

  // ----- Populate referralData from consultation -----
  useEffect(() => {
    if (consultation) {
      setReferralData((prev) => ({
        ...prev,
        diagnosis: consultation.diagnosis || '',
        clinical_notes: consultation.notes || '',
        test_results: consultation.test_results || '',
      }));
      // Store patient location
      setPatientLat(consultation.patient_latitude);
      setPatientLng(consultation.patient_longitude);
    }
  }, [consultation]);

  // ----- Auto‑suggest specialty & referral reason when consultation data is ready -----
  useEffect(() => {
    if (!consultation) return;
    const suggested = suggestSpecialty(
      consultation.diagnosis || '',
      consultation.chief_complaint || '',
      consultation.test_results || ''
    );
    const reason = generateReferralReason(
      consultation.chief_complaint || '',
      consultation.diagnosis || '',
      consultation.test_results || ''
    );
    setReferralData((prev) => ({
      ...prev,
      required_specialty: suggested,
      referral_reason: reason,
    }));
  }, [consultation]);

  // ----- Fetch hospitals when required_specialty changes and auto‑select nearest -----
  useEffect(() => {
    if (!referralData.required_specialty) {
      setHospitals([]);
      return;
    }
    setLoadingHospitals(true);
    doctorService
      .getHospitalsBySpecialty(referralData.required_specialty)
      .then((res) => {
        const hospList = res.data;
        setHospitals(hospList);
        // Auto‑select nearest hospital if patient location is available
        if (patientLat && patientLng && hospList.length > 0) {
          let nearest = null;
          let minDist = Infinity;
          hospList.forEach((h) => {
            if (h.latitude && h.longitude) {
              const d = haversineDistance(patientLat, patientLng, parseFloat(h.latitude), parseFloat(h.longitude));
              if (d < minDist) {
                minDist = d;
                nearest = h.id;
              }
            }
          });
          if (nearest) {
            setReferralData((prev) => ({ ...prev, hospital_id: nearest }));
          }
        } else {
          // If no patient location, select first hospital
          if (hospList.length > 0) {
            setReferralData((prev) => ({ ...prev, hospital_id: hospList[0].id }));
          }
        }
      })
      .catch(() => setHospitals([]))
      .finally(() => setLoadingHospitals(false));
  }, [referralData.required_specialty, patientLat, patientLng]);

  // ----- API fetch functions -----
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

  // ----- Handlers -----
  const handleSaveClinical = async () => {
    setUpdating(true);
    try {
      await doctorService.updateConsultationStatus(id, status, { diagnosis, test_results: testResults, notes });
      setConsultation((prev) => ({ ...prev, diagnosis, test_results: testResults, notes }));
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
      setConsultation((prev) => ({ ...prev, status }));
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
    if (!referralData.required_specialty || !referralData.referral_reason || !referralData.hospital_id) {
      setError('Please fill all required fields (specialty, reason, and destination hospital)');
      return;
    }
    try {
      await doctorService.createReferral({
        consultation: consultation.id,
        required_specialty: referralData.required_specialty,
        hospital: referralData.hospital_id,
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

  // ----- Render -----
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
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="2" style={{ width: '100%' }} />
        <p><strong>Diagnosis:</strong></p>
        <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows="2" style={{ width: '100%' }} />
        <p><strong>Test Results:</strong></p>
        <textarea value={testResults} onChange={(e) => setTestResults(e.target.value)} rows="2" style={{ width: '100%' }} />
        <button onClick={handleSaveClinical} disabled={updating} className="save-clinical-btn">
          Save Clinical Data
        </button>
        <p>
          <strong>Status:</strong>
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
              <select
                name="required_specialty"
                value={referralData.required_specialty}
                onChange={handleReferralChange}
                required
              >
                <option value="">Select specialty</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Destination Hospital *</label>
              <select
                name="hospital_id"
                value={referralData.hospital_id}
                onChange={handleReferralChange}
                required
                disabled={loadingHospitals}
              >
                <option value="">-- Select a hospital --</option>
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} {h.address ? `- ${h.address.substring(0, 40)}` : ''}
                  </option>
                ))}
              </select>
              {loadingHospitals && <small>Loading hospitals...</small>}
              {!loadingHospitals && referralData.required_specialty && hospitals.length === 0 && (
                <small style={{ color: 'orange' }}>
                  No hospital has this specialty. Choose another specialty.
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Referral Reason *</label>
              <textarea
                name="referral_reason"
                value={referralData.referral_reason}
                onChange={handleReferralChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Diagnosis</label>
              <textarea
                name="diagnosis"
                value={referralData.diagnosis}
                onChange={handleReferralChange}
                placeholder="Leave empty to use consultation diagnosis"
              />
            </div>
            <div className="form-group">
              <label>Clinical Notes</label>
              <textarea
                name="clinical_notes"
                value={referralData.clinical_notes}
                onChange={handleReferralChange}
                placeholder="Leave empty to use consultation notes"
              />
            </div>
            <div className="form-group">
              <label>Test Results</label>
              <textarea
                name="test_results"
                value={referralData.test_results}
                onChange={handleReferralChange}
                placeholder="Leave empty to use consultation test results"
              />
            </div>
            <button type="submit" className="submit-btn">
              Submit Referral
            </button>
          </form>
        </div>
      )}
    </div>
  );
}