import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";   // <-- import

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import RoleRoute from "./routes/RoleRoute.jsx";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";

// Receptionist Pages
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard.jsx";
import PatientRegistration from "./pages/receptionist/PatientRegistration.jsx";
import AllPatients from "./pages/receptionist/AllPatients.jsx";
import ReceptionistReferrals from "./pages/receptionist/ReceptionistReferrals.jsx";
import ReceptionistProfile from "./pages/receptionist/ReceptionistProfile.jsx";
import EditPatient from "./pages/receptionist/EditPatient.jsx";
import AssignPatient from "./pages/receptionist/AssignPatient.jsx";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard.jsx";

// Medical Director Pages
import MedicalDirectorDashboard from "./pages/medicalDirector/MedicalDirectorDashboard.jsx";

// Patient Pages
import PatientDashboard from "./pages/patient/PatientDashboard.jsx";
import MyReferrals from "./pages/patient/MyReferrals.jsx";
import MapPage from "./pages/patient/MapPage.jsx";
import Profile from "./pages/patient/Profile.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminHospitals from "./pages/admin/AdminHospitals.jsx";
import AdminSpecialists from "./pages/admin/AdminSpecialists.jsx";
import AdminReferrals from "./pages/admin/AdminReferrals.jsx";

function App() {
  return (
    <Routes>
      {/* Public Routes (full page, no dashboard) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />   {/* ✅ outside dashboard */}
      </Route>

      {/* Protected Routes (any authenticated user) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* ====================== RECEPTIONIST ROUTES ====================== */}
          <Route element={<RoleRoute allowedRoles={["receptionist"]} />}>
            <Route path="/receptionist" element={<ReceptionistDashboard />} />
            <Route path="/receptionist/register-patient" element={<PatientRegistration />} />
            <Route path="/receptionist/patients" element={<AllPatients />} />
            <Route path="/receptionist/referrals" element={<ReceptionistReferrals />} />
            <Route path="/receptionist/profile" element={<ReceptionistProfile />} />
            <Route path="/receptionist/patients/:id/edit" element={<EditPatient />} />
            <Route path="/receptionist/assign-patient" element={<AssignPatient />} /> 
          </Route>

          {/* ====================== DOCTOR ROUTES ====================== */}
          <Route element={<RoleRoute allowedRoles={["doctor"]} />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/patients" element={<div>Doctor Patients Page (Coming Soon)</div>} />
            <Route path="/doctor/diagnosis" element={<div>Diagnosis Page (Coming Soon)</div>} />
            <Route path="/doctor/referral" element={<div>New Referral (Coming Soon)</div>} />
            <Route path="/doctor/referral-history" element={<div>Referral History (Coming Soon)</div>} />
          </Route>

          {/* ====================== MEDICAL DIRECTOR ROUTES ====================== */}d
          <Route element={<RoleRoute allowedRoles={["medical_director"]} />}>
            <Route path="/medical-director" element={<MedicalDirectorDashboard />} />
            <Route path="/medical-director/doctors" element={<div>Manage Doctors (Coming Soon)</div>} />
            <Route path="/medical-director/departments" element={<div>Departments (Coming Soon)</div>} />
            <Route path="/medical-director/referrals" element={<div>Oversee Referrals (Coming Soon)</div>} />
            <Route path="/medical-director/assignments" element={<div>Staff Assignments (Coming Soon)</div>} />
          </Route>

          {/* ====================== PATIENT ROUTES ====================== */}
          <Route element={<RoleRoute allowedRoles={["patient"]} />}>
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/my-referrals" element={<MyReferrals />} />
            <Route path="/patient/map" element={<MapPage />} />
            <Route path="/patient/profile" element={<Profile />} />
          </Route>

          {/* ====================== ADMIN ROUTES ====================== */}
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/hospitals" element={<AdminHospitals />} />
            <Route path="/admin/specialists" element={<AdminSpecialists />} />
            <Route path="/admin/referrals" element={<AdminReferrals />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;