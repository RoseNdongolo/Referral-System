// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaHospital, FaUserMd, FaFileAlt, FaChartPie } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import adminService from '../../services/adminService';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    hospitals: 0,
    doctors: 0,
    referrals: 0,
  });
  const [loading, setLoading] = useState(true);

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || 'Admin';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, hospitalsRes, doctorsRes, referralsRes] = await Promise.all([
          adminService.getAllUsers(),
          adminService.getAllHospitals(),
          adminService.getAllSpecialists(),
          adminService.getAllReferrals(),
        ]);

        setStats({
          users: usersRes.data?.length || 0,
          hospitals: hospitalsRes.data?.length || 0,
          doctors: doctorsRes.data?.length || 0,
          referrals: referralsRes.data?.length || 0,
        });
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-state">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome, {displayName}</h1>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-item">
          <div className="stat-number">{stats.users}</div>
          <div className="stat-label"><FaUsers /> Total Users</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{stats.hospitals}</div>
          <div className="stat-label"><FaHospital /> Total Hospitals</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{stats.doctors}</div>
          <div className="stat-label"><FaUserMd /> Total Doctors</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{stats.referrals}</div>
          <div className="stat-label"><FaFileAlt /> Total Referrals</div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="dashboard-cards">
        <Link to="/admin/users" className="card">
          <div className="card-icon"><FaUsers /></div>
          <h3>Manage Users</h3>
          <p>Create, edit, delete all users and roles</p>
        </Link>
        <Link to="/admin/hospitals" className="card">
          <div className="card-icon"><FaHospital /></div>
          <h3>Manage Hospitals</h3>
          <p>Add, update, or remove hospitals</p>
        </Link>
        <Link to="/admin/doctors" className="card">
          <div className="card-icon"><FaUserMd /></div>
          <h3>Manage Doctors</h3>
          <p>Add, edit, or deactivate doctors</p>
        </Link>
        <Link to="/admin/referrals" className="card">
          <div className="card-icon"><FaFileAlt /></div>
          <h3>All Referrals</h3>
          <p>View and manage all referrals</p>
        </Link>
      </div>
    </div>
  );
}