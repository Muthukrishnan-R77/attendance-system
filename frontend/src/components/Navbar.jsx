import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="header">
      <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
        {title}
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>
            {user?.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {user?.position || user?.role}
          </div>
        </div>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-600)',
          color: '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          fontSize: '1rem'
        }}>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
