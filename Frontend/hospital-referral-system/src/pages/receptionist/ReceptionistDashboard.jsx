import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import receptionistService from '../../services/receptionistService';
import './ReceptionistDashboard.css';

export default function ReceptionistDashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ patientsToday: 0, totalPatients: 0, pendingReferrals: 0 });
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentReferrals, setRecentReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, patientsRes, referralsRes] = await Promise.all([
          receptionistService.getMyProfile(),
          receptionistService.getAllPatients(),
          receptionistService.getAllReferrals(),
        ]);
        setProfile(profileRes.data);

        const patients = patientsRes.data.results || patientsRes.data;
        const referrals = referralsRes.data.results || referralsRes.data;

        const today = new Date().toISOString().slice(0,10);
        const patientsToday = patients.filter(p => p.created_at?.slice(0,10) === today).length;

        setStats({
          patientsToday,
          totalPatients: patients.length,
          pendingReferrals: referrals.filter(r => r.status === 'pending').length,
        });

        setRecentPatients(patients.slice(-5).reverse());
        setRecentReferrals(referrals.slice(-5).reverse());
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
    <div className="dashboard-container">
      <div className="welcome-card">
        <h1>Welcome back, {profile?.full_name || profile?.username}!</h1>
        <p>Receptionist Panel – Manage patient registrations and referrals</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.patientsToday}</div>
          <div className="stat-label">Patients Registered Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalPatients}</div>
          <div className="stat-label">Total Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pendingReferrals}</div>
          <div className="stat-label">Pending Referrals</div>
        </div>
      </div>

      <div className="quick-actions">
        <Link to="/receptionist/register-patient" className="action-card">
          <div className="action-icon">➕</div>
          <h3>Register Patient</h3>
          <p>Add a new patient to the system</p>
        </Link>
        <Link to="/receptionist/patients" className="action-card">
          <div className="action-icon">📋</div>
          <h3>All Patients</h3>
          <p>View and manage patient records</p>
        </Link>
        <Link to="/receptionist/referrals" className="action-card">
          <div className="action-icon">🔄</div>
          <h3>Referrals</h3>
          <p>View all referral requests</p>
        </Link>
        <Link to="/receptionist/profile" className="action-card">
          <div className="action-icon">👤</div>
          <h3>My Profile</h3>
          <p>Update your personal information</p>
        </Link>
      </div>

      <div className="info-card">
        <h2>Recently Registered Patients</h2>
        {recentPatients.length === 0 ? (
          <p>No patients registered yet.</p>
        ) : (
          <ul className="recent-list">
            {recentPatients.map(p => (
              <li key={p.id}>
                {p.full_name || p.username} – {new Date(p.created_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="info-card">
        <h2>Recent Referrals</h2>
        {recentReferrals.length === 0 ? (
          <p>No referrals yet.</p>
        ) : (
          <ul className="recent-list">
            {recentReferrals.map(r => (
              <li key={r.id}>
                {r.patient_name || r.patient?.username} → {r.hospital_details?.name} ({r.status})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}