import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import RoleRoute from "./routes/RoleRoute.jsx";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";

import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard.jsx";
import DoctorDashboard from "./pages/doctor/DoctorDashboard.jsx";
import MedicalDirectorDashboard from "./pages/medicalDirector/MedicalDirectorDashboard.jsx";
import PatientDashboard from "./pages/patient/PatientDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminHospitals from "./pages/admin/AdminHospitals.jsx";
import AdminSpecialists from "./pages/admin/AdminSpecialists.jsx";
import AdminReferrals from "./pages/admin/AdminReferrals.jsx";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route element={<RoleRoute allowedRoles={["receptionist"]} />}>
            <Route path="/receptionist" element={<ReceptionistDashboard />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["doctor"]} />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["medical_director"]} />}>
            <Route path="/medical-director" element={<MedicalDirectorDashboard />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["patient"]} />}>
            <Route path="/patient" element={<PatientDashboard />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/hospitals" element={<AdminHospitals />} />
            <Route path="/admin/specialists" element={<AdminSpecialists />} />
            <Route path="/admin/referrals" element={<AdminReferrals />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;