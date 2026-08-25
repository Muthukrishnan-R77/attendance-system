import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, CalendarCheck, LogOut, Clock, ShieldAlert } from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Clock size={22} />
        </div>
        <div>
          <div style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#FFF' }}>Attendify</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attendance Portal</div>
        </div>
      </div>

      {/* Navigation Links */}
      <ul className="nav-list">
        {isAdmin ? (
          <>
            <li>
              <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/employees" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Users size={20} />
                <span>Employees</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <CalendarCheck size={20} />
                <span>Attendance Log</span>
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/employee/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/employee/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <CalendarCheck size={20} />
                <span>My Attendance</span>
              </NavLink>
            </li>
          </>
        )}
      </ul>

      {/* Bottom Profile & Logout Footer */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#FFF' }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
          </div>
          <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-employee'}`}>
            {user?.role}
          </span>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
