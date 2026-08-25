import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A', color: '#94A3B8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Loading application...</div>
          <div style={{ fontSize: '0.875rem' }}>Verifying credentials...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
