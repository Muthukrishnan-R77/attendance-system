import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { Clock, LogIn, Key, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(email, password);
      if (res.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid login credentials. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin@example.com');
      setPassword('admin123');
    } else {
      setEmail('john@example.com');
      setPassword('emp123');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            color: '#FFFFFF',
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
          }}>
            <Clock size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.025em' }}>
            Attendify Portal
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Employee Attendance Management System
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Key size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
          >
            {submitting ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn size={20} />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Fill Buttons */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
            Interview Demo Quick Fill
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              Fill Admin Creds
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('employee')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              Fill Employee Creds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
