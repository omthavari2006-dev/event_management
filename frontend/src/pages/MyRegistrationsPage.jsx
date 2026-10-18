import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, CheckCircle, Clock, AlertCircle, QrCode } from 'lucide-react';
import { api } from '../api/client';

export default function MyRegistrationsPage({ user, onViewTicket, onOpenEvent }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.getMyRegistrations();
      setRegistrations(res.registrations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const handleCancel = async (eventId) => {
    if (!window.confirm('Cancel this registration? If waitlisted students exist, one will be auto-promoted.')) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.cancelRegistration(eventId);
      let text = 'Registration cancelled.';
      if (res.promotedStudent) {
        text += ` Student ${res.promotedStudent.promotedStudentName} was automatically promoted from the waitlist!`;
      }
      setMessage(text);
      await loadRegistrations();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: 80, textAlign: 'center', color: '#94a3b8' }}>
        Please sign in to view your campus passes and registrations.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Ticket size={28} color="#818cf8" /> My Campus Passes & Registrations
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: 4 }}>
            Manage your registered events, access digital entry QR tickets, and check attendance records.
          </p>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 10,
          background: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#93c5fd',
          marginBottom: 20
        }}>
          {message}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading your passes...</div>
      ) : registrations.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <Ticket size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <h3>No event registrations yet</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>
            Discover exciting hackathons, workshops, and seminars in the Discover tab!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {registrations.map((reg) => (
            <div 
              key={reg.registrationId}
              style={{
                background: 'rgba(23, 31, 51, 0.75)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 20
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <span className={`badge ${
                    reg.status === 'Registered' ? 'badge-success' : reg.status === 'Waitlisted' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {reg.status}
                  </span>
                  <span className="badge badge-info">{reg.eventType}</span>
                  <span className="badge badge-purple">{reg.clubName}</span>

                  {reg.attended && (
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={12} /> Attended
                    </span>
                  )}

                  {reg.wonPosition && (
                    <span className="badge badge-warning">
                      🏆 Position #{reg.wonPosition} ({reg.wonPrize})
                    </span>
                  )}
                </div>

                <h3 
                  onClick={() => onOpenEvent(reg.eventId)}
                  style={{ fontSize: '1.3rem', cursor: 'pointer', color: '#f8fafc' }}
                >
                  {reg.eventName}
                </h3>

                <div style={{ display: 'flex', gap: 16, fontSize: '0.84rem', color: '#94a3b8', marginTop: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={14} color="#818cf8" /> {reg.venue}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={14} color="#38bdf8" /> {new Date(reg.startDateTime).toLocaleDateString()}
                  </span>
                  {reg.teamName && (
                    <span style={{ color: '#c084fc' }}>Team: <strong>{reg.teamName}</strong></span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {reg.status === 'Registered' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => onViewTicket(reg)}
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    <QrCode size={16} /> Digital Pass
                  </button>
                )}

                {(reg.status === 'Registered' || reg.status === 'Waitlisted') && (
                  <button 
                    className="btn btn-outline-danger"
                    onClick={() => handleCancel(reg.eventId)}
                    disabled={actionLoading}
                    style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
