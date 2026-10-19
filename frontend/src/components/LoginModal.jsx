import React, { useState } from 'react';
import { X, Lock, Mail, User, BookOpen, Phone, Shield } from 'lucide-react';
import { api } from '../api/client';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState('3');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let res;
      if (isRegister) {
        res = await api.register({
          name,
          email,
          phone,
          department,
          year: parseInt(year),
          password
        });
      } else {
        res = await api.login(email, password);
      }

      localStorage.setItem('campus_token', res.token);
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = async (demoEmail) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(demoEmail, 'password123');
      localStorage.setItem('campus_token', res.token);
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460, padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 800 }}>{isRegister ? 'Student Registration' : 'Campus Portal Sign In'}</h2>
          <button onClick={onClose} style={{ background: 'transparent', color: '#64748b', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#dc2626',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: 16
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isRegister && (
            <>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: 5, fontWeight: 600 }}>Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Alex Rivera" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  style={{ width: '100%' }}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: 5, fontWeight: 600 }}>Department</label>
                  <select 
                    value={department} 
                    onChange={(e) => setDepartment(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                    <option value="Information Tech">Information Tech</option>
                    <option value="Mechanical Engg">Mechanical Engg</option>
                    <option value="Design & Media">Design & Media</option>
                    <option value="Electrical Engg">Electrical Engg</option>
                    <option value="Biotechnology">Biotechnology</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: 5, fontWeight: 600 }}>Academic Year</label>
                  <select 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: 5, fontWeight: 600 }}>Phone</label>
                <input 
                  type="text" 
                  placeholder="+1-555-0101" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: 5, fontWeight: 600 }}>Campus Email</label>
            <input 
              type="email" 
              placeholder="e.g. alex@campus.edu" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={{ width: '100%' }}
              required 
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: 5, fontWeight: 600 }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ width: '100%' }}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '12px', marginTop: 8 }}>
            {loading ? 'Please wait...' : isRegister ? 'Register Student' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          {isRegister ? 'Already registered?' : "Don't have an account yet?"}{' '}
          <button 
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'transparent', color: '#4f46e5', fontWeight: 700, cursor: 'pointer', border: 'none' }}
          >
            {isRegister ? 'Sign in' : 'Create Student Account'}
          </button>
        </div>

        {/* Viva Quick Login Helpers */}
        <div style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid rgba(226, 232, 240, 0.9)'
        }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: 8, letterSpacing: '0.04em' }}>
            Quick 1-Click Login for Faculty / Viva:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.78rem', padding: '8px' }}
              onClick={() => handleQuickSelect('admin@campus.edu')}
            >
              👑 Admin (Dr. Sharma)
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.78rem', padding: '8px' }}
              onClick={() => handleQuickSelect('alex@campus.edu')}
            >
              🎓 Student (Alex Rivera)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
