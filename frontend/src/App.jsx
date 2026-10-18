import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import EventsPage from './pages/EventsPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import CertificatesPage from './pages/CertificatesPage';
import VerifyPage from './pages/VerifyPage';
import OrganizerPage from './pages/OrganizerPage';
import AdminPage from './pages/AdminPage';
import GraphVivaExplorer from './pages/GraphVivaExplorer';
import ERDiagramPage from './pages/ERDiagramPage';

import EventDetailModal from './components/EventDetailModal';
import TicketModal from './components/TicketModal';
import NotificationDrawer from './components/NotificationDrawer';
import LoginModal from './components/LoginModal';

import { api } from './api/client';

export default function App() {
  const [currentTab, setCurrentTab] = useState('events');
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Modals state
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [ticketEvent, setTicketEvent] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [verifyCodeInitial, setVerifyCodeInitial] = useState('');

  // Initial authentication check & default user setup for convenience
  const loadUserAndNotifs = async () => {
    const token = localStorage.getItem('campus_token');
    if (token) {
      try {
        const res = await api.getMe();
        setUser(res.user);
        if (res.user.role === 'Student') {
          const notifRes = await api.getNotifications();
          setNotifications(notifRes.notifications || []);
        }
      } catch (err) {
        console.warn('Session expired or invalid, clearing token.');
        localStorage.removeItem('campus_token');
        setUser(null);
      }
    } else {
      // For immediate zero-hassle presentation demo: Auto-login as Alex Rivera (President of CodeCraft)
      try {
        const res = await api.login('alex@campus.edu', 'password123');
        localStorage.setItem('campus_token', res.token);
        setUser(res.user);
        const notifRes = await api.getNotifications();
        setNotifications(notifRes.notifications || []);
      } catch (e) {
        // backend might not be started yet, that's fine
      }
    }
  };

  useEffect(() => {
    loadUserAndNotifs();
  }, []);

  const handleQuickLogin = async (email, password) => {
    try {
      const res = await api.login(email, password);
      localStorage.setItem('campus_token', res.token);
      setUser(res.user);
      if (res.user.role === 'Student') {
        const notifRes = await api.getNotifications();
        setNotifications(notifRes.notifications || []);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      alert(`Could not sign in as ${email}: ${err.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('campus_token');
    setUser(null);
    setNotifications([]);
  };

  const handleNavigateToVerify = (code) => {
    setVerifyCodeInitial(code);
    setCurrentTab('verify');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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

        {currentTab === 'admin' && (
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

        {currentTab === 'er-diagram' && (
          <ERDiagramPage />
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
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          loadUserAndNotifs();
        }}
      />
    </div>
  );
}
