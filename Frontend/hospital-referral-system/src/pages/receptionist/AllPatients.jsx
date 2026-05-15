import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import receptionistService from '../../services/receptionistService';
import './AllPatients.css';

export default function AllPatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = () => {
    receptionistService.getAllPatients()
      .then(res => {
        const data = res.data.results || res.data;
        setPatients(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this patient permanently? This action cannot be undone.')) {
      try {
        await receptionistService.deletePatient(id);
        setPatients(patients.filter(p => p.id !== id));
      } catch (err) {
        alert('Delete failed: ' + (err.response?.data?.error || 'Unknown error'));
      }
    }
  };

  const handleEdit = (patient) => {
    navigate(`/receptionist/patients/${patient.id}/edit`, { state: { patient } });
  };

  const filteredPatients = patients.filter(p =>
    `${p.full_name || p.username} ${p.email} ${p.medical_record_number} ${p.phone_number || ''} ${p.gender || ''} ${p.national_id || ''} ${p.date_of_birth || ''}`
      .toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-state">Loading patients...</div>;

  return (
    <div className="patients-container">
      <h1>All Patients</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, email, MRN, phone, gender, national ID, DOB..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="patients-table-wrapper">
        <table className="patients-table">
          <thead>
            <tr>
              <th>MRN</th>
              <th>Full Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>National ID</th>
              <th>Date of Birth</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map(p => (
              <tr key={p.id}>
                <td>{p.medical_record_number}</td>
                <td>{p.full_name || `${p.first_name} ${p.last_name}`}</td>
                <td>{p.username}</td>
                <td>{p.email}</td>
                <td>{p.phone_number || '-'}</td>
                <td>{p.gender || '-'}</td>
                <td>{p.national_id || '-'}</td>
                <td>{p.date_of_birth || '-'}</td>
                <td>{p.address || '-'}</td>
                <td>
                  <button onClick={() => handleEdit(p)} className="edit-link">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="delete-link">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}