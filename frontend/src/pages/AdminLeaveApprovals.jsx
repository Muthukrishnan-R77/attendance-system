import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Alert from '../components/Alert';
import { leaveService } from '../services/leaveService';
import { Check, X, Clock3 } from 'lucide-react';

const AdminLeaveApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const loadRequests = () => {
    setRequests(leaveService.getAll());
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleDecision = (id, status) => {
    const result = leaveService.updateStatus(id, status);
    if (result.success) {
      setAlert({
        type: status === 'APPROVED' ? 'success' : 'error',
        message: status === 'APPROVED' ? 'Leave request approved.' : 'Leave request rejected.'
      });
      loadRequests();
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Leave Approvals" />

        <div className="page-container">
          <div className="table-card">
            <div className="table-header-bar">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#FFF' }}>
                  Leave Requests
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Review and approve employee leave applications.
                </p>
              </div>
            </div>

            {alert.message && <Alert type={alert.type} message={alert.message} />}

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No leave requests available.
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <div style={{ fontWeight: '600', color: '#FFF' }}>{request.employeeName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{request.employeeEmail}</div>
                        </td>
                        <td>{request.startDate} to {request.endDate}</td>
                        <td>{request.reason}</td>
                        <td>
                          <span className={`badge ${request.status === 'APPROVED' ? 'badge-present' : request.status === 'REJECTED' ? 'badge-absent' : 'badge-employee'}`}>
                            {request.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn btn-success"
                              style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
                              onClick={() => handleDecision(request.id, 'APPROVED')}
                              disabled={request.status === 'APPROVED'}
                            >
                              <Check size={16} />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
                              onClick={() => handleDecision(request.id, 'REJECTED')}
                              disabled={request.status === 'REJECTED'}
                            >
                              <X size={16} />
                              <span>Reject</span>
                            </button>
                          </div>
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

export default AdminLeaveApprovals;
