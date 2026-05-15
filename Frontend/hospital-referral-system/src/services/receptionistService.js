import api from './api';

const receptionistService = {
  getMyProfile: () => api.get('/receptionists/me/'),
  updateMyProfile: (data) => api.put('/receptionists/me/', data),
  deleteMyAccount: () => api.delete('/receptionists/me/'),
  changePassword: (data) => api.post('/receptionists/change_password/', data),

  // Patient management
  registerPatient: (data) => api.post('/patients/patient-profiles/', data),
  getAllPatients: () => api.get('/patients/patient-profiles/'),
  getPatientById: (id) => api.get(`/patients/patient-profiles/${id}/`),
  updatePatient: (id, data) => api.put(`/patients/patient-profiles/${id}/`, data),
  deletePatient: (id) => api.delete(`/patients/patient-profiles/${id}/`),

  getUnassignedPatients: () => api.get('/patients/patient-profiles/unassigned_patients/'),
  getActiveDoctors: () => api.get('/patients/patient-profiles/active_doctors/'),
  assignPatient: (data) => api.post('/patients/patient-profiles/assign_patient/', data),

  getAssignedPatients: () => api.get('/patients/patient-profiles/assigned_patients/'),
  unassignPatient: (consultationId) => api.delete(`/patients/patient-profiles/${consultationId}/unassign/`),
  // Referrals
  getAllReferrals: () => api.get('/referrals/referrals/'),
};

export default receptionistService;