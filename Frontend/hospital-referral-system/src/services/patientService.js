import api from './api';

const patientService = {
  getMyProfile: () => api.get('/patients/patient-profiles/me/'),
  updateMyProfile: (data) => api.put('/patients/patient-profiles/me/', data),
  getMyReferrals: () => api.get('/referrals/referrals/'),       // ✅ corrected URL
  getReferralById: (id) => api.get(`/referrals/referrals/${id}/`),
};

export default patientService;