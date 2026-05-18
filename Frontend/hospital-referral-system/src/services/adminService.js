// src/services/adminService.js
import api from './api';

const adminService = {
  // ========== User Management ==========
  getAllUsers: () => api.get('/admin/users/'),
  getUserById: (id) => api.get(`/admin/users/${id}/`),
  createUser: (data) => api.post('/admin/users/', data),
  updateUser: (id, data) => api.patch(`/admin/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}/`),

  // ========== Hospital Management ==========
  getAllHospitals: () => api.get('/admin/hospitals/'),
  getHospitalById: (id) => api.get(`/admin/hospitals/${id}/`),
  createHospital: (data) => api.post('/admin/hospitals/', data),
  updateHospital: (id, data) => api.patch(`/admin/hospitals/${id}/`, data),
  deleteHospital: (id) => api.delete(`/admin/hospitals/${id}/`),

  // ========== Specialty Management ==========
  getAllSpecialties: () => api.get('/admin/specialties/'),
  getSpecialtyById: (id) => api.get(`/admin/specialties/${id}/`),
  createSpecialty: (data) => api.post('/admin/specialties/', data),
  updateSpecialty: (id, data) => api.patch(`/admin/specialties/${id}/`, data),
  deleteSpecialty: (id) => api.delete(`/admin/specialties/${id}/`),

  // ========== Specialist (Doctor) Management ==========
  // Reuse existing doctor endpoints but ensure admin permission
  getAllSpecialists: () => api.get('/doctors/all_doctors/'),
  getSpecialistById: (id) => api.get(`/doctors/${id}/`),
  createSpecialist: (data) => api.post('/doctors/', data),
  updateSpecialist: (id, data) => api.patch(`/doctors/${id}/`, data),
  deleteSpecialist: (id) => api.delete(`/doctors/${id}/`),

  // ========== Referrals (full CRUD) ==========
  getAllReferrals: () => api.get('/referrals/referrals/'),
  getReferralById: (id) => api.get(`/referrals/referrals/${id}/`),
  updateReferral: (id, data) => api.patch(`/referrals/referrals/${id}/`, data),
  deleteReferral: (id) => api.delete(`/referrals/referrals/${id}/`),
};

export default adminService;