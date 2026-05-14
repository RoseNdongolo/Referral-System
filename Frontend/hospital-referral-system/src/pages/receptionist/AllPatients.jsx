import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import receptionistService from '../../services/receptionistService';
import './AllPatients.css';

export default function AllPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    receptionistService.getAllPatients()
      .then(res => {
        const data = res.data.results || res.data;
        setPatients(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredPatients = patients.filter(p =>
    `${p.full_name || p.username} ${p.email} ${p.medical_record_number}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-state">Loading patients...</div>;

  return (
    <div className="patients-container">
      <h1>All Patients</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, username, email, MRN..."
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
                <td>
                  <Link to={`/receptionist/patients/${p.id}`} className="view-link">View</Link>
                  {/* Edit/Delete could be added */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}