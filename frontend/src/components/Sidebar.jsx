import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, CalendarCheck, LogOut, Clock, X, FileText } from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggleSidebar = () => {
      setMobileOpen((prev) => !prev);
    };

    const handleCloseSidebar = () => {
      setMobileOpen(false);
    };

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('toggle-mobile-sidebar', handleToggleSidebar);
    window.addEventListener('close-mobile-sidebar', handleCloseSidebar);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('toggle-mobile-sidebar', handleToggleSidebar);
      window.removeEventListener('close-mobile-sidebar', handleCloseSidebar);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const closeSidebar = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('close-mobile-sidebar'));
    }
  };

  const handleLogout = () => {
    logout();
    closeSidebar();
    navigate('/login');
  };

  return (
    <>
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#FFF' }}>Attendify</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attendance Portal</div>
            </div>
          </div>

          <button
            type="button"
            className="mobile-close-btn"
            onClick={closeSidebar}
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>

        <ul className="nav-list">
          {isAdmin ? (
            <>
              <li>
                <NavLink to="/admin/dashboard" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/employees" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <Users size={20} />
                  <span>Employees</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/attendance" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <CalendarCheck size={20} />
                  <span>Attendance Log</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/leaves" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <FileText size={20} />
                  <span>Leave Requests</span>
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/employee/dashboard" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/employee/attendance" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <CalendarCheck size={20} />
                  <span>My Attendance</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/employee/leaves" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <FileText size={20} />
                  <span>Leave Application</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>

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
    </>
  );
};

export default Sidebar;
