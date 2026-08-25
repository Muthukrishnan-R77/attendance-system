import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Alert from '../components/Alert';
import { employeeService } from '../services/employeeService';
import { ArrowLeft, Save } from 'lucide-react';

const EditEmployee = () => {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadEmployee() {
      try {
        setLoading(true);
        const res = await employeeService.getById(id);
        if (res.success && res.employee) {
          const emp = res.employee;
          setFormData({
            name: emp.name || '',
            email: emp.email || '',
            password: '', // leave empty unless updating
            phone: emp.phone || '',
            department: emp.department || 'Engineering',
            position: emp.position || '',
            role: emp.role || 'EMPLOYEE'
          });
        }
      } catch (err) {
        console.error('Error fetching employee details:', err);
        setAlert({ type: 'error', message: 'Failed to load employee profile details.' });
      } finally {
        setLoading(false);
      }
    }
    loadEmployee();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!formData.name.trim() || !formData.email.trim() || !formData.position.trim()) {
      setAlert({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setAlert({ type: 'error', message: 'Password must be at least 6 characters long if changing.' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await employeeService.update(id, formData);
      if (res.success) {
        navigate('/admin/employees', { state: { message: 'Employee updated successfully!' } });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to update employee.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Navbar title="Edit Employee Profile" />
          <div className="page-container">
            <p style={{ color: 'var(--text-muted)' }}>Loading employee record...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Edit Employee Profile" />

        <div className="page-container">
          <div style={{ marginBottom: '1.5rem' }}>
            <Link to="/admin/employees" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '0.5rem 1rem' }}>
              <ArrowLeft size={18} />
              <span>Back to Employee Directory</span>
            </Link>
          </div>

          <div className="table-card" style={{ maxWidth: '800px', padding: '2rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFF' }}>
                Edit Employee #{id}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Update details for {formData.name}
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
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password (leave blank to keep unchanged)</label>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-input"
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
                  <span>{submitting ? 'Updating...' : 'Update Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmployee;
