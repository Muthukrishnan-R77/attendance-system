import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import { employeeService } from '../services/employeeService';
import { Plus, Search, Filter, Edit, Trash2, UserPlus } from 'lucide-react';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (department) params.department = department;
      if (role) params.role = role;

      const res = await employeeService.getAll(params);
      if (res.success) {
        setEmployees(res.employees);
      }
    } catch (err) {
      console.error('Error loading employees:', err);
      setAlert({ type: 'error', message: 'Failed to load employee records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, department, role]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const res = await employeeService.delete(deleteTarget.id);
      if (res.success) {
        setAlert({ type: 'success', message: res.message || 'Employee deleted successfully.' });
        setDeleteTarget(null);
        fetchEmployees();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete employee.';
      setAlert({ type: 'error', message: msg });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Employee Directory & Management" />

        <div className="page-container">
          {/* Top Control Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFF' }}>
                Employees ({employees.length})
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Add, search, filter, edit and manage team members.
              </p>
            </div>
            <Link to="/admin/employees/add" className="btn btn-primary">
              <UserPlus size={18} />
              <span>Add New Employee</span>
            </Link>
          </div>

          {alert.message && <Alert type={alert.type} message={alert.message} />}

          {/* Table Container & Filter Toolbar */}
          <div className="table-card">
            <div className="table-header-bar">
              {/* Search Bar */}
              <div style={{ position: 'relative', flex: '1 1 260px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              </div>

              {/* Department Filter Dropdown */}
              <div style={{ minWidth: '180px' }}>
                <select
                  className="form-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Management">Management</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              {/* Role Filter Dropdown */}
              <div style={{ minWidth: '150px' }}>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                </select>
              </div>
            </div>

            {/* Employee Data Table */}
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Role</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Loading employee records...
                      </td>
                    </tr>
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No employees match the specified criteria.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp.id}>
                        <td style={{ fontWeight: '600', color: '#FFF' }}>{emp.name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.phone || 'N/A'}</td>
                        <td>{emp.department || 'N/A'}</td>
                        <td>{emp.position || 'N/A'}</td>
                        <td>
                          <span className={`badge ${emp.role === 'ADMIN' ? 'badge-admin' : 'badge-employee'}`}>
                            {emp.role}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <Link
                              to={`/admin/employees/edit/${emp.id}`}
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                              title="Edit Employee"
                            >
                              <Edit size={16} />
                              <span>Edit</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => setDeleteTarget(emp)}
                              className="btn btn-danger"
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                              title="Delete Employee"
                            >
                              <Trash2 size={16} />
                              <span>Delete</span>
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

      {/* Confirmation Modal for Deleting Employee */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Delete Employee"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="btn btn-secondary"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="btn btn-danger"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Employee'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
          Are you sure you want to delete employee <strong>"{deleteTarget?.name}"</strong> ({deleteTarget?.email})?
        </p>
        <p style={{ color: 'var(--rose-500)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          ⚠️ This action will remove the employee record and all associated attendance logs permanently.
        </p>
      </Modal>
    </div>
  );
};

export default EmployeeManagement;
