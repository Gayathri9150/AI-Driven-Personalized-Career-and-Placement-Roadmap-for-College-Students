import React, { useState } from 'react';
import { X, UserPlus, LogIn, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, setAuthToken } from '../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');
  const [cgpa, setCgpa] = useState(8.5);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.login(email, password);
      setAuthToken(res.token);
      localStorage.setItem('career_app_user', JSON.stringify(res.student));
      setSuccessMsg('Logged in successfully!');
      setTimeout(() => {
        onAuthSuccess(res.student);
        onClose();
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setErrorMsg('Full name, email, and password are required.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.register({
        email,
        password,
        full_name: fullName,
        department,
        year_of_study: yearOfStudy,
        cgpa: parseFloat(cgpa) || 7.5
      });
      setAuthToken(res.token);
      localStorage.setItem('career_app_user', JSON.stringify(res.student));
      setSuccessMsg('Account registered successfully!');
      setTimeout(() => {
        onAuthSuccess(res.student);
        onClose();
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.login('demo@student.edu', 'Password123');
      setAuthToken(res.token);
      localStorage.setItem('career_app_user', JSON.stringify(res.student));
      setSuccessMsg('Signed in as Demo Student!');
      setTimeout(() => {
        onAuthSuccess(res.student);
        onClose();
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>
              {isRegister ? 'Student Registration' : 'Student Sign In'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {isRegister ? 'Create your career & placement roadmap account' : 'Access your personalized learning and diagnostic progress'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="alert alert-warning" style={{ padding: '10px 14px' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success" style={{ padding: '10px 14px' }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1-Click Demo Login */}
        <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.25)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '13px', color: '#93c5fd' }}>Quick Instant Test:</strong>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Pre-loaded student (Gayathri R. - 3rd Year CSE with seeded projects & skills)
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleQuickDemoLogin} disabled={loading}>
              <Sparkles size={14} /> Use Demo Account
            </button>
          </div>
        </div>

        <form onSubmit={isRegister ? handleRegisterSubmit : handleLoginSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Gayathri R."
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Year of Study</label>
                  <select
                    className="form-select"
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Current CGPA (0 - 10)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">College Email *</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. demo@student.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              className="form-input"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px', padding: '12px' }}
            disabled={loading}
          >
            {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
            <span>{loading ? 'Processing...' : isRegister ? 'Complete Registration' : 'Sign In to Portal'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          {isRegister ? (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setErrorMsg(''); }}
                style={{ background: 'transparent', border: 'none', color: '#60a5fa', fontWeight: 600, cursor: 'pointer' }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New student?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(true); setErrorMsg(''); }}
                style={{ background: 'transparent', border: 'none', color: '#60a5fa', fontWeight: 600, cursor: 'pointer' }}
              >
                Create an Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
