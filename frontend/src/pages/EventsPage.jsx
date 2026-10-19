import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, MapPin, Users, Sparkles, Filter, 
  ArrowRight, ShieldCheck, Flame, Compass, CheckCircle 
} from 'lucide-react';
import { api } from '../api/client';

export default function EventsPage({ user, onSelectEvent, onOpenAuth }) {
  const [events, setEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('Approved');

  const categories = ['All', 'Hackathon', 'Workshop', 'Cultural', 'Seminar', 'Sports'];

  const loadEvents = async () => {
    try {
      setLoading(true);
      const params = {
        status: selectedStatus === 'All' ? 'public' : selectedStatus,
        type: selectedType === 'All' ? null : selectedType,
        search: search.trim() || null
      };
      const res = await api.getEvents(params);
      setEvents(res.events || []);

      if (user && user.role === 'Student') {
        try {
          const recRes = await api.getRecommendations();
          setRecommendations(recRes.recommendations || []);
        } catch (e) {
          console.warn('Could not load recommendations:', e);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [selectedType, selectedStatus, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadEvents();
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      {/* Hero Showcase Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 244, 255, 0.92) 100%)',
        border: '1.5px solid rgba(255, 255, 255, 0.95)',
        borderRadius: 26,
        padding: '48px 40px',
        marginBottom: 40,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 48px -12px rgba(99, 102, 241, 0.12), 0 8px 16px -4px rgba(100, 116, 139, 0.06), inset 0 1px 2px #ffffff',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 740 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 16px',
            borderRadius: 20,
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            color: '#4f46e5',
            fontSize: '0.84rem',
            fontWeight: 700,
            marginBottom: 16,
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.08)'
          }}>
            <Sparkles size={14} /> Powered by Neo4j Graph DBMS & Real-time Traversals
          </div>

          <h1 style={{ fontSize: '2.8rem', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.03em', color: '#0f172a', fontWeight: 800 }}>
            Discover, Connect & Conquer Campus Events
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, marginBottom: 28 }}>
            Experience lightning-fast registration with concurrency locks, automated waitlists, 
            graph-powered recommendations, team formations, and verifiable digital certificates.
          </p>

          {/* Search bar inside hero */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 10, maxWidth: 540 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Search by event title, venue, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: 42, height: 48, borderRadius: 12, fontSize: '0.95rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 24px', height: 48, borderRadius: 12 }}>
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Graph-Powered Recommendations Carousel (If Student logged in) */}
      {user && user.role === 'Student' && recommendations.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Sparkles size={20} color="#4f46e5" />
            <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 700 }}>Recommended for You (Collaborative Graph Traversal)</h2>
            <span style={{ fontSize: '0.78rem', color: '#4f46e5', background: 'rgba(99, 102, 241, 0.1)', padding: '4px 10px', borderRadius: 12, fontWeight: 600 }}>
              Based on peers who attended your events
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20
          }}>
            {recommendations.map((rec) => (
              <div 
                key={rec.eventId}
                className="card-interactive"
                onClick={() => onSelectEvent(rec.eventId)}
                style={{
                  padding: 22,
                  cursor: 'pointer',
                  border: '1.5px solid rgba(199, 210, 254, 0.85)',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(238, 242, 255, 0.9) 100%)',
                  boxShadow: '0 12px 28px -6px rgba(99, 102, 241, 0.12), inset 0 1px 1px #fff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className="badge badge-purple">{rec.type}</span>
                  <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>
                    🔥 {rec.peerScore} peer{rec.peerScore > 1 ? 's' : ''} registered
                  </span>
                </div>
                <h3 style={{ fontSize: '1.18rem', marginBottom: 8, color: '#0f172a', fontWeight: 700 }}>{rec.name}</h3>
                <div style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: 14 }}>
                  Hosted by <strong style={{ color: '#334155' }}>{rec.clubName}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
                  <span>{new Date(rec.startDateTime).toLocaleDateString()}</span>
                  <span style={{ color: '#4f46e5', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                    View & Register <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Catalog Filters Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 28
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedType(cat)}
              style={{
                padding: '9px 18px',
                borderRadius: 20,
                fontSize: '0.86rem',
                fontWeight: 600,
                background: selectedType === cat ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.85)',
                color: selectedType === cat ? '#ffffff' : '#475569',
                border: `1.5px solid ${selectedType === cat ? 'transparent' : 'rgba(226, 232, 240, 0.9)'}`,
                boxShadow: selectedType === cat ? '0 6px 18px rgba(99, 102, 241, 0.35)' : '0 2px 6px rgba(100, 116, 139, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Status:</span>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ fontSize: '0.86rem', padding: '7px 14px', borderRadius: 10 }}
          >
            <option value="Approved">Upcoming & Active</option>
            <option value="Completed">Past & Completed</option>
            <option value="All">All Active & Past</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div style={{ padding: 80, textAlign: 'center', color: '#64748b', fontSize: '1.05rem', fontWeight: 500 }}>
          Querying Neo4j Graph for campus events...
        </div>
      ) : events.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'rgba(255, 255, 255, 0.75)',
          borderRadius: 22,
          border: '1.5px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 10px 30px rgba(100, 116, 139, 0.06)'
        }}>
          <Compass size={48} style={{ margin: '0 auto 16px', color: '#94a3b8' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: 8, color: '#0f172a', fontWeight: 700 }}>No events found</h3>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>Try clearing your filters or search terms.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 24
        }}>
          {events.map((evt) => {
            const seatsPercent = Math.min(100, Math.round((evt.registeredCount / (evt.maxParticipants || 1)) * 100));
            const isFull = evt.seatsLeft <= 0;

            return (
              <div 
                key={evt.eventId}
                className="card-interactive"
                onClick={() => onSelectEvent(evt.eventId)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 24,
                  cursor: 'pointer'
                }}
              >
                {/* Event Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className="badge badge-info">{evt.type}</span>
                    <span className="badge badge-purple">{evt.clubName}</span>
                  </div>
                  <span className={`badge ${evt.status === 'Approved' ? 'badge-success' : evt.status === 'Completed' ? 'badge-purple' : 'badge-warning'}`}>
                    {evt.status}
                  </span>
                </div>

                {/* Event Title & Description */}
                <h3 style={{ fontSize: '1.25rem', marginBottom: 8, color: '#0f172a', lineHeight: 1.3, fontWeight: 700 }}>
                  {evt.name}
                </h3>
                <p style={{
                  fontSize: '0.88rem',
                  color: '#475569',
                  lineHeight: 1.55,
                  marginBottom: 12,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {evt.description}
                </p>

                {/* Event Requirements Pill */}
                {evt.requirements && (
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#6b21a8',
                    background: 'rgba(168, 85, 247, 0.08)',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    padding: '6px 12px',
                    borderRadius: 10,
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <span>📋 <strong>Requirements:</strong> {evt.requirements.length > 50 ? evt.requirements.substring(0, 50) + '...' : evt.requirements}</span>
                  </div>
                )}

                {/* Event Venue & Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.84rem', color: '#334155', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={15} color="#4f46e5" />
                    <span style={{ fontWeight: 500 }}>{evt.venue}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={15} color="#0284c7" />
                    <span>
                      {new Date(evt.startDateTime).toLocaleDateString()} at {new Date(evt.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Seats & Capacity Meter */}
                <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>
                      {evt.registeredCount} / {evt.maxParticipants} Registered
                    </span>
                    <span style={{ fontWeight: 700, color: isFull ? '#d97706' : '#059669' }}>
                      {isFull ? 'Waitlist Open' : `${evt.seatsLeft} Seats Left`}
                    </span>
                  </div>

                  <div style={{ width: '100%', height: 7, borderRadius: 4, background: 'rgba(226, 232, 240, 0.9)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${seatsPercent}%`,
                      height: '100%',
                      background: isFull ? '#f59e0b' : 'linear-gradient(90deg, #10b981, #06b6d4)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
