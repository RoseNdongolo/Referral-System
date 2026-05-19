// src/services/doctorService.js
import api from './api';

const doctorService = {
  // Profile
  getMyProfile: () => api.get('/doctors/me/'),
  updateMyProfile: (data) => api.put('/doctors/me/', data),
  deleteMyAccount: () => api.delete('/doctors/me/'),
  changePassword: (data) => api.post('/doctors/change_password/', data),

  // Consultations
  getMyConsultations: () => api.get('/doctors/my_consultations/'),
  getConsultationDetail: (id) => api.get(`/doctors/consultations/${id}/`),   // ✅ changed
  updateConsultationStatus: (consultationId, status, extra = {}) => 
    api.patch(`/doctors/consultations/${consultationId}/update_status/`, { status, ...extra }), // optional – you can keep as is or change

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