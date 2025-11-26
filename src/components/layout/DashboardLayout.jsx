import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThemeToggle from '../ThemeToggle';
import { useBrandAuth } from '../../hooks/useBrandAuth';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { brandName, logout } = useBrandAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="header-left">
          <button className="hamburger-menu" onClick={toggleSidebar} aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="header-branding">
            <h1 className="brand-name">pairap</h1>
            <span className="brand-subtitle">Brand Partner Portal</span>
          </div>
        </div>
        
        <div className="header-right">
          <ThemeToggle />
          <div className="user-info">
            <div className="user-role">Brand Partner</div>
            <div className="user-name">{brandName}</div>
          </div>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}