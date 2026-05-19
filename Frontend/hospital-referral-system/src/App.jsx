import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";

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
import AssignedPatients from "./pages/receptionist/AssignedPatients.jsx";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard.jsx";
import MyPatients from "./pages/doctor/MyPatients.jsx";
import ConsultationDetail from "./pages/doctor/ConsultationDetail.jsx";
import NewReferral from "./pages/doctor/NewReferral.jsx";
import ReferralHistory from "./pages/doctor/ReferralHistory.jsx";
import ReferralDetail from "./pages/doctor/ReferralDetail.jsx";
import DoctorProfile from "./pages/doctor/DoctorProfile.jsx";

// Medical Director Pages
import MedicalDirectorDashboard from "./pages/medicalDirector/MedicalDirectorDashboard.jsx";
import ManageDoctors from "./pages/medicalDirector/ManageDoctors.jsx";
import ManageDepartments from "./pages/medicalDirector/ManageDepartments.jsx";
import MedicalDirectorProfile from "./pages/medicalDirector/MedicalDirectorProfile.jsx";
import ManagePatients from "./pages/medicalDirector/ManagePatients.jsx";
import ManageHospitals from "./pages/medicalDirector/ManageHospitals.jsx";
import ManageReceptionists from "./pages/medicalDirector/ManageReceptionists.jsx";
import ManageSpecialties from "./pages/medicalDirector/ManageSpecialties.jsx";
import ManageSpecialists from "./pages/medicalDirector/ManageSpecialists.jsx";
import ManageReferrals from "./pages/medicalDirector/ManageReferrals.jsx";      // list page with full CRUD
import ManageReferralDetail from "./pages/medicalDirector/ManageReferralDetail.jsx"; // detail page

// Patient Pages
import PatientDashboard from "./pages/patient/PatientDashboard.jsx";
import MyReferrals from "./pages/patient/MyReferrals.jsx";
import MapPage from "./pages/patient/MapPage.jsx";
import Profile from "./pages/patient/Profile.jsx";
import PatientConsultations from "./pages/patient/PatientConsultations.jsx";
import PatientConsultationDetail from "./pages/patient/PatientConsultationDetail.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminHospitals from "./pages/admin/AdminHospitals.jsx";
import AdminSpecialties from "./pages/admin/AdminSpecialties.jsx";
import AdminSpecialists from "./pages/admin/AdminSpecialists.jsx";
import AdminReferralsList from "./pages/admin/AdminReferralsList.jsx";
import AdminReferralDetail from "./pages/admin/AdminReferralDetail.jsx";
import AdminProfile from "./pages/admin/AdminProfile.jsx";

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
        <Route path="/unauthorized" element={<Unauthorized />} />
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
            <Route path="/receptionist/assigned-patients" element={<AssignedPatients />} />
          </Route>

          {/* ====================== DOCTOR ROUTES ====================== */}
          <Route element={<RoleRoute allowedRoles={["doctor"]} />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/patients" element={<MyPatients />} />
            <Route path="/doctor/consultation/:id" element={<ConsultationDetail />} />
            <Route path="/doctor/referral" element={<NewReferral />} />
            <Route path="/doctor/referral-history" element={<ReferralHistory />} />
            <Route path="/doctor/referrals/:id" element={<ReferralDetail />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />
          </Route>

          {/* ====================== MEDICAL DIRECTOR ROUTES ====================== */}
          <Route element={<RoleRoute allowedRoles={["medical_director"]} />}>
            <Route path="/medical-director" element={<MedicalDirectorDashboard />} />
            {/* Use ManageReferrals for the list view */}
            <Route path="/medical-director/referrals" element={<ManageReferrals />} />
            <Route path="/medical-director/referrals/:id" element={<ManageReferralDetail />} />
            <Route path="/medical-director/doctors" element={<ManageDoctors />} />
            <Route path="/medical-director/departments" element={<ManageDepartments />} />
            <Route path="/medical-director/profile" element={<MedicalDirectorProfile />} />
            <Route path="/medical-director/patients" element={<ManagePatients />} />
            <Route path="/medical-director/hospitals" element={<ManageHospitals />} />
            <Route path="/medical-director/receptionists" element={<ManageReceptionists />} />
            <Route path="/medical-director/specialties" element={<ManageSpecialties />} />
            <Route path="/medical-director/specialists" element={<ManageSpecialists />} />
          </Route>

          {/* ====================== PATIENT ROUTES ====================== */}
          <Route element={<RoleRoute allowedRoles={["patient"]} />}>
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/my-referrals" element={<MyReferrals />} />
            <Route path="/patient/map" element={<MapPage />} />
            <Route path="/patient/profile" element={<Profile />} />
            <Route path="/patient/consultations" element={<PatientConsultations />} />
            <Route path="/patient/consultations/:id" element={<PatientConsultationDetail />} />
          </Route>

          {/* ====================== ADMIN ROUTES ====================== */}
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/hospitals" element={<AdminHospitals />} />
            <Route path="/admin/specialties" element={<AdminSpecialties />} />
            <Route path="/admin/specialists" element={<AdminSpecialists />} />
            <Route path="/admin/referrals" element={<AdminReferralsList />} />
            <Route path="/admin/referrals/:id" element={<AdminReferralDetail />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;