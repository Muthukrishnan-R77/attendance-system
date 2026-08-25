import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Alert from '../components/Alert';
import { employeeService } from '../services/employeeService';
import { ArrowLeft, UserPlus, Save } from 'lucide-react';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'Engineering',
    position: '',
    role: 'EMPLOYEE'
  });

  const [alert, setAlert] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    // Client-side validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.position.trim()) {
      setAlert({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    if (formData.password.length < 6) {
      setAlert({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await employeeService.create(formData);
      if (res.success) {
        navigate('/admin/employees', { state: { message: 'Employee added successfully!' } });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to create employee.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Add New Employee" />

        <div className="page-container">
          <div style={{ marginBottom: '1.5rem' }}>
            <Link to="/admin/employees" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '0.5rem 1rem' }}>
              <ArrowLeft size={18} />
              <span>Back to Employee List</span>
            </Link>
          </div>

          <div className="table-card" style={{ maxWidth: '800px', padding: '2rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFF' }}>
                Employee Registration Form
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Enter the details of the new staff member to create their account.
              </p>
            </div>

            {alert.message && <Alert type={alert.type} message={alert.message} />}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="e.g. john@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Password * (min 6 chars)</label>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-input"
                    placeholder="e.g. +1 987-654-3210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    name="department"
                    className="form-select"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Management">Management</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Position / Job Title *</label>
                  <input
                    type="text"
                    name="position"
                    className="form-input"
                    placeholder="e.g. Senior Frontend Developer"
                    value={formData.position}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role Access *</label>
                  <select
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="EMPLOYEE">EMPLOYEE (Standard)</option>
                    <option value="ADMIN">ADMIN (Manager Access)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <Link to="/admin/employees" className="btn btn-secondary">
                  Cancel
                </Link>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  <Save size={18} />
                  <span>{submitting ? 'Creating...' : 'Save Employee'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
