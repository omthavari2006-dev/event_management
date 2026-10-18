import React from 'react';
import { X, Bell, Check, Clock } from 'lucide-react';
import { api } from '../api/client';

export default function NotificationDrawer({ 
  isOpen, 
  onClose, 
  notifications = [], 
  onRefresh 
}) {
  if (!isOpen) return null;

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 420,
          height: '100vh',
          background: '#0f172a',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#131c31'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1.15rem' }}>Notifications</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {notifications.some(n => n.status === 'Unread') && (
              <button 
                onClick={handleMarkAllRead}
                style={{ background: 'transparent', color: '#818cf8', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Mark all read
              </button>
            )}
            <button 
              onClick={onClose}
              style={{ background: 'transparent', color: '#94a3b8', display: 'flex', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <Bell size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <div>No notifications yet.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifications.map((n) => (
                <div 
                  key={n.notificationId}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background: n.status === 'Unread' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${n.status === 'Unread' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                    transition: 'background 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: n.status === 'Unread' ? '#fff' : '#cbd5e1' }}>
                      {n.title}
                    </div>
                    {n.status === 'Unread' && (
                      <button 
                        onClick={() => handleMarkAsRead(n.notificationId)}
                        title="Mark as read"
                        style={{ background: 'transparent', color: '#818cf8', cursor: 'pointer', display: 'flex', padding: 2 }}
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#94a3b8', marginBottom: 8, lineHeight: 1.4 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {new Date(n.createdTimestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
