// Sidebar.jsx

import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import "./Sidebar.css";

export default function Sidebar() {
  const { user } = useAuth();

  console.log("USER:", user);
  console.log("ROLE:", user?.role);

  // ================= RECEPTIONIST =================
  const receptionistLinks = [
    { to: "/receptionist", label: "Dashboard" },
    { to: "/receptionist/register-patient", label: "Register Patient" },
    { to: "/receptionist/patients", label: "All Patients" },
    { to: "/receptionist/patients/:id/assign", label: "Assign Patient" },
    { to: "/receptionist/assigned-patients", label: "Assigned Patients" },
    { to: "/receptionist/referrals", label: "Referrals" },
    { to: "/receptionist/profile", label: "Profile" },
  ];

  // ================= DOCTOR =================
  const doctorLinks = [
    { to: "/doctor", label: "Dashboard" },
    { to: "/doctor/patients", label: "My Patients" },
    { to: "/doctor/diagnosis", label: "Diagnosis" },
    { to: "/doctor/referral", label: "New Referral" },
    { to: "/doctor/referral-history", label: "Referral History" },
  ];

  // ================= MEDICAL DIRECTOR =================
  const medicalDirectorLinks = [
    { to: "/medical-director", label: "Dashboard" },          // fixed path
    { to: "/medical-director/doctors", label: "Manage Doctors" },
    { to: "/medical-director/departments", label: "Departments" },
    { to: "/medical-director/referrals", label: "Oversee Referrals" },
    { to: "/medical-director/assignments", label: "Staff Assignments" },
  ];

  // ================= PATIENT =================
  const patientLinks = [
    { to: "/patient", label: "Dashboard" },
    { to: "/patient/my-referrals", label: "My Referrals" },
    { to: "/patient/map", label: "Navigation Map" },
    { to: "/patient/profile", label: "Profile" },
  ];


  

  // ================= ADMIN =================
  const adminLinks = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/users", label: "Manage Users" },
    { to: "/admin/hospitals", label: "Hospitals" },
    { to: "/admin/specialists", label: "Specialists" },
    { to: "/admin/referrals", label: "All Referrals" },
  ];

  let links = [];
  let roleTitle = "";

  // Normalize role: lowercase and replace underscores with spaces for display
  const normalizedRole = (user?.role || "").toLowerCase().replace(/_/g, " ");

  switch (normalizedRole) {
    case "receptionist":
      links = receptionistLinks;
      roleTitle = "RECEPTIONIST";
      break;

    case "doctor":
    case "specialist":
      links = doctorLinks;
      roleTitle = (user?.role || "").toUpperCase();
      break;

    case "medical director":
      links = medicalDirectorLinks;
      roleTitle = "MEDICAL DIRECTOR";
      break;

    case "patient":
      links = patientLinks;
      roleTitle = "PATIENT";
      break;

    case "admin":
      links = adminLinks;
      roleTitle = "ADMIN";
      break;

    default:
      links = [];
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">🩺</span>
        <div className="logo-text">
          <strong>MEDIGRAPH</strong>
          <small>Hospital Referral System</small>
        </div>
      </div>

      {roleTitle && (
        <div className="sidebar-role">
          {roleTitle}
        </div>
      )}

      <nav className="sidebar-menu">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            end
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}