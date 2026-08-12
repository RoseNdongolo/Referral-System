// src/pages/doctor/DoctorDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaExchangeAlt, FaClipboardList, FaUserMd } from 'react-icons/fa';
import doctorService from '../../services/doctorService';
import './DoctorDashboard.css';

export default function DoctorDashboard() {
  const [profile, setProfile] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [stats, setStats] = useState({ active: 0, totalReferrals: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, consRes, refRes] = await Promise.all([
          doctorService.getMyProfile(),
          doctorService.getMyConsultations(),
          doctorService.getAllReferrals(),
        ]);
        setProfile(profileRes.data);
        const cons = consRes.data;
        setConsultations(cons);
        const activeCount = cons.filter(c => c.status === 'assigned' || c.status === 'in_progress').length;
        const referrals = refRes.data.results || refRes.data;
        setStats({ active: activeCount, totalReferrals: referrals.length });
      } catch (err) {
        // Silent fail in production – error can be sent to a logging service
        // For development, you can log: if (process.env.NODE_ENV === 'development') console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-state">Loading dashboard...</div>;

  return (
    <div className="doctor-dashboard-container">
      <div className="welcome-card">
        <h1>Welcome, Dr. {profile?.full_name || profile?.username}</h1>
        <p>Manage your patients and referrals</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active Consultations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalReferrals}</div>
          <div className="stat-label">Total Referrals Created</div>
        </div>
      </div>

      <div className="quick-actions">
        <Link to="/doctor/patients" className="action-card">
          <div className="action-icon"><FaUsers /></div>
          <h3>My Patients</h3>
          <p>View assigned patients</p>
        </Link>
        <Link to="/doctor/referral" className="action-card">
          <div className="action-icon"><FaExchangeAlt /></div>
          <h3>New Referral</h3>
          <p>Refer a patient to a specialist</p>
        </Link>
        <Link to="/doctor/referral-history" className="action-card">
          <div className="action-icon"><FaClipboardList /></div>
          <h3>Referral History</h3>
          <p>View past referrals</p>
        </Link>
      </div>

      <div className="info-card">
        <h2>Recent Consultations</h2>
        {consultations.length === 0 ? (
          <p>No patients assigned yet.</p>
        ) : (
          <ul className="recent-list">
            {consultations.slice(0, 5).map(c => (
              <li key={c.id}>
                {c.patient_name} – {c.status} – {new Date(c.assigned_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}