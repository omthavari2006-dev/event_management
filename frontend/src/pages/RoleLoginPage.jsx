import React, { useState } from 'react';
import { 
  GraduationCap, Users, Shield, ArrowRight, Lock, Mail, 
  Sparkles, CheckCircle, Compass, User, BookOpen, Phone, KeyRound, Award
} from 'lucide-react';
import { api } from '../api/client';

export default function RoleLoginPage({ onLoginSuccess, onExploreGuest }) {
  const [selectedRole, setSelectedRole] = useState('Student'); // 'Student' | 'Organizer' | 'Admin'
  const [isRegistering, setIsRegistering] = useState(false);

  // Form fields
  const [email, setEmail] = useState('alex@campus.edu');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState('3');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Quick preset accounts per role
  const rolePresets = {
    Student: [
      { name: 'Alex Rivera', email: 'alex@campus.edu', dept: 'Computer Science (Year 3)', badge: '120 Points' },
      { name: 'Sarah Jenkins', email: 'sarah@campus.edu', dept: 'Information Tech (Year 2)', badge: '60 Points' }
    ],
    Organizer: [
      { name: 'Alex Rivera (President)', email: 'alex@campus.edu', club: 'CodeCraft Developers Club', badge: 'Tech & Hackathons' },
      { name: 'Marcus Chen (President)', email: 'marcus@campus.edu', club: 'Robotics & Automation Society', badge: 'Drones & Hardware' }
    ],
    Admin: [
      { name: 'Dr. Sharma (Dean)', email: 'admin@campus.edu', dept: 'Dean of Student Affairs', badge: 'Full Campus Authority' }
    ]
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setIsRegistering(false);
    setError(null);
    if (role === 'Admin') {
      setEmail('admin@campus.edu');
      setPassword('password123');
    } else if (role === 'Organizer') {
      setEmail('alex@campus.edu');
      setPassword('password123');
    } else {
      setEmail('alex@campus.edu');
      setPassword('password123');
    }
  };

  const handleQuickPreset = (presetEmail) => {
    setEmail(presetEmail);
    setPassword('password123');
    handleLoginDirect(presetEmail, 'password123');
  };

  const handleLoginDirect = async (userEmail, userPassword) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(userEmail, userPassword);
      localStorage.setItem('campus_token', res.token);
      onLoginSuccess(res.user, selectedRole);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        const res = await api.register({
          name,
          email,
          phone,
          department,
          year: parseInt(year),
          password
        });
        localStorage.setItem('campus_token', res.token);
        onLoginSuccess(res.user, 'Student');
      } else {
        const res = await api.login(email, password);
        localStorage.setItem('campus_token', res.token);
        onLoginSuccess(res.user, selectedRole);
      }
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '48px 24px',
      position: 'relative',
      background: '#090d16',
      backgroundImage: `
        radial-gradient(circle at 20% 15%, rgba(99, 102, 241, 0.15) 0%, transparent 45%),
        radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 45%),
        radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 60%)
      `,
      backgroundAttachment: 'fixed'
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', maxWidth: 840, marginBottom: 40 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 18px',
          borderRadius: 30,
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#818cf8',
          fontSize: '0.84rem',
          fontWeight: 700,
          marginBottom: 18,
          letterSpacing: '0.02em'
        }}>
          <Sparkles size={15} /> Campus Event Management System • Neo4j Graph DBMS
        </div>

        <h1 style={{
          fontSize: '3.2rem',
          lineHeight: 1.12,
          marginBottom: 14,
          letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Select Your Campus Role to Begin
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: 650, margin: '0 auto' }}>
          Choose your authorized role below. Each portal provides custom capabilities, 
          graph traversals, and governance workflows.
        </p>
      </div>

      {/* Role Selection Interactive Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        gap: 24,
        maxWidth: 1040,
        width: '100%',
        marginBottom: 36
      }}>
        {/* Role 1: Student */}
        <div 
          onClick={() => handleSelectRole('Student')}
          style={{
            background: selectedRole === 'Student' 
              ? 'linear-gradient(135deg, rgba(23, 31, 51, 0.98) 0%, rgba(30, 41, 67, 0.9) 100%)' 
              : 'rgba(23, 31, 51, 0.5)',
            border: selectedRole === 'Student' ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            padding: 28,
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: selectedRole === 'Student' ? '0 16px 36px rgba(99, 102, 241, 0.35)' : '0 4px 16px rgba(0,0,0,0.2)',
            transform: selectedRole === 'Student' ? 'translateY(-6px)' : 'none',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {selectedRole === 'Student' && (
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '4px 14px',
              borderBottomLeftRadius: 12
            }}>
              SELECTED
            </div>
          )}

          <div style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: 18,
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
          }}>
            <GraduationCap size={28} />
          </div>

          <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: 6 }}>Student Portal</h3>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.55, marginBottom: 16 }}>
            Browse events, register with capacity locks, join waitlists, form teams, and download verified certificates.
          </p>

          <div style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Personalized Recommendations</span> &rarr;
          </div>
        </div>

        {/* Role 2: Club Organizer */}
        <div 
          onClick={() => handleSelectRole('Organizer')}
          style={{
            background: selectedRole === 'Organizer' 
              ? 'linear-gradient(135deg, rgba(38, 24, 48, 0.98) 0%, rgba(30, 35, 65, 0.9) 100%)' 
              : 'rgba(23, 31, 51, 0.5)',
            border: selectedRole === 'Organizer' ? '2px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            padding: 28,
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: selectedRole === 'Organizer' ? '0 16px 36px rgba(236, 72, 153, 0.35)' : '0 4px 16px rgba(0,0,0,0.2)',
            transform: selectedRole === 'Organizer' ? 'translateY(-6px)' : 'none',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {selectedRole === 'Organizer' && (
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '4px 14px',
              borderBottomLeftRadius: 12
            }}>
              SELECTED
            </div>
          )}

          <div style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: 18,
            boxShadow: '0 8px 20px rgba(236, 72, 153, 0.4)'
          }}>
            <Users size={28} />
          </div>

          <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: 6 }}>Club Organizer Studio</h3>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.55, marginBottom: 16 }}>
            Create events with venue clash validation, manage registrations, track attendance, and declare winners.
          </p>

          <div style={{ fontSize: '0.78rem', color: '#f472b6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Venue Clash Guard & Check-in</span> &rarr;
          </div>
        </div>

        {/* Role 3: Admin */}
        <div 
          onClick={() => handleSelectRole('Admin')}
          style={{
            background: selectedRole === 'Admin' 
              ? 'linear-gradient(135deg, rgba(42, 24, 24, 0.98) 0%, rgba(35, 30, 50, 0.9) 100%)' 
              : 'rgba(23, 31, 51, 0.5)',
            border: selectedRole === 'Admin' ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            padding: 28,
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: selectedRole === 'Admin' ? '0 16px 36px rgba(245, 158, 11, 0.35)' : '0 4px 16px rgba(0,0,0,0.2)',
            transform: selectedRole === 'Admin' ? 'translateY(-6px)' : 'none',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {selectedRole === 'Admin' && (
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '4px 14px',
              borderBottomLeftRadius: 12
            }}>
              SELECTED
            </div>
          )}

          <div style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: 18,
            boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)'
          }}>
            <Shield size={28} />
          </div>

          <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: 6 }}>Campus Admin Center</h3>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.55, marginBottom: 16 }}>
            Dean of Student Affairs: approve clubs & events, monitor venue conflicts, and review Chart.js analytics.
          </p>

          <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Auditing & System Analytics</span> &rarr;
          </div>
        </div>
      </div>

      {/* Role-Specific Sign In Form Card */}
      <div className="glass-panel" style={{
        maxWidth: 540,
        width: '100%',
        padding: 36,
        borderRadius: 24,
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: 4 }}>
            {isRegistering ? 'Register New Student' : `Sign In as ${selectedRole === 'Admin' ? 'Campus Administrator' : selectedRole === 'Organizer' ? 'Club Organizer' : 'Student'}`}
          </h2>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            {selectedRole === 'Admin' && 'Sign in with your Dean or Faculty administrator credentials.'}
            {selectedRole === 'Organizer' && 'Sign in as a club President or Organizer to manage club events.'}
            {selectedRole === 'Student' && 'Sign in with your student email to access passes and registrations.'}
          </div>
        </div>

        {/* Quick 1-Click Demo Buttons for Viva Presentation */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
          padding: 16,
          marginBottom: 24
        }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#818cf8', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={13} /> Instant 1-Click Demo Access for {selectedRole}:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rolePresets[selectedRole]?.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPreset(preset.email)}
                disabled={loading}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.18)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>{preset.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{preset.dept || preset.club}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{preset.badge}</span>
                  <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>Enter &rarr;</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 10,
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '0.88rem',
            marginBottom: 20
          }}>
            {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isRegistering && selectedRole === 'Student' && (
            <>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Alex Rivera" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Department</label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: '100%' }}>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                    <option value="Information Tech">Information Tech</option>
                    <option value="Mechanical Engg">Mechanical Engg</option>
                    <option value="Design & Media">Design & Media</option>
                    <option value="Electrical Engg">Electrical Engg</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Academic Year</label>
                  <select value={year} onChange={(e) => setYear(e.target.value)} style={{ width: '100%' }}>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Phone (Optional)</label>
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
            <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Campus Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 700,
              marginTop: 8,
              borderRadius: 12,
              background: selectedRole === 'Admin' 
                ? 'linear-gradient(135deg, #f59e0b, #ef4444)' 
                : selectedRole === 'Organizer' 
                ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' 
                : undefined
            }}
          >
            {loading ? 'Authenticating...' : isRegistering ? 'Complete Registration' : `Sign In as ${selectedRole}`}
          </button>
        </form>

        {/* Toggle Register for Student */}
        {selectedRole === 'Student' && (
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.88rem', color: '#94a3b8' }}>
            {isRegistering ? 'Already have a registered account?' : 'New student on campus?'}{' '}
            <button 
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              style={{ background: 'transparent', color: '#818cf8', fontWeight: 700, cursor: 'pointer' }}
            >
              {isRegistering ? 'Sign In' : 'Register Here'}
            </button>
          </div>
        )}

        {/* Public / Guest Access */}
        <div style={{
          marginTop: 24,
          paddingTop: 18,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center'
        }}>
          <button 
            type="button"
            onClick={onExploreGuest}
            style={{
              background: 'transparent',
              color: '#94a3b8',
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <Compass size={17} /> Continue as Public Guest Explorer (Browse Events & Verify Certificates) &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
