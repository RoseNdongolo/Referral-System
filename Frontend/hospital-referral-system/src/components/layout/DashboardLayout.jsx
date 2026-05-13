// DashboardLayout.jsx

import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Sidebar from "../common/Sidebar.jsx";
import TopBar from "../common/TopBar.jsx";
import Footer from "../common/Footer.jsx";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard-layout">

      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* RIGHT CONTENT */}
      <div className="dashboard-shell">

        <TopBar
          showUser
          showLogout
          compact
        />

        <main className="dashboard-main">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}