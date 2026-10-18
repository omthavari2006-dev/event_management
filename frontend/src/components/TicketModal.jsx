import React from 'react';
import { X, Calendar, MapPin, CheckCircle, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function TicketModal({ event, user, onClose }) {
  if (!event || !user) return null;

  const ticketData = JSON.stringify({
    studentId: user.id,
    studentName: user.name,
    eventId: event.eventId,
    eventName: event.name,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, padding: 0, overflow: 'hidden' }}>
        {/* Ticket Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
          padding: '24px',
          color: '#fff',
          position: 'relative',
          textAlign: 'center'
        }}>
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <X size={16} />
          </button>

          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85 }}>
            Official Campus Pass
          </div>
          <h2 style={{ fontSize: '1.4rem', marginTop: 4, marginBottom: 8, color: '#fff' }}>{event.name || event.eventName}</h2>
          <span className="badge badge-success" style={{ background: '#fff', color: '#10b981', border: 'none' }}>
            Confirmed Entry Ticket
          </span>
        </div>

        {/* QR Code Center */}
        <div style={{
          padding: '30px 24px',
          background: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '2px dashed rgba(255, 255, 255, 0.15)',
          position: 'relative'
        }}>
          <div style={{
            background: '#fff',
            padding: 16,
            borderRadius: 16,
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)'
          }}>
            <QRCodeSVG value={ticketData} size={180} level="M" />
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 12 }}>
            Present this QR Code to Organizer at Gate
          </div>
        </div>

        {/* Ticket Metadata */}
        <div style={{ padding: '24px', background: '#111827' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Attendee</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#818cf8' }}>ID: {user.id}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Department</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1' }}>{user.department || 'Campus Student'}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Venue</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1' }}>{event.venue}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Date & Time</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1' }}>
                {new Date(event.startDateTime).toLocaleDateString()}
              </div>
            </div>
          </div>

          <button 
            className="btn btn-secondary" 
            style={{ width: '100%' }}
            onClick={() => window.print()}
          >
            Save or Print Pass
          </button>
        </div>
      </div>
    </div>
  );
}
