import api from "./api.js";

const adminService = {
  getDashboardStats: async () => {
    const res = await api.get("/admin/dashboard-stats/");
    return res.data;
  },

  getRecentReferrals: async (limit = 5) => {
    const res = await api.get(`/admin/recent-referrals/?limit=${limit}`);
    return res.data;
  },

  getUsers: async () => {
    const res = await api.get("/admin/users/");
    return res.data;
  },

  createUser: async (payload) => {
    const res = await api.post("/admin/users/", payload);
    return res.data;
  },

  updateUser: async (id, payload) => {
    const res = await api.put(`/admin/users/${id}/`, payload);
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/admin/users/${id}/`);
    return res.data;
  },

  getHospitals: async () => {
    const res = await api.get("/admin/hospitals/");
    return res.data;
  },

  createHospital: async (payload) => {
    const res = await api.post("/admin/hospitals/", payload);
    return res.data;
  },

  updateHospital: async (id, payload) => {
    const res = await api.put(`/admin/hospitals/${id}/`, payload);
    return res.data;
  },

  deleteHospital: async (id) => {
    const res = await api.delete(`/admin/hospitals/${id}/`);
    return res.data;
  },

  getSpecialists: async () => {
    const res = await api.get("/admin/specialists/");
    return res.data;
  },

  createSpecialist: async (payload) => {
    const res = await api.post("/admin/specialists/", payload);
    return res.data;
  },

  updateSpecialist: async (id, payload) => {
    const res = await api.put(`/admin/specialists/${id}/`, payload);
    return res.data;
  },

  deleteSpecialist: async (id) => {
    const res = await api.delete(`/admin/specialists/${id}/`);
    return res.data;
  },

  getReferrals: async () => {
    const res = await api.get("/admin/referrals/");
    return res.data;
  },

  updateReferralStatus: async (id, payload) => {
    const res = await api.patch(`/admin/referrals/${id}/`, payload);
    return res.data;
  },
};

export default adminService;