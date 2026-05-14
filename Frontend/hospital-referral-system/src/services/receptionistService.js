import api from './api';

const receptionistService = {
  getMyProfile: () => api.get('/receptionists/me/'),
  updateMyProfile: (data) => api.put('/receptionists/me/', data),
  deleteMyAccount: () => api.delete('/receptionists/me/'),
  changePassword: (data) => api.post('/receptionists/change_password/', data),
  registerPatient: (data) => api.post('/patients/patient-profiles/', data),
  getAllPatients: () => api.get('/patients/patient-profiles/'),
  getPatientById: (id) => api.get(`/patients/patient-profiles/${id}/`),
  getAllReferrals: () => api.get('/referrals/referrals/'),
};

export default receptionistService;