import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import EventsPage from './pages/EventsPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import CertificatesPage from './pages/CertificatesPage';
import VerifyPage from './pages/VerifyPage';
import OrganizerPage from './pages/OrganizerPage';
import AdminPage from './pages/AdminPage';
import GraphVivaExplorer from './pages/GraphVivaExplorer';
import RoleLoginPage from './pages/RoleLoginPage';

import EventDetailModal from './components/EventDetailModal';
import TicketModal from './components/TicketModal';
import NotificationDrawer from './components/NotificationDrawer';
import LoginModal from './components/LoginModal';

import { api } from './api/client';

export default function App() {
  const [currentTab, setCurrentTab] = useState('events');
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Modals state
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [ticketEvent, setTicketEvent] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [verifyCodeInitial, setVerifyCodeInitial] = useState('');

  // Session management: On fresh visit, always show the Role-Based Login Page first!
  // Only restore if user actively signed in during this browser session
  const loadUserAndNotifs = async () => {
    const sessionActive = sessionStorage.getItem('campus_session_active');
    const token = localStorage.getItem('campus_token');
    
    if (sessionActive === 'true' && token) {
      try {
        const res = await api.getMe();
        setUser(res.user);
        if (res.user.role === 'Student') {
          const notifRes = await api.getNotifications();
          setNotifications(notifRes.notifications || []);
        }
      } catch (err) {
        console.warn('Session expired, clearing credentials.');
        localStorage.removeItem('campus_token');
        sessionStorage.removeItem('campus_session_active');
        setUser(null);
      }
    } else {
      // Clean start: ensure user lands on the Role-Based Login Screen first
      setUser(null);
    }
  };

  useEffect(() => {
    loadUserAndNotifs();
  }, []);

  const handleLoginSuccess = (loggedInUser, preferredRole) => {
    sessionStorage.setItem('campus_session_active', 'true');
    setUser(loggedInUser);
    setIsGuest(false);
    setShowAuthModal(false);

    // Direct routing based on role
    if (preferredRole === 'Admin' || loggedInUser.role === 'Admin') {
      setCurrentTab('admin');
    } else if (preferredRole === 'Organizer') {
      setCurrentTab('organizer');
    } else {
      setCurrentTab('events');
    }

    if (loggedInUser.role === 'Student') {
      api.getNotifications()
        .then(res => setNotifications(res.notifications || []))
        .catch(() => {});
    }
  };

  const handleQuickLogin = async (email, password) => {
    try {
      const res = await api.login(email, password);
      sessionStorage.setItem('campus_session_active', 'true');
      localStorage.setItem('campus_token', res.token);
      setUser(res.user);
      setIsGuest(false);

      if (res.user.role === 'Admin') {
        setCurrentTab('admin');
        setNotifications([]);
      } else {
        const hasOrgRole = res.user.presidentClubs?.length > 0 || 
          res.user.clubMemberships?.some(m => m.role === 'President' || m.role === 'Organizer');
        
        if (hasOrgRole) {
          setCurrentTab('organizer');
        } else {
          setCurrentTab('events');
        }

        const notifRes = await api.getNotifications();
        setNotifications(notifRes.notifications || []);
      }
    } catch (err) {
      alert(`Could not sign in as ${email}: ${err.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('campus_token');
    sessionStorage.removeItem('campus_session_active');
    setUser(null);
    setIsGuest(false);
    setNotifications([]);
    setCurrentTab('events');
  };

  const handleNavigateToVerify = (code) => {
    setVerifyCodeInitial(code);
    setCurrentTab('verify');
  };

  // If user is not logged in and hasn't chosen guest mode, render the Role-Based Login Page FIRST!
  if (!user && !isGuest) {
    return (
      <RoleLoginPage 
        onLoginSuccess={handleLoginSuccess}
        onExploreGuest={() => {
          setIsGuest(true);
          setCurrentTab('events');
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Guest Mode Indicator Banner */}
      {isGuest && !user && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.12), rgba(14, 165, 233, 0.12))',
          borderBottom: '1px solid rgba(99, 102, 241, 0.25)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.86rem',
          backdropFilter: 'blur(8px)'
        }}>
          <span style={{ color: '#334155', fontWeight: 500 }}>
            👀 You are currently browsing in <strong style={{ color: '#0f172a' }}>Guest Mode</strong> (Public event catalog & certificate verification).
          </span>
          <button 
            className="btn btn-primary"
            onClick={() => setIsGuest(false)}
            style={{ padding: '6px 16px', fontSize: '0.82rem' }}
          >
            Sign In with Role
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onLogout={handleLogout}
        onQuickLogin={handleQuickLogin}
        notifications={notifications}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Main Tab Pages */}
      <main style={{ flex: 1, paddingBottom: 60 }}>
        {currentTab === 'events' && (
          <EventsPage 
            user={user} 
            onSelectEvent={(id) => setSelectedEventId(id)}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}

        {currentTab === 'registrations' && (
          <MyRegistrationsPage 
            user={user}
            onViewTicket={(event) => setTicketEvent(event)}
            onOpenEvent={(id) => setSelectedEventId(id)}
          />
        )}

        {currentTab === 'certificates' && (
          <CertificatesPage 
            user={user} 
            onNavigateToVerify={handleNavigateToVerify}
          />
        )}

        {currentTab === 'verify' && (
          <VerifyPage 
            initialCode={verifyCodeInitial} 
          />
        )}

        {currentTab === 'organizer' && (
          <OrganizerPage 
            user={user} 
            onRefresh={loadUserAndNotifs}
          />
        )}

        {currentTab === 'admin' && user?.role === 'Admin' && (
          <AdminPage 
            user={user} 
            onRefresh={loadUserAndNotifs}
          />
        )}

        {currentTab === 'viva' && (
          <GraphVivaExplorer 
            user={user} 
          />
        )}
      </main>

      {/* Modals and Drawers */}
      {selectedEventId && (
        <EventDetailModal 
          eventId={selectedEventId}
          user={user}
          onClose={() => setSelectedEventId(null)}
          onRefresh={loadUserAndNotifs}
          onViewTicket={(evt) => setTicketEvent(evt)}
        />
      )}

      {ticketEvent && (
        <TicketModal 
          event={ticketEvent}
          user={user}
          onClose={() => setTicketEvent(null)}
        />
      )}

      <NotificationDrawer 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onRefresh={loadUserAndNotifs}
      />

      <LoginModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(loggedInUser) => handleLoginSuccess(loggedInUser, loggedInUser.role)}
      />
    </div>
  );
}
