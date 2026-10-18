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
        status: selectedStatus === 'All' ? null : selectedStatus,
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
        background: 'linear-gradient(135deg, rgba(30, 41, 67, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 24,
        padding: '48px 40px',
        marginBottom: 40,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 720 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 20,
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#a5b4fc',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: 16
          }}>
            <Sparkles size={14} /> Powered by Neo4j Graph DBMS & Real-time Traversals
          </div>

          <h1 style={{ fontSize: '2.8rem', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.03em' }}>
            Discover, Connect & Conquer Campus Events
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: 28 }}>
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
            <Sparkles size={20} color="#818cf8" />
            <h2 style={{ fontSize: '1.4rem' }}>Recommended for You (Collaborative Graph Traversal)</h2>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', background: 'rgba(99, 102, 241, 0.1)', padding: '3px 8px', borderRadius: 12 }}>
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
                  padding: 20,
                  cursor: 'pointer',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  background: 'linear-gradient(135deg, rgba(23, 31, 51, 0.9) 0%, rgba(30, 41, 67, 0.7) 100%)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className="badge badge-purple">{rec.type}</span>
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                    🔥 {rec.peerScore} peer{rec.peerScore > 1 ? 's' : ''} registered
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: 8, color: '#f8fafc' }}>{rec.name}</h3>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 14 }}>
                  Hosted by <strong style={{ color: '#cbd5e1' }}>{rec.clubName}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
                  <span>{new Date(rec.startDateTime).toLocaleDateString()}</span>
                  <span style={{ color: '#818cf8', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
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
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: '0.85rem',
                fontWeight: 600,
                background: selectedType === cat ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedType === cat ? '#fff' : '#94a3b8',
                border: `1px solid ${selectedType === cat ? 'transparent' : 'rgba(255, 255, 255, 0.08)'}`,
                boxShadow: selectedType === cat ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Status:</span>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ fontSize: '0.84rem', padding: '6px 12px' }}
          >
            <option value="Approved">Upcoming & Active</option>
            <option value="Completed">Past & Completed</option>
            <option value="All">All Statuses</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div style={{ padding: 80, textAlign: 'center', color: '#94a3b8' }}>
          Querying Neo4j Graph for campus events...
        </div>
      ) : events.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <Compass size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>No events found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Try clearing your filters or search terms.</p>
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
                <h3 style={{ fontSize: '1.25rem', marginBottom: 8, color: '#f8fafc', lineHeight: 1.3 }}>
                  {evt.name}
                </h3>
                <p style={{
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                  lineHeight: 1.5,
                  marginBottom: 16,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {evt.description}
                </p>

                {/* Event Venue & Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem', color: '#cbd5e1', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={15} color="#818cf8" />
                    <span>{evt.venue}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={15} color="#38bdf8" />
                    <span>
                      {new Date(evt.startDateTime).toLocaleDateString()} at {new Date(evt.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Seats & Capacity Meter */}
                <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 6 }}>
                    <span style={{ color: '#94a3b8' }}>
                      {evt.registeredCount} / {evt.maxParticipants} Registered
                    </span>
                    <span style={{ fontWeight: 700, color: isFull ? '#f59e0b' : '#34d399' }}>
                      {isFull ? 'Waitlist Open' : `${evt.seatsLeft} Seats Left`}
                    </span>
                  </div>

                  <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
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
