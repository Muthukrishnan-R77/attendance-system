import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/attendanceService';
import { employeeService } from '../services/employeeService';
import { Calendar, Filter, RotateCcw } from 'lucide-react';

const AttendanceHistory = () => {
  const { user, isAdmin } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  
  // Filter state
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Load employee list for admin filter dropdown
  useEffect(() => {
    if (isAdmin) {
      employeeService.getAll().then((res) => {
        if (res.success) {
          setEmployeesList(res.employees);
        }
      }).catch(err => console.error('Failed to load employee filter list:', err));
    }
  }, [isAdmin]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDate) params.date = selectedDate;
      if (selectedStatus) params.status = selectedStatus;

      let res;
      if (isAdmin) {
        if (selectedEmployee) params.employee_id = selectedEmployee;
        res = await attendanceService.getAllAttendance(params);
      } else {
        res = await attendanceService.getMyAttendance(params);
      }

      if (res.success) {
        setAttendance(res.attendance);
      }
    } catch (err) {
      console.error('Error fetching attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedEmployee, selectedDate, selectedStatus]);

  const resetFilters = () => {
    setSelectedEmployee('');
    setSelectedDate('');
    setSelectedStatus('');
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-- : --';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title={isAdmin ? "All Attendance Logs" : "My Attendance Logs"} />

        <div className="page-container">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFF' }}>
              Attendance History
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {isAdmin ? "View and filter attendance logs for all employees across the organization." : "View your historical check-in and check-out records."}
            </p>
          </div>

          {/* Filter Toolbar */}
          <div className="table-card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              
              {/* Employee Filter (Admin only) */}
              {isAdmin && (
                <div style={{ flex: '1 1 200px' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Filter by Employee</label>
                  <select
                    className="form-select"
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                  >
                    <option value="">All Employees</option>
                    {employeesList.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date Filter */}
              <div style={{ flex: '1 1 180px' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Filter by Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div style={{ flex: '1 1 150px' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Filter by Status</label>
                <select
                  className="form-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {(selectedEmployee || selectedDate || selectedStatus) && (
                <div style={{ marginTop: 'auto' }}>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="btn btn-secondary"
                    style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}
                  >
                    <RotateCcw size={16} />
                    <span>Reset Filters</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="table-card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Loading attendance history...
                      </td>
                    </tr>
                  ) : attendance.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No attendance records found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    attendance.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: '600', color: '#FFF' }}>
                            {item.employee_name || user?.name}
                          </div>
                          {item.employee_email && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {item.employee_email}
                            </div>
                          )}
                        </td>
                        <td style={{ fontWeight: '500' }}>{String(item.attendance_date).slice(0, 10)}</td>
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

export default AttendanceHistory;
