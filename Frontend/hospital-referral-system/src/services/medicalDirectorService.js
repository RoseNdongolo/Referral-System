// src/services/medicalDirectorService.js
import api from './api';

const medicalDirectorService = {
  // Profile
  getMyProfile: () => api.get('/medical-directors/me/'),
  updateMyProfile: (data) => api.put('/medical-directors/me/', data),
  deleteMyAccount: () => api.delete('/medical-directors/me/'),
  changePassword: (data) => api.post('/medical-directors/me/change_password/', data),

  // Doctor management – full CRUD
  getAllDoctors: () => api.get('/doctors/all_doctors/'),
  getDoctorById: (doctorId) => api.get(`/doctors/${doctorId}/`),        // new
  createDoctor: (data) => api.post('/doctors/', data),                 // new
  updateDoctor: (doctorId, data) => api.put(`/doctors/${doctorId}/`, data), // new (full update)
  deleteDoctor: (doctorId) => api.delete(`/doctors/${doctorId}/`),     // new
  // Specialty/department specific updates (keep existing)
  toggleDoctorActive: (doctorId) => api.patch(`/doctors/${doctorId}/toggle_active/`),
  updateDoctorSpecialty: (doctorId, specialization) => 
    api.patch(`/doctors/${doctorId}/update_specialty/`, { specialization }),
  updateDoctorProfile: (doctorId, data) => api.patch(`/doctors/${doctorId}/`, data),

  // Referrals, patients, departments, specialties (unchanged)
  getAllReferrals: () => api.get('/referrals/referrals/'),
  getReferralById: (id) => api.get(`/referrals/referrals/${id}/`),
  getAllPatients: () => api.get('/patients/patient-profiles/'),
  getAllDepartments: () => api.get('/hospitals/departments/'),
  getAllSpecialties: () => api.get('/hospitals/specialties/'),
};

export default medicalDirectorService;