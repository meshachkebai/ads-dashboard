import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { path: '/dashboard', label: 'Overview' },
    { path: '/dashboard/campaigns', label: 'My Campaigns' },
    { path: '/dashboard/create', label: 'Create Campaign' },
    { path: '/dashboard/analytics', label: 'Analytics' },
    { path: '/dashboard/profile', label: 'Brand Profile' }
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
              end={item.path === '/dashboard'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}