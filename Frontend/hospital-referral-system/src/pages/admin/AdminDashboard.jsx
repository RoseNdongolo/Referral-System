import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminService from "../../services/adminService";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentHospitals, setRecentHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const data = await adminService.getDashboardStats();

      setStats(data);

      setRecentUsers(data.recent_users || []);
      setRecentHospitals(data.recent_hospitals || []);
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>
            Manage hospitals, users, specialists, and referrals across the
            system.
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon">👥</div>
          <h3>Total Users</h3>
          <h2>{stats.total_users || 0}</h2>
        </div>

        <div className="kpi-card green">
          <div className="kpi-icon">🏥</div>
          <h3>Total Hospitals</h3>
          <h2>{stats.total_hospitals || 0}</h2>
        </div>

        <div className="kpi-card orange">
          <div className="kpi-icon">🩺</div>
          <h3>Specialists</h3>
          <h2>{stats.total_specialists || 0}</h2>
        </div>

        <div className="kpi-card purple">
          <div className="kpi-icon">📋</div>
          <h3>Total Referrals</h3>
          <h2>{stats.total_referrals || 0}</h2>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>

        <div className="quick-grid">
          <Link to="/admin/users" className="action-card">
            <span>👥</span>
            <h3>Manage Users</h3>
          </Link>

          <Link to="/admin/hospitals" className="action-card">
            <span>🏥</span>
            <h3>Manage Hospitals</h3>
          </Link>

          <Link to="/admin/specialists" className="action-card">
            <span>🩺</span>
            <h3>Manage Specialists</h3>
          </Link>

          <Link to="/admin/referrals" className="action-card">
            <span>📋</span>
            <h3>View Referrals</h3>
          </Link>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="dashboard-grid">

        {/* Recent Users */}
        <div className="dashboard-card">
          <h2>Recent Users</h2>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
              </tr>
            </thead>

            <tbody>
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>
                      <span className={`role ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Hospitals */}
        <div className="dashboard-card">
          <h2>Hospitals</h2>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
              </tr>
            </thead>

            <tbody>
              {recentHospitals.length > 0 ? (
                recentHospitals.map((hospital) => (
                  <tr key={hospital.id}>
                    <td>{hospital.name}</td>
                    <td>{hospital.location}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No hospitals available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}