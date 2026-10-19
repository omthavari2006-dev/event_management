import React, { useState } from 'react';
import { 
  Calendar, Award, CheckCircle, Shield, Users, Bell, 
  Sparkles, LogOut, Network, Search, Ticket, ChevronDown, ArrowLeftRight 
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  user, 
  onLogout, 
  onQuickLogin, 
  notifications = [], 
  onOpenNotifications,
  onOpenAuth
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const unreadCount = notifications.filter(n => n.status === 'Unread').length;

  const demoAccounts = [
    { label: 'Alex Rivera (President, CodeCraft)', email: 'alex@campus.edu', role: 'Student' },
    { label: 'Dr. Sharma (Admin / Dean)', email: 'admin@campus.edu', role: 'Admin' },
    { label: 'Marcus Chen (President, Robotics)', email: 'marcus@campus.edu', role: 'Student' },
    { label: 'Sarah Jenkins (General Student)', email: 'sarah@campus.edu', role: 'Student' }
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 14, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 24px',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20
      }}>
        {/* Logo */}
        <div 
          onClick={() => setCurrentTab('events')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        >
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            <Network size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
              CampusEvents <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 20, background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>Neo4j Graph</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Connected Campus Management</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button 
            className={`btn ${currentTab === 'events' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrentTab('events')}
            style={{ padding: '8px 14px', fontSize: '0.88rem' }}
          >
            <Calendar size={16} /> Discover
          </button>

          {user && user.role === 'Student' && (
            <button 
              className={`btn ${currentTab === 'registrations' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentTab('registrations')}
              style={{ padding: '8px 14px', fontSize: '0.88rem' }}
            >
              <Ticket size={16} /> My Passes
            </button>
          )}

          <button 
            className={`btn ${currentTab === 'certificates' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrentTab('certificates')}
            style={{ padding: '8px 14px', fontSize: '0.88rem' }}
          >
            <Award size={16} /> Certificates
          </button>

          <button 
            className={`btn ${currentTab === 'verify' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrentTab('verify')}
            style={{ padding: '8px 14px', fontSize: '0.88rem' }}
          >
            <CheckCircle size={16} /> Verify
          </button>

          {user && (user.role === 'Admin' || (user.clubMemberships && user.clubMemberships.some(m => m.role === 'President' || m.role === 'Organizer'))) && (
            <button 
              className={`btn ${currentTab === 'organizer' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentTab('organizer')}
              style={{ padding: '8px 14px', fontSize: '0.88rem', background: currentTab === 'organizer' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : undefined }}
            >
              <Users size={16} /> Studio
            </button>
          )}

          {user && user.role === 'Admin' && (
            <button 
              className={`btn ${currentTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentTab('admin')}
              style={{ padding: '8px 14px', fontSize: '0.88rem', background: currentTab === 'admin' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : undefined }}
            >
              <Shield size={16} /> Admin
            </button>
          )}

          <button 
            className={`btn ${currentTab === 'viva' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrentTab('viva')}
            style={{ padding: '8px 14px', fontSize: '0.88rem', borderColor: 'rgba(6, 182, 212, 0.4)', color: currentTab === 'viva' ? '#fff' : '#38bdf8' }}
          >
            <Sparkles size={16} /> Graph & Viva
          </button>
        </nav>

        {/* User / Auth Controls & Quick Persona Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Demo Quick Switcher Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="btn btn-secondary"
              style={{ padding: '7px 12px', fontSize: '0.82rem', borderColor: 'rgba(99, 102, 241, 0.4)', background: 'rgba(99, 102, 241, 0.1)' }}
              title="Switch demo persona for Viva presentation"
            >
              <span style={{ color: '#818cf8', fontWeight: 700 }}>Demo Persona</span>
              <ChevronDown size={14} />
            </button>

            {showRoleMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 42,
                width: 280,
                background: '#131b2e',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 12,
                boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                padding: 8,
                zIndex: 200
              }}>
                <div style={{ padding: '6px 10px', fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Select Demo User for Viva / Test:
                </div>
                {demoAccounts.map((acc, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onQuickLogin(acc.email, 'password123');
                      setShowRoleMenu(false);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{acc.label}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{acc.email}</div>
                    </div>
                    <span className={`badge ${acc.role === 'Admin' ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '0.68rem' }}>
                      {acc.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Button */}
          {user && (
            <button 
              onClick={onOpenNotifications}
              style={{
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                width: 40,
                height: 40,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: unreadCount > 0 ? '#818cf8' : '#94a3b8',
                cursor: 'pointer'
              }}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.7)'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Current User Pill or Sign In */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '5px 12px',
                borderRadius: 30,
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: user.role === 'Admin' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : user.presidentClubs?.length > 0 ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1.2 }}>
                    {user.name.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 600, color: user.role === 'Admin' ? '#f59e0b' : user.presidentClubs?.length > 0 ? '#ec4899' : '#818cf8' }}>
                    {user.role === 'Admin' ? 'Dean / Admin' : user.presidentClubs?.length > 0 ? 'Club Organizer' : 'Student'}
                  </div>
                </div>
              </div>

              {/* Dedicated Switch Role Button */}
              <button 
                onClick={onLogout}
                className="btn btn-secondary"
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '0.8rem', 
                  gap: 6, 
                  borderRadius: 10,
                  borderColor: 'rgba(99, 102, 241, 0.3)',
                  background: 'rgba(99, 102, 241, 0.08)',
                  color: '#c7d2fe'
                }}
                title="Sign out and return to the Role-Based Login Screen"
              >
                <ArrowLeftRight size={14} /> Switch Role
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={onLogout} style={{ padding: '8px 18px', gap: 6, fontSize: '0.88rem' }}>
              <ArrowLeftRight size={15} /> Choose Role / Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
