// src/services/receptionistService.js

const API_URL = "http://127.0.0.1:8000/api";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,   // ✅ fixed key
});

// ===============================
// PATIENTS
// ===============================

export const getAllPatients = async () => {
  const response = await fetch(`${API_URL}/patients/`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch patients");
  }

  return response.json();
};

export const registerPatient = async (patientData) => {
  // ✅ corrected endpoint: POST to /patients/ (not /patients/register/)
  const response = await fetch(`${API_URL}/patients/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(patientData),
  });

  if (!response.ok) {
    throw new Error("Failed to register patient");
  }

  return response.json();
};

// ===============================
// REFERRALS
// ===============================

export const getAllReferrals = async () => {
  const response = await fetch(`${API_URL}/referrals/`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch referrals");
  }

  return response.json();
};

// ===============================
// DASHBOARD STATS
// ===============================

export const getDashboardStats = async () => {
  const response = await fetch(`${API_URL}/receptionist/dashboard-stats/`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }

  return response.json();
};