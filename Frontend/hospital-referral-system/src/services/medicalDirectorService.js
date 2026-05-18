// src/services/medicalDirectorService.js
import api from './api';

const medicalDirectorService = {
  // Profile
  getMyProfile: () => api.get('/medical-directors/me/'),
  updateMyProfile: (data) => api.put('/medical-directors/me/', data),
  deleteMyAccount: () => api.delete('/medical-directors/me/'),
  changePassword: (data) => api.post('/medical-directors/me/change_password/', data),

  // Doctor management
  getAllDoctors: () => api.get('/doctors/all_doctors/'),
  getDoctorById: (doctorId) => api.get(`/doctors/${doctorId}/`),
  createDoctor: (data) => api.post('/doctors/', data),
  updateDoctor: (doctorId, data) => api.put(`/doctors/${doctorId}/`, data),
  deleteDoctor: (doctorId) => api.delete(`/doctors/${doctorId}/`),
  toggleDoctorActive: (doctorId) => api.patch(`/doctors/${doctorId}/toggle_active/`),
  updateDoctorSpecialty: (doctorId, specialization) => 
    api.patch(`/doctors/${doctorId}/update_specialty/`, { specialization }),
  updateDoctorProfile: (doctorId, data) => api.patch(`/doctors/${doctorId}/`, data),

  // Referrals (full CRUD)
  getAllReferrals: () => api.get('/referrals/referrals/'),
  getReferralById: (id) => api.get(`/referrals/referrals/${id}/`),
  updateReferral: (id, data) => api.put(`/referrals/referrals/${id}/`, data),   // full update
  patchReferral: (id, data) => api.patch(`/referrals/referrals/${id}/`, data),  // partial update
  deleteReferral: (id) => api.delete(`/referrals/referrals/${id}/`),

  // Other management
  getAllPatients: () => api.get('/patients/patient-profiles/'),
  getAllDepartments: () => api.get('/hospitals/departments/'),
  getAllSpecialties: () => api.get('/hospitals/specialties/'),

  // Receptionist management
  getAllReceptionists: () => api.get('/receptionists/all_receptionists/'),
  createReceptionist: (data) => api.post('/receptionists/', data),
  updateReceptionist: (id, data) => api.put(`/receptionists/${id}/`, data),
  deleteReceptionist: (id) => api.delete(`/receptionists/${id}/`),
  toggleReceptionistActive: (id, isActive) => 
    api.patch(`/receptionists/${id}/`, { is_active: isActive }),
};

export default medicalDirectorService;