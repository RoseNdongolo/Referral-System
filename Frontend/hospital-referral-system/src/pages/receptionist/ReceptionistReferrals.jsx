import { useState, useEffect } from "react";
import { getAllReferrals } from "../../services/receptionistService";
import "./ReceptionistReferrals.css";

export default function ReceptionistReferrals() {
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const data = await getAllReferrals();
        setReferrals(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchReferrals();
  }, []);

  return (
    <div className="referrals-page">
      <h1>Referrals</h1>

      <p>
        View all patient referrals initiated from this facility
      </p>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Referred To</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {referrals.map((ref) => (
              <tr key={ref.id}>
                <td>{ref.patient}</td>

                <td>{ref.hospital}</td>

                <td>{ref.date}</td>

                <td>
                  <span
                    className={`status ${ref.status.toLowerCase()}`}
                  >
                    {ref.status}
                  </span>
                </td>

                <td>
                  <button className="btn-small">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}