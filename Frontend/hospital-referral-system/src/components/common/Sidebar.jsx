import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import "./Sidebar.css";

export default function Sidebar() {
  const { user } = useAuth();

  const doctorLinks = [
    { to: "/doctor", label: "Dashboard" },
    { to: "/doctor/patients", label: "Patients" },
    { to: "/doctor/add-patient", label: "Add Patient" },
    { to: "/doctor/diagnosis", label: "Diagnosis" },
    { to: "/doctor/referral", label: "New Referral" },
    { to: "/doctor/referral-history", label: "Referral History" },
  ];

  const patientLinks = [
    { to: "/patient", label: "Dashboard" },
    { to: "/patient/my-referrals", label: "My Referrals" },
    { to: "/patient/map", label: "Map View" },
    { to: "/patient/profile", label: "Profile" },
  ];

  const adminLinks = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/hospitals", label: "Hospitals" },
    { to: "/admin/specialists", label: "Specialists" },
    { to: "/admin/referrals", label: "Referrals" },
  ];

  const links =
    user?.role === "doctor"
      ? doctorLinks
      : user?.role === "patient"
      ? patientLinks
      : adminLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span>🩺</span> MEDIGRAPH
      </div>

      <div className="sidebar-menu">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}