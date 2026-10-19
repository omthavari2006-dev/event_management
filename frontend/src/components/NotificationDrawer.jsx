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
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1.5px solid rgba(226, 232, 240, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-12px 0 40px rgba(100, 116, 139, 0.16)',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1.5px solid rgba(226, 232, 240, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.96) 0%, rgba(240, 249, 255, 0.9) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={20} color="#4f46e5" />
            <h3 style={{ fontSize: '1.18rem', color: '#0f172a', fontWeight: 800 }}>Notifications</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {notifications.some(n => n.status === 'Unread') && (
              <button 
                onClick={handleMarkAllRead}
                style={{ background: 'transparent', color: '#4f46e5', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 700, border: 'none' }}
              >
                Mark all read
              </button>
            )}
            <button 
              onClick={onClose}
              style={{ background: 'transparent', color: '#64748b', display: 'flex', cursor: 'pointer', border: 'none' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <Bell size={36} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
              <div style={{ fontSize: '0.92rem' }}>No notifications yet.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifications.map((n) => (
                <div 
                  key={n.notificationId}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: n.status === 'Unread' ? 'rgba(238, 242, 255, 0.92)' : 'rgba(248, 250, 252, 0.85)',
                    border: `1.5px solid ${n.status === 'Unread' ? 'rgba(199, 210, 254, 0.95)' : 'rgba(226, 232, 240, 0.85)'}`,
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    boxShadow: n.status === 'Unread' ? '0 4px 12px rgba(99, 102, 241, 0.08)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: n.status === 'Unread' ? '#0f172a' : '#334155' }}>
                      {n.title}
                    </div>
                    {n.status === 'Unread' && (
                      <button 
                        onClick={() => handleMarkAsRead(n.notificationId)}
                        title="Mark as read"
                        style={{ background: 'transparent', color: '#4f46e5', cursor: 'pointer', display: 'flex', padding: 2, border: 'none' }}
                      >
                        <Check size={15} />
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#475569', marginBottom: 8, lineHeight: 1.45 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
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
