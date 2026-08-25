import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { dashboardService } from '../services/dashboardService';
import { attendanceService } from '../services/attendanceService';
import { leaveService } from '../services/leaveService';
import { Users, UserCheck, UserX, Clock, FileText } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    checkedIn: 0
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
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

        setLeaveSummary(leaveService.getSummary());
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

  const chartData = [
    { name: 'Present', value: Number(stats.presentToday || 0) },
    { name: 'Absent', value: Number(stats.absentToday || 0) },
    { name: 'Leaves', value: Number(leaveSummary.pending + leaveSummary.approved) },
    { name: 'Pending', value: Number(leaveSummary.pending || 0) }
  ];

  const pieData = [
    { name: 'Present', value: Number(stats.presentToday || 0), color: '#10B981' },
    { name: 'Absent', value: Number(stats.absentToday || 0), color: '#F43F5E' },
    { name: 'Leave Requests', value: Number(leaveSummary.total || 0), color: '#F59E0B' },
    { name: 'Employees', value: Number(stats.totalEmployees || 0), color: '#6366F1' }
  ];

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
            <StatCard
              title="Leave Requests"
              value={loading ? '...' : leaveSummary.total}
              icon={FileText}
              colorClass="amber"
            />
          </div>

          <div className="analytics-grid">
            <div className="table-card chart-card">
              <div className="table-header-bar">
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)' }}>Attendance Summary</h3>
                </div>
              </div>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="name" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366F1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="table-card chart-card">
              <div className="table-header-bar">
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)' }}>Breakdown</h3>
                </div>
              </div>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
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
