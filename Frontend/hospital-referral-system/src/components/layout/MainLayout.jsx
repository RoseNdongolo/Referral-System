import { Outlet } from "react-router-dom";
import TopBar from "../common/TopBar.jsx";
import Footer from "../common/Footer.jsx";
import BackgroundLayer from "../../pages/background/BackgroundLayer.jsx";
import "./MainLayout.css";

export default function MainLayout() {
  return (
    <div className="main-layout">
      <BackgroundLayer />

      <TopBar
        showUser={false}
        showLogout={false}
      />

      <main className="page-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}