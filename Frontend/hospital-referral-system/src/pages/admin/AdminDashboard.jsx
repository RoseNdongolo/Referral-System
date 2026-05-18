// src/pages/admin/AdminDashboard.jsx
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-cards">
        <Link to="/admin/users" className="card">
          <div className="card-icon">👥</div>
          <h3>Manage Users</h3>
          <p>Create, edit, delete all users and roles</p>
        </Link>
        <Link to="/admin/hospitals" className="card">
          <div className="card-icon">🏥</div>
          <h3>Manage Hospitals</h3>
          <p>Add, update, or remove hospitals</p>
        </Link>
        <Link to="/admin/specialties" className="card">
          <div className="card-icon">📋</div>
          <h3>Manage Specialties</h3>
          <p>Medical specialties for referrals</p>
        </Link>
        <Link to="/admin/specialists" className="card">
          <div className="card-icon">👨‍⚕️</div>
          <h3>Manage Specialists</h3>
          <p>Doctors and their specialties</p>
        </Link>
        <Link to="/admin/referrals" className="card">
          <div className="card-icon">📄</div>
          <h3>All Referrals</h3>
          <p>View and manage all referrals</p>
        </Link>
      </div>
    </div>
  );
}