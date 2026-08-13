import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import "./TopBar.css";
// ✅ Import your image
import logoImage from "../../assets/image.png";

export default function TopBar({
  showUser = true,
  showLogout = true,
  compact = false,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.username || "Guest";

  return (
    <header className={`topbar ${compact ? "topbar--compact" : ""}`}>
      <div className="topbar-brand">
        {/* ✅ Replace emoji with image */}
        <img src={logoImage} alt="Hospital Logo" className="topbar-logo" />
        <div className="topbar-brand-text">
          {/* Optionally change the text */}
          <strong>Hospital Referral System</strong>
          <small>Connecting Patients with Specialists</small>
        </div>
      </div>

      {showUser && user && (
        <div className="topbar-user">
          <div className="topbar-user-meta">
            <span className="topbar-user-name">{displayName}</span>
            <small className="topbar-user-role">
              {user?.role ? user.role.toUpperCase() : ""}
            </small>
          </div>

          {showLogout && (
            <button className="topbar-logout" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}