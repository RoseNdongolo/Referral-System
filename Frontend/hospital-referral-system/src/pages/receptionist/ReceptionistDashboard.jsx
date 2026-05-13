import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import "./ReceptionistDashboard.css";

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions = [
    {
      title: "Register New Patient",
      description: "Handle patient arrival and create new record",
      icon: "👤",
      path: "/receptionist/register-patient",
      color: "#4f46e5",
    },
    {
      title: "View All Patients",
      description: "Search and manage registered patients",
      icon: "📋",
      path: "/receptionist/patients",
      color: "#10b981",
    },
    {
      title: "Today's Referrals",
      description: "View current and pending referrals",
      icon: "🔄",
      path: "/receptionist/referrals",
      color: "#f59e0b",
    },
    {
      title: "Hospital Directory",
      description: "Browse available hospitals and specialties",
      icon: "🏥",
      path: "/receptionist/hospitals",
      color: "#8b5cf6",
    },
  ];

  return (
    <div className="receptionist-dashboard">
      <div className="welcome-section">
        <h1>Welcome back, {user?.first_name || "Receptionist"}!</h1>
        <p>Receptionist Dashboard - Manage patient arrivals and registrations</p>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="action-card"
              onClick={() => navigate(action.path)}
            >
              <div className="action-icon" style={{ backgroundColor: action.color + "20", color: action.color }}>
                {action.icon}
              </div>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
              <button className="btn-secondary">Go →</button>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <h3>Today's Registrations</h3>
          <div className="stat-number">12</div>
          <p className="stat-label">Patients registered</p>
        </div>
        <div className="stat-card">
          <h3>Pending Referrals</h3>
          <div className="stat-number">8</div>
          <p className="stat-label">Awaiting action</p>
        </div>
        <div className="stat-card">
          <h3>Active Hospitals</h3>
          <div className="stat-number">24</div>
          <p className="stat-label">Connected facilities</p>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <p className="placeholder">Recent patient registrations will appear here...</p>
      </div>
    </div>
  );
}