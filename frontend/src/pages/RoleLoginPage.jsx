import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Users, Shield, ArrowRight, Lock, Mail, 
  Sparkles, CheckCircle, Compass, User, BookOpen, Phone, KeyRound, Award
} from 'lucide-react';
import { api } from '../api/client';

export default function RoleLoginPage({ onLoginSuccess, onExploreGuest }) {
  const [selectedRole, setSelectedRole] = useState('Student'); // 'Student' | 'Organizer' | 'Admin'
  const [isRegistering, setIsRegistering] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState('3');

  // Organizer & Admin specific fields
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [newClubName, setNewClubName] = useState('');
  const [adminTitle, setAdminTitle] = useState('Dean of Student Affairs');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getClubs('Approved')
      .then(res => {
        const clubList = res.clubs || [];
        setClubs(clubList);
        if (clubList.length > 0) {
          setSelectedClub(clubList[0].clubId);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setIsRegistering(false);
    setError(null);
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

    const cleanEmail = email.trim().toLowerCase();
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(cleanEmail)) {
      setError('Email format must be a valid @gmail.com address (e.g., yourname@gmail.com).');
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        let payload = {
          name,
          email: cleanEmail,
          password,
          role: selectedRole
        };

        if (selectedRole === 'Admin') {
          payload.title = adminTitle;
        } else if (selectedRole === 'Organizer') {
          payload.department = department;
          payload.year = 3;
          if (selectedClub === 'NEW') {
            payload.clubName = newClubName || 'Student Club';
          } else {
            payload.clubId = selectedClub;
          }
        } else {
          payload.phone = phone;
          payload.department = department;
          payload.year = parseInt(year) || 1;
        }

        const res = await api.register(payload);
        localStorage.setItem('campus_token', res.token);
        onLoginSuccess(res.user, selectedRole);
      } else {
        const res = await api.login(cleanEmail, password);
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
      background: '#f4f6fb',
      backgroundImage: `
        radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.12) 0%, transparent 45%),
        radial-gradient(circle at 85% 85%, rgba(236, 72, 153, 0.1) 0%, transparent 45%),
        radial-gradient(circle at 50% 30%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)
      `,
      backgroundAttachment: 'fixed'
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', maxWidth: 840, marginBottom: 40 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 20px',
          borderRadius: 30,
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          color: '#4f46e5',
          fontSize: '0.86rem',
          fontWeight: 700,
          marginBottom: 18,
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.08)',
          letterSpacing: '0.02em'
        }}>
          <Sparkles size={16} /> Campus Event Management System • Neo4j Graph DBMS
        </div>

        <h1 style={{
          fontSize: '3.2rem',
          lineHeight: 1.15,
          marginBottom: 14,
          letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #475569 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800
        }}>
          Select Your Campus Role to Begin
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: 650, margin: '0 auto' }}>
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
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(238, 242, 255, 0.95) 100%)' 
              : 'rgba(255, 255, 255, 0.72)',
            border: selectedRole === 'Student' ? '2px solid #6366f1' : '1.5px solid rgba(226, 232, 240, 0.85)',
            borderRadius: 22,
            padding: 28,
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: selectedRole === 'Student' 
              ? '0 20px 38px -8px rgba(99, 102, 241, 0.25), inset 0 1px 2px #ffffff' 
              : '0 10px 24px -4px rgba(100, 116, 139, 0.08), inset 0 1px 1px #ffffff',
            transform: selectedRole === 'Student' ? 'translateY(-6px)' : 'none',
            backdropFilter: 'blur(16px)',
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
              padding: '5px 16px',
              borderBottomLeftRadius: 12,
              letterSpacing: '0.05em'
            }}>
              ACTIVE ROLE
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
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
          }}>
            <GraduationCap size={28} />
          </div>

          <h3 style={{ fontSize: '1.35rem', color: '#0f172a', fontWeight: 700, marginBottom: 8 }}>Student Portal</h3>
          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.55, marginBottom: 16 }}>
            Browse events, register with capacity locks, join waitlists, form teams, and download verified certificates.
          </p>

          <div style={{ fontSize: '0.82rem', color: '#4f46e5', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Personalized Recommendations</span> &rarr;
          </div>
        </div>

        {/* Role 2: Club Organizer */}
        <div 
          onClick={() => handleSelectRole('Organizer')}
          style={{
            background: selectedRole === 'Organizer' 
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(253, 242, 248, 0.95) 100%)' 
              : 'rgba(255, 255, 255, 0.72)',
            border: selectedRole === 'Organizer' ? '2px solid #ec4899' : '1.5px solid rgba(226, 232, 240, 0.85)',
            borderRadius: 22,
            padding: 28,
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: selectedRole === 'Organizer' 
              ? '0 20px 38px -8px rgba(236, 72, 153, 0.25), inset 0 1px 2px #ffffff' 
              : '0 10px 24px -4px rgba(100, 116, 139, 0.08), inset 0 1px 1px #ffffff',
            transform: selectedRole === 'Organizer' ? 'translateY(-6px)' : 'none',
            backdropFilter: 'blur(16px)',
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
              padding: '5px 16px',
              borderBottomLeftRadius: 12,
              letterSpacing: '0.05em'
            }}>
              ACTIVE ROLE
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
            boxShadow: '0 8px 20px rgba(236, 72, 153, 0.3)'
          }}>
            <Users size={28} />
          </div>

          <h3 style={{ fontSize: '1.35rem', color: '#0f172a', fontWeight: 700, marginBottom: 8 }}>Club Organizer Studio</h3>
          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.55, marginBottom: 16 }}>
            Issue events with specifications, manage registrations, track attendance, and declare winners.
          </p>

          <div style={{ fontSize: '0.82rem', color: '#db2777', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Venue Clash Guard & Check-in</span> &rarr;
          </div>
        </div>

        {/* Role 3: Admin */}
        <div 
          onClick={() => handleSelectRole('Admin')}
          style={{
            background: selectedRole === 'Admin' 
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(254, 243, 199, 0.95) 100%)' 
              : 'rgba(255, 255, 255, 0.72)',
            border: selectedRole === 'Admin' ? '2px solid #f59e0b' : '1.5px solid rgba(226, 232, 240, 0.85)',
            borderRadius: 22,
            padding: 28,
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: selectedRole === 'Admin' 
              ? '0 20px 38px -8px rgba(245, 158, 11, 0.25), inset 0 1px 2px #ffffff' 
              : '0 10px 24px -4px rgba(100, 116, 139, 0.08), inset 0 1px 1px #ffffff',
            transform: selectedRole === 'Admin' ? 'translateY(-6px)' : 'none',
            backdropFilter: 'blur(16px)',
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
              padding: '5px 16px',
              borderBottomLeftRadius: 12,
              letterSpacing: '0.05em'
            }}>
              ACTIVE ROLE
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
            boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
          }}>
            <Shield size={28} />
          </div>

          <h3 style={{ fontSize: '1.35rem', color: '#0f172a', fontWeight: 700, marginBottom: 8 }}>Campus Admin Center</h3>
          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.55, marginBottom: 16 }}>
            Dean of Student Affairs: approve clubs & events, monitor venue conflicts, and review Chart.js analytics.
          </p>

          <div style={{ fontSize: '0.82rem', color: '#d97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Approval Desk & Analytics</span> &rarr;
          </div>
        </div>
      </div>

      {/* Role-Specific Sign In Form Card */}
      <div className="glass-panel" style={{
        maxWidth: 540,
        width: '100%',
        padding: 36,
        borderRadius: 24,
        boxShadow: '0 24px 60px -12px rgba(100, 116, 139, 0.16), 0 8px 16px -4px rgba(100, 116, 139, 0.08), inset 0 1px 2px #ffffff',
        border: '1.5px solid rgba(255, 255, 255, 0.95)',
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(24px)'
      }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.6rem', color: '#0f172a', fontWeight: 800, marginBottom: 4 }}>
            {isRegistering ? 'Register New Student' : `Sign In as ${selectedRole === 'Admin' ? 'Campus Administrator' : selectedRole === 'Organizer' ? 'Club Organizer' : 'Student'}`}
          </h2>
          <div style={{ fontSize: '0.88rem', color: '#64748b' }}>
            {selectedRole === 'Admin' && 'Sign in with your Dean or Faculty administrator credentials.'}
            {selectedRole === 'Organizer' && 'Sign in as a club President or Organizer to manage club events.'}
            {selectedRole === 'Student' && 'Sign in with your student email to access passes and registrations.'}
          </div>
        </div>


        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1.5px solid rgba(239, 68, 68, 0.25)',
            color: '#b91c1c',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: 20
          }}>
            {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Student Registration Fields */}
          {isRegistering && selectedRole === 'Student' && (
            <>
              <div>
                <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Full Name</label>
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
                  <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Department</label>
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
                  <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Academic Year</label>
                  <select value={year} onChange={(e) => setYear(e.target.value)} style={{ width: '100%' }}>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Phone (Optional)</label>
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

          {/* Organizer Registration Fields */}
          {isRegistering && selectedRole === 'Organizer' && (
            <>
              <div>
                <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Organizer Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Om Thavari" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Department</label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: '100%' }}>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                    <option value="Information Tech">Information Tech</option>
                    <option value="Mechanical Engg">Mechanical Engg</option>
                    <option value="Design & Media">Design & Media</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Represented Club</label>
                  <select value={selectedClub} onChange={(e) => setSelectedClub(e.target.value)} style={{ width: '100%' }}>
                    {clubs.map(c => (
                      <option key={c.clubId} value={c.clubId}>{c.name}</option>
                    ))}
                    <option value="NEW">+ Create New Club...</option>
                  </select>
                </div>
              </div>

              {selectedClub === 'NEW' && (
                <div>
                  <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>New Club Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. AI & Machine Learning Society" 
                    value={newClubName} 
                    onChange={(e) => setNewClubName(e.target.value)}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
              )}
            </>
          )}

          {/* Admin Registration Fields */}
          {isRegistering && selectedRole === 'Admin' && (
            <>
              <div>
                <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Administrator Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. R. K. Sharma" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Official Title / Authority</label>
                <select value={adminTitle} onChange={(e) => setAdminTitle(e.target.value)} style={{ width: '100%' }}>
                  <option value="Dean of Student Affairs">Dean of Student Affairs</option>
                  <option value="Associate Dean">Associate Dean</option>
                  <option value="Head of Department">Head of Department (HOD)</option>
                  <option value="Faculty Council Chairperson">Faculty Council Chairperson</option>
                  <option value="Campus Administrator">Campus Administrator</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Email Address (@gmail.com)</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@gmail.com"
              pattern="[a-zA-Z0-9._%+-]+@gmail\.com"
              title="Must be a valid @gmail.com address"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Password</label>
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
              borderRadius: 14,
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)',
              background: selectedRole === 'Admin' 
                ? 'linear-gradient(135deg, #f59e0b, #ef4444)' 
                : selectedRole === 'Organizer' 
                ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' 
                : undefined
            }}
          >
            {loading ? 'Authenticating...' : isRegistering ? `Complete ${selectedRole} Registration` : `Sign In as ${selectedRole}`}
          </button>
        </form>

        {/* Toggle Register for Any Role */}
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: '0.88rem', color: '#64748b' }}>
          {isRegistering ? 'Already have an account?' : `New ${selectedRole.toLowerCase()} on campus?`}{' '}
          <button 
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
              setEmail('');
              setPassword('');
            }}
            style={{ background: 'transparent', color: '#4f46e5', fontWeight: 700, cursor: 'pointer', border: 'none' }}
          >
            {isRegistering ? 'Sign In' : `Register as ${selectedRole}`}
          </button>
        </div>

        {/* Public / Guest Access */}
        <div style={{
          marginTop: 24,
          paddingTop: 18,
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          textAlign: 'center'
        }}>
          <button 
            type="button"
            onClick={onExploreGuest}
            style={{
              background: 'transparent',
              color: '#64748b',
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              fontWeight: 600,
              border: 'none',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
          >
            <Compass size={17} /> Continue as Public Guest Explorer (Browse Events & Verify Certificates) &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
