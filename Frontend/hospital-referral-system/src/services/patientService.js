import api from './api';

const patientService = {
  getMyProfile: () => api.get('/patients/patient-profiles/me/'),
  updateMyProfile: (data) => api.put('/patients/patient-profiles/me/', data),
  getMyReferrals: () => api.get('/referrals/referrals/'),
  getReferralById: (id) => api.get(`/referrals/referrals/${id}/`),
  deleteMyAccount: () => api.delete('/patients/patient-profiles/me/'),
  changePassword: (data) => api.post('/patients/patient-profiles/change_password/', data),
};

export default patientService;