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
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: 10, color: '#0f172a', fontWeight: 800 }}>
            <Ticket size={28} color="#4f46e5" /> My Campus Passes & Registrations
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.96rem', marginTop: 4 }}>
            Manage your registered events, access digital entry QR tickets, and check attendance records.
          </p>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 12,
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1.5px solid rgba(59, 130, 246, 0.3)',
          color: '#1e40af',
          fontWeight: 600,
          marginBottom: 20
        }}>
          {message}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#64748b', fontSize: '0.96rem' }}>Loading your passes...</div>
      ) : registrations.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.75)',
          borderRadius: 20,
          border: '1.5px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 10px 30px rgba(100, 116, 139, 0.05)'
        }}>
          <Ticket size={48} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>No event registrations yet</h3>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: 4 }}>
            Discover exciting hackathons, workshops, and seminars in the Discover tab!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {registrations.map((reg) => (
            <div 
              key={reg.registrationId}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(226, 232, 240, 0.9)',
                borderRadius: 18,
                padding: '22px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 20,
                boxShadow: '0 10px 28px -6px rgba(100, 116, 139, 0.08), inset 0 1px 1px #ffffff'
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
                  style={{ fontSize: '1.3rem', cursor: 'pointer', color: '#0f172a', fontWeight: 800 }}
                >
                  {reg.eventName}
                </h3>

                <div style={{ display: 'flex', gap: 16, fontSize: '0.86rem', color: '#64748b', marginTop: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={14} color="#4f46e5" /> {reg.venue}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={14} color="#0284c7" /> {new Date(reg.startDateTime).toLocaleDateString()}
                  </span>
                  {reg.teamName && (
                    <span style={{ color: '#7e22ce', fontWeight: 600 }}>Team: <strong>{reg.teamName}</strong></span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {reg.status === 'Registered' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => onViewTicket(reg)}
                    style={{ padding: '9px 18px', fontSize: '0.88rem' }}
                  >
                    <QrCode size={16} /> Digital Pass
                  </button>
                )}

                {(reg.status === 'Registered' || reg.status === 'Waitlisted') && (
                  <button 
                    className="btn btn-outline-danger"
                    onClick={() => handleCancel(reg.eventId)}
                    disabled={actionLoading}
                    style={{ padding: '9px 16px', fontSize: '0.88rem' }}
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
