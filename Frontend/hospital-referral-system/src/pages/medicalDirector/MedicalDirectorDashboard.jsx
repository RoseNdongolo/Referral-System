// src/pages/medicalDirector/MedicalDirectorDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import medicalDirectorService from '../../services/medicalDirectorService';
import './MedicalDirectorDashboard.css';

export default function MedicalDirectorDashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ doctors: 0, pendingReferrals: 0, totalPatients: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, doctorsRes, referralsRes, patientsRes] = await Promise.all([
          medicalDirectorService.getMyProfile(),
          medicalDirectorService.getAllDoctors(),
          medicalDirectorService.getAllReferrals(),
          medicalDirectorService.getAllPatients(), // NEW
        ]);
        setProfile(profileRes.data);
        const doctors = doctorsRes.data;
        const referrals = referralsRes.data.results || referralsRes.data;
        const patients = patientsRes.data.results || patientsRes.data;
        setStats({
          doctors: doctors.length,
          pendingReferrals: referrals.filter(r => r.status === 'pending').length,
          totalPatients: patients.length,      // now correct
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-state">Loading dashboard...</div>;

  return (
    <div className="medical-director-dashboard">
      <div className="welcome-card">
        <h1>Welcome, Dr. {profile?.full_name || profile?.username}</h1>
        <p>Medical Director – Oversee hospital operations and referrals</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.doctors}</div>
          <div className="stat-label">Active Doctors</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pendingReferrals}</div>
          <div className="stat-label">Pending Referrals</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalPatients}</div>
          <div className="stat-label">Total Patients</div>
        </div>
      </div>

      <div className="quick-actions">
        <Link to="/medical-director/doctors" className="action-card">
          <div className="action-icon">👨‍⚕️</div>
          <h3>Manage Doctors</h3>
          <p>View, activate/deactivate, update specialties</p>
        </Link>
        <Link to="/medical-director/referrals" className="action-card">
          <div className="action-icon">📋</div>
          <h3>Oversee Referrals</h3>
          <p>Monitor all referrals across the system</p>
        </Link>
        <Link to="/medical-director/profile" className="action-card">
          <div className="action-icon">👤</div>
          <h3>My Profile</h3>
          <p>Update your personal information</p>
        </Link>
      </div>
    </div>
  );
}