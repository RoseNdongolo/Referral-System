import { useState, useEffect } from "react";
import { getAllPatients } from "../../services/receptionistService";
import "./AllPatients.css";

export default function AllPatients() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getAllPatients();
        setPatients(data);
        console.log("Patients data:", data); // Debug: see what backend returns
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((p) =>
    (p.full_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Loading patients...</p>;

  return (
    <div className="all-patients">
      <div className="page-header">
        <h1>All Patients</h1>
        <input
          type="text"
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>National ID</th>
              <th>Date Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.full_name || "Unnamed"}</td>
                <td>{patient.phone_number || "—"}</td>
                <td>{patient.national_id || "—"}</td>
                <td>—</td>
                <td><button className="btn-small">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}