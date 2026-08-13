// Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import "./Sidebar.css";
import logoImage from "../../assets/image.png";

export default function Sidebar() {
  const { user } = useAuth();

  console.log("USER:", user);
  console.log("ROLE:", user?.role);

  // ================= RECEPTIONIST =================
  const receptionistLinks = [
    { to: "/receptionist", label: "Dashboard" },
    { to: "/receptionist/register-patient", label: "Register Patient" },
    { to: "/receptionist/patients", label: "All Patients" },
    { to: "/receptionist/assign-patient", label: "Assign Patient" },
    { to: "/receptionist/assigned-patients", label: "Assigned Patients" },
    { to: "/receptionist/referrals", label: "Referrals" },
    { to: "/receptionist/profile", label: "Profile" },
  ];

  // ================= DOCTOR =================
  const doctorLinks = [
    { to: "/doctor", label: "Dashboard" },
    { to: "/doctor/patients", label: "My Patients" },
    { to: "/doctor/referral", label: "New Referral" },
    { to: "/doctor/referral-history", label: "Referral History" },
    { to: "/doctor/profile", label: "Profile" },
  ];

  // ================= MEDICAL DIRECTOR =================
  const medicalDirectorLinks = [
    { to: "/medical-director", label: "Dashboard" },
    { to: "/medical-director/doctors", label: "Manage Doctors" },
    { to: "/medical-director/hospitals", label: "Manage Hospitals" },
    { to: "/medical-director/specialties", label: "Manage Specialties" },
    { to: "/medical-director/departments", label: "Departments" },
    { to: "/medical-director/receptionists", label: "Manage Receptionists" },
    { to: "/medical-director/patients", label: "Manage Patients" },
    { to: "/medical-director/referrals", label: "Manage Referrals" },
    { to: "/medical-director/profile", label: "Profile" },
  ];

  // ================= PATIENT =================
  const patientLinks = [
    { to: "/patient", label: "Dashboard" },
    { to: "/patient/my-referrals", label: "My Referrals" },
    { to: "/patient/consultations", label: "Medical Records" },
    { to: "/patient/map", label: "Navigation Map" },
    { to: "/patient/profile", label: "Profile" },
  ];

  // ================= ADMIN =================
  const adminLinks = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/users", label: "Manage Users" },
    { to: "/admin/hospitals", label: "Hospitals" },
    { to: "/admin/doctors", label: "Doctors" },          // ✅ fixed: lowercase
    { to: "/admin/departments", label: "Departments" },
    { to: "/admin/referrals", label: "All Referrals" },
    { to: "/admin/specialties", label: "Specialties" },
    { to: "/admin/profile", label: "Profile" },
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
        <img src={logoImage} alt="Hospital Logo" className="sidebar-logo-img" />
        <div className="sidebar-brand-text">
          <strong>Hospital Referral System</strong>
          <small>Connecting Patients with Specialists</small>
        </div>
      </div>

      {roleTitle && <div className="sidebar-role">{roleTitle}</div>}

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