import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import AttendanceHistory from './pages/AttendanceHistory';
import EmployeeLeavePage from './pages/EmployeeLeavePage';
import AdminLeaveApprovals from './pages/AdminLeaveApprovals';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/employees" element={<EmployeeManagement />} />
            <Route path="/admin/employees/add" element={<AddEmployee />} />
            <Route path="/admin/employees/edit/:id" element={<EditEmployee />} />
            <Route path="/admin/attendance" element={<AttendanceHistory />} />
            <Route path="/admin/leaves" element={<AdminLeaveApprovals />} />
          </Route>

          {/* Employee Protected Routes */}
          <Route element={<ProtectedRoute requiredRole="EMPLOYEE" />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/attendance" element={<AttendanceHistory />} />
            <Route path="/employee/leaves" element={<EmployeeLeavePage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
