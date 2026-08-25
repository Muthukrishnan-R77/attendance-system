import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/attendanceService';
import { LogIn, LogOut, CheckCircle2, Clock } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getMyAttendance();
      if (res.success) {
        setHistory(res.attendance);

        // Find today's record using local date YYYY-MM-DD
        const d = new Date();
        const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        
        const rec = res.attendance.find((item) => {
          if (!item.attendance_date) return false;
          const dtStr = String(item.attendance_date).slice(0, 10);
          return dtStr === todayStr;
        });
        setTodayRecord(rec || null);
      }
    } catch (err) {
      console.error('Error fetching attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const handleCheckIn = async () => {
    setAlert({ type: '', message: '' });
    try {
      setActionLoading(true);
      const res = await attendanceService.checkIn();
      if (res.success) {
        setAlert({ type: 'success', message: 'Checked in successfully!' });
        await fetchMyAttendance();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-in failed. Please try again.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setAlert({ type: '', message: '' });
    try {
      setActionLoading(true);
      const res = await attendanceService.checkOut();
      if (res.success) {
        setAlert({ type: 'success', message: 'Checked out successfully!' });
        await fetchMyAttendance();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-out failed. Please try again.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'Not checked out';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const currentTimeLabel = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const currentDateLabel = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const isCheckedIn = !!todayRecord?.check_in;
  const isCheckedOut = !!todayRecord?.check_out;
  const displayCheckInTime = isCheckedIn ? currentTimeLabel : 'Not checked in yet';
  const displayCheckOutTime = isCheckedOut ? formatTime(todayRecord.check_out) : 'Not checked out';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Employee Workspace" />

        <div className="page-container">
          {/* Welcome Greeting Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.05) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFF' }}>
              Welcome back, {user?.name}! 👋
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              {user?.position || 'Employee'} • {user?.department || 'General'} Department
            </p>
          </div>

          {alert.message && <Alert type={alert.type} message={alert.message} />}

          {/* Today's Attendance Punch Card */}
          <div className="table-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFF' }}>
                  Today's Attendance Status
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Date: {currentDateLabel}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Live Time
                </div>
                <span style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
                  {currentTimeLabel}
                </span>
                <span className={`badge ${isCheckedIn ? 'badge-present' : 'badge-employee'}`} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                  {isCheckedOut ? 'SHIFT COMPLETED' : isCheckedIn ? 'CHECKED IN' : 'NOT CHECKED IN'}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Check In Time
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: isCheckedIn ? 'var(--emerald-500)' : 'var(--text-subtle)' }}>
                  {displayCheckInTime}
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Check Out Time
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: isCheckedOut ? 'var(--amber-500)' : 'var(--text-subtle)' }}>
                  {displayCheckOutTime}
                </div>
              </div>
            </div>

            {/* Action Punch Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={isCheckedIn || actionLoading}
                className="btn btn-success"
                style={{ flex: 1, minWidth: '180px', padding: '0.9rem 1.5rem', fontSize: '1rem' }}
              >
                <LogIn size={20} />
                <span>{isCheckedIn ? 'Checked In' : 'Check In'}</span>
              </button>

              <button
                type="button"
                onClick={handleCheckOut}
                disabled={!isCheckedIn || isCheckedOut || actionLoading}
                className="btn btn-danger"
                style={{ flex: 1, minWidth: '180px', padding: '0.9rem 1.5rem', fontSize: '1rem' }}
              >
                <LogOut size={20} />
                <span>{isCheckedOut ? 'Checked Out' : 'Check Out'}</span>
              </button>
            </div>
          </div>

          {/* Recent History Table */}
          <div className="table-card">
            <div className="table-header-bar">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#FFF' }}>
                Recent Attendance Log
              </h3>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No past attendance records found.
                      </td>
                    </tr>
                  ) : (
                    history.slice(0, 10).map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: '600' }}>{String(item.attendance_date).slice(0, 10)}</td>
                        <td style={{ color: 'var(--emerald-500)', fontWeight: '600' }}>
                          {formatTime(item.check_in)}
                        </td>
                        <td style={{ color: item.check_out ? 'var(--amber-500)' : 'var(--text-subtle)', fontWeight: item.check_out ? '600' : 'normal' }}>
                          {formatTime(item.check_out)}
                        </td>
                        <td>
                          <span className={`badge ${item.status === 'PRESENT' ? 'badge-present' : 'badge-absent'}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
