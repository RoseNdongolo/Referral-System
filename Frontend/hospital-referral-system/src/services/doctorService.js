// src/services/doctorService.js
import api from './api';

const doctorService = {
  // Profile
  getMyProfile: () => api.get('/doctors/me/'),
  updateMyProfile: (data) => api.put('/doctors/me/', data),
  deleteMyAccount: () => api.delete('/doctors/me/'),
  changePassword: (data) => api.post('/doctors/change_password/', data),

  // Consultations (fixed – use doctor's own endpoint)
  getMyConsultations: () => api.get('/doctors/my_consultations/'),     // ✅ corrected
  getConsultationDetail: (id) => api.get(`/patients/patient-profiles/${id}/consultation_detail/`), // may need a doctor version
  updateConsultationStatus: (consultationId, status, extra = {}) => 
    api.patch(`/patients/patient-profiles/${consultationId}/update_consultation_status/`, { status, ...extra }),

  // Referrals
  getAllReferrals: () => api.get('/referrals/referrals/'),
  createReferral: (data) => api.post('/referrals/referrals/', data),
  getReferralById: (id) => api.get(`/referrals/referrals/${id}/`),
  updateReferral: (id, data) => api.patch(`/referrals/referrals/${id}/`, data),
  deleteReferral: (id) => api.delete(`/referrals/referrals/${id}/`),

  // Specialties
  getAllSpecialties: () => api.get('/hospitals/specialties/'),
};

export default doctorService;