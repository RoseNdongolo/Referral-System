// src/services/doctorService.js
import api from './api';

const doctorService = {
  // Profile
  getMyProfile: () => api.get('/doctors/me/'),
  updateMyProfile: (data) => api.put('/doctors/me/', data),
  deleteMyAccount: () => api.delete('/doctors/me/'),
  changePassword: (data) => api.post('/doctors/change_password/', data),

  // Consultations (assigned patients)
  getMyConsultations: () => api.get('/patients/patient-profiles/my_consultations/'),
  updateConsultationStatus: (consultationId, status) => 
    api.patch(`/patients/patient-profiles/${consultationId}/update_consultation_status/`, { status }),
  getConsultationDetail: (id) => api.get(`/patients/patient-profiles/${id}/consultation_detail/`),


  // Referrals
  getAllReferrals: () => api.get('/referrals/referrals/'),  // may filter by doctor later
  createReferral: (data) => api.post('/referrals/referrals/', data),
  getReferralById: (id) => api.get(`/referrals/referrals/${id}/`),
};

export default doctorService;