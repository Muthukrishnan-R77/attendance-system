import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { dashboardService } from '../services/dashboardService';
import { attendanceService } from '../services/attendanceService';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    checkedIn: 0
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [statsData, attendanceData] = await Promise.all([
          dashboardService.getStats(),
          attendanceService.getAllAttendance()
        ]);

        if (statsData.success) {
          setStats(statsData.stats);
        }
        if (attendanceData.success) {
          setRecentAttendance(attendanceData.attendance.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const formatTime = (timeStr) => {
    if (!timeStr) return '-- : --';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Admin Dashboard Overview" />

        <div className="page-container">
          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="Total Employees"
              value={loading ? '...' : stats.totalEmployees}
              icon={Users}
              colorClass=""
            />
            <StatCard
              title="Present Today"
              value={loading ? '...' : stats.presentToday}
              icon={UserCheck}
              colorClass="emerald"
            />
            <StatCard
              title="Absent Today"
              value={loading ? '...' : stats.absentToday}
              icon={UserX}
              colorClass="rose"
            />
            <StatCard
              title="Checked In"
              value={loading ? '...' : stats.checkedIn}
              icon={Clock}
              colorClass="amber"
            />
          </div>

          {/* Recent Today Activity Table */}
          <div className="table-card">
            <div className="table-header-bar">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  Today's Live Attendance Feed
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Recent employee check-in & check-out events
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No attendance records recorded for today yet.
                      </td>
                    </tr>
                  ) : (
                    recentAttendance.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: '600' }}>{item.employee_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.employee_email}</div>
                        </td>
                        <td>{String(item.attendance_date).slice(0, 10)}</td>
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

export default AdminDashboard;
