import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { leaveService } from '../services/leaveService';
import { CalendarDays, FileText, Send } from 'lucide-react';

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-CA');
};

const EmployeeLeavePage = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [reason, setReason] = useState('');
  const [requests, setRequests] = useState([]);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    setRequests(leaveService.getMyRequests(user.email));
  }, [user]);

  const handleDateChange = (value) => {
    if (Array.isArray(value)) {
      setDateRange(value.length ? value : [new Date(), new Date()]);
      return;
    }
    setDateRange([value, value]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!user?.name || !user?.email) {
      setAlert({ type: 'error', message: 'User details are not available yet.' });
      return;
    }

    if (!dateRange?.[0]) {
      setAlert({ type: 'error', message: 'Please select at least one leave date.' });
      return;
    }

    if (!reason.trim()) {
      setAlert({ type: 'error', message: 'Please provide a leave reason.' });
      return;
    }

    const startDate = dateRange[0];
    const endDate = dateRange[1] || dateRange[0];

    setSubmitting(true);

    try {
      leaveService.submitRequest({
        employeeName: user.name,
        employeeEmail: user.email,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        reason: reason.trim()
      });

      setRequests(leaveService.getMyRequests(user.email));
      setReason('');
      setDateRange([new Date(), new Date()]);
      setAlert({ type: 'success', message: 'Leave request submitted successfully.' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Unable to submit leave request. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStart = dateRange?.[0] ? formatDate(dateRange[0]) : '';
  const selectedEnd = dateRange?.[1] ? formatDate(dateRange[1]) : selectedStart;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Leave Application" />

        <div className="page-container">
          <div className="leave-layout">
            <div className="table-card leave-form-card">
              <div className="table-header-bar">
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#FFF' }}>
                    Apply for Leave
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Select your leave dates and share your reason.
                  </p>
                </div>
              </div>

              {alert.message && <Alert type={alert.type} message={alert.message} />}

              <form onSubmit={handleSubmit} className="leave-form">
                <div className="calendar-card">
                  <Calendar
                    selectRange
                    onChange={handleDateChange}
                    value={dateRange}
                    className="leave-calendar"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Selected Leave Window</label>
                  <div className="date-chip-box">
                    <CalendarDays size={18} />
                    <span>
                      {selectedStart && selectedEnd
                        ? `${selectedStart} to ${selectedEnd}`
                        : 'Select dates from the calendar'}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason for Leave</label>
                  <textarea
                    className="form-input leave-textarea"
                    rows={5}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe the reason for your leave request..."
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  <Send size={18} />
                  <span>{submitting ? 'Submitting...' : 'Submit Leave Request'}</span>
                </button>
              </form>
            </div>

            <div className="table-card leave-history-card">
              <div className="table-header-bar">
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#FFF' }}>
                    My Leave Requests
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Track your submitted leave applications.
                  </p>
                </div>
              </div>

              <div className="leave-request-list">
                {requests.length === 0 ? (
                  <div className="empty-state">
                    <FileText size={32} />
                    <p>No leave requests submitted yet.</p>
                  </div>
                ) : (
                  requests.map((request) => (
                    <div key={request.id} className="leave-request-item">
                      <div className="leave-request-header">
                        <div>
                          <strong>{request.startDate} to {request.endDate}</strong>
                          <p>{request.reason}</p>
                        </div>
                        <span className={`badge ${request.status === 'APPROVED' ? 'badge-present' : request.status === 'REJECTED' ? 'badge-absent' : 'badge-employee'}`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeavePage;
