// src/pages/admin/AdminDashboard.jsx
import { Link } from 'react-router-dom';
import { FaUsers, FaHospital, FaUserMd, FaFileAlt } from 'react-icons/fa';
import './AdminDashboard.css';

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
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
        <Link to="/admin/specialists" className="card">
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