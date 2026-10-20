import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, MapPin, Users, Sparkles, Filter, 
  ArrowRight, ShieldCheck, Flame, Compass, CheckCircle,
  Clock, Lock, Award
} from 'lucide-react';
import { api } from '../api/client';

export default function EventsPage({ user, onSelectEvent, onOpenAuth }) {
  const [events, setEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [activePhaseTab, setActivePhaseTab] = useState('registration'); // 'registration' | 'ongoing' | 'completed' | 'all'

  const categories = ['All', 'Hackathon', 'Workshop', 'Cultural', 'Seminar', 'Sports'];

  const loadEvents = async () => {
    try {
      setLoading(true);
      const params = {
        status: 'public', // Loads all Approved and Completed events
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
  }, [selectedType, user]);

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

      {/* 3 Main Event Phase Tabs */}
      {(() => {
        const now = new Date();

        const registrationEvents = events.filter(evt => {
          if (evt.status !== 'Approved') return false;
          const start = evt.startDateTime ? new Date(evt.startDateTime) : null;
          const deadline = evt.registrationDeadline ? new Date(evt.registrationDeadline) : start;
          return start && now < start && (!deadline || now <= deadline);
        });

        const ongoingEvents = events.filter(evt => {
          if (evt.status !== 'Approved') return false;
          const start = evt.startDateTime ? new Date(evt.startDateTime) : null;
          const end = evt.endDateTime ? new Date(evt.endDateTime) : null;
          return start && now >= start && (!end || now <= end);
        });

        const completedEvents = events.filter(evt => {
          if (evt.status === 'Completed') return true;
          if (evt.status === 'Approved' && evt.endDateTime && now > new Date(evt.endDateTime)) return true;
          return false;
        });

        let displayedEvents = events;
        if (activePhaseTab === 'registration') {
          displayedEvents = registrationEvents;
        } else if (activePhaseTab === 'ongoing') {
          displayedEvents = ongoingEvents;
        } else if (activePhaseTab === 'completed') {
          displayedEvents = completedEvents;
        }

        let emptyTitle = "No Events Found";
        let emptyDesc = "No events match the selected criteria.";
        if (activePhaseTab === 'registration') {
          emptyTitle = "No Events in Registration Phase";
          emptyDesc = "There are currently no events open for registration. Check out Ongoing or Completed events, or check back soon!";
        } else if (activePhaseTab === 'ongoing') {
          emptyTitle = "No Events Currently Ongoing";
          emptyDesc = "There are no live events happening right now. Per campus rules, attendance can ONLY be taken while an event is ongoing.";
        } else if (activePhaseTab === 'completed') {
          emptyTitle = "No Completed Events Yet";
          emptyDesc = "Concluded campus events with attendance records and certificates will be archived here.";
        }

        return (
          <>
            {/* Primary Phase Navigation Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
              borderBottom: '2px solid rgba(226, 232, 240, 0.9)',
              paddingBottom: 16,
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setActivePhaseTab('registration')}
                style={{
                  padding: '11px 22px',
                  borderRadius: 14,
                  fontSize: '0.94rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: activePhaseTab === 'registration' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'rgba(255, 255, 255, 0.85)',
                  color: activePhaseTab === 'registration' ? '#ffffff' : '#334155',
                  border: activePhaseTab === 'registration' ? 'none' : '1.5px solid rgba(226, 232, 240, 0.9)',
                  boxShadow: activePhaseTab === 'registration' ? '0 8px 20px rgba(59, 130, 246, 0.3)' : '0 2px 6px rgba(100, 116, 139, 0.05)'
                }}
              >
                <span>📝 Open for Registration</span>
                <span style={{
                  fontSize: '0.78rem',
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: activePhaseTab === 'registration' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(59, 130, 246, 0.12)',
                  color: activePhaseTab === 'registration' ? '#ffffff' : '#1d4ed8',
                  fontWeight: 800
                }}>
                  {registrationEvents.length}
                </span>
              </button>

              <button
                onClick={() => setActivePhaseTab('ongoing')}
                style={{
                  padding: '11px 22px',
                  borderRadius: 14,
                  fontSize: '0.94rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: activePhaseTab === 'ongoing' ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255, 255, 255, 0.85)',
                  color: activePhaseTab === 'ongoing' ? '#ffffff' : '#334155',
                  border: activePhaseTab === 'ongoing' ? 'none' : '1.5px solid rgba(226, 232, 240, 0.9)',
                  boxShadow: activePhaseTab === 'ongoing' ? '0 8px 20px rgba(16, 185, 129, 0.3)' : '0 2px 6px rgba(100, 116, 139, 0.05)'
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: activePhaseTab === 'ongoing' ? '#ffffff' : '#dc2626', display: 'inline-block' }}></span>
                  ⚡ Ongoing Events
                </span>
                <span style={{
                  fontSize: '0.78rem',
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: activePhaseTab === 'ongoing' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(16, 185, 129, 0.15)',
                  color: activePhaseTab === 'ongoing' ? '#ffffff' : '#047857',
                  fontWeight: 800
                }}>
                  {ongoingEvents.length}
                </span>
              </button>

              <button
                onClick={() => setActivePhaseTab('completed')}
                style={{
                  padding: '11px 22px',
                  borderRadius: 14,
                  fontSize: '0.94rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: activePhaseTab === 'completed' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'rgba(255, 255, 255, 0.85)',
                  color: activePhaseTab === 'completed' ? '#ffffff' : '#334155',
                  border: activePhaseTab === 'completed' ? 'none' : '1.5px solid rgba(226, 232, 240, 0.9)',
                  boxShadow: activePhaseTab === 'completed' ? '0 8px 20px rgba(139, 92, 246, 0.3)' : '0 2px 6px rgba(100, 116, 139, 0.05)'
                }}
              >
                <span>🏁 Completed Events</span>
                <span style={{
                  fontSize: '0.78rem',
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: activePhaseTab === 'completed' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(139, 92, 246, 0.15)',
                  color: activePhaseTab === 'completed' ? '#ffffff' : '#6d28d9',
                  fontWeight: 800
                }}>
                  {completedEvents.length}
                </span>
              </button>

              <button
                onClick={() => setActivePhaseTab('all')}
                style={{
                  padding: '10px 18px',
                  borderRadius: 14,
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginLeft: 'auto',
                  background: activePhaseTab === 'all' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(241, 245, 249, 0.8)',
                  color: activePhaseTab === 'all' ? '#ffffff' : '#64748b',
                  border: '1px solid rgba(203, 213, 225, 0.8)'
                }}
              >
                All Events ({events.length})
              </button>
            </div>

            {/* Category Pills Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 28
            }}>
              <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600, marginRight: 4 }}>Filter:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedType(cat)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 18,
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    background: selectedType === cat ? '#0f172a' : 'rgba(255, 255, 255, 0.85)',
                    color: selectedType === cat ? '#ffffff' : '#475569',
                    border: `1.5px solid ${selectedType === cat ? '#0f172a' : 'rgba(226, 232, 240, 0.9)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Events Grid */}
            {loading ? (
              <div style={{ padding: 80, textAlign: 'center', color: '#64748b', fontSize: '1.05rem', fontWeight: 500 }}>
                Querying Neo4j Graph for campus events...
              </div>
            ) : displayedEvents.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '64px 24px',
                background: 'rgba(255, 255, 255, 0.85)',
                borderRadius: 22,
                border: '1.5px solid rgba(226, 232, 240, 0.9)',
                boxShadow: '0 10px 30px rgba(100, 116, 139, 0.06)'
              }}>
                <Calendar size={48} style={{ margin: '0 auto 16px', color: '#6366f1' }} />
                <h3 style={{ fontSize: '1.35rem', marginBottom: 8, color: '#0f172a', fontWeight: 700 }}>{emptyTitle}</h3>
                <p style={{ color: '#64748b', fontSize: '0.94rem', maxWidth: 520, margin: '0 auto 16px', lineHeight: 1.6 }}>
                  {emptyDesc}
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: 24
              }}>
                {displayedEvents.map((evt) => {
                  const seatsPercent = Math.min(100, Math.round((evt.registeredCount / (evt.maxParticipants || 1)) * 100));
                  const isFull = evt.seatsLeft <= 0;
                  const deadlineDate = evt.registrationDeadline ? new Date(evt.registrationDeadline) : (evt.startDateTime ? new Date(evt.startDateTime) : null);
                  const startDate = evt.startDateTime ? new Date(evt.startDateTime) : null;
                  const endDate = evt.endDateTime ? new Date(evt.endDateTime) : null;
                  const isDeadlinePassed = (deadlineDate && deadlineDate < now) || (startDate && startDate < now);
                  const isEventConcluded = evt.status === 'Completed' || (endDate && endDate < now);
                  const isEventOngoing = evt.status === 'Approved' && startDate && now >= startDate && (!endDate || now <= endDate);
                  const isRegistrationPhase = evt.status === 'Approved' && startDate && now < startDate && (!deadlineDate || now <= deadlineDate);

                  const turnoutPercent = evt.registeredCount > 0 ? Math.round(((evt.attendedCount || 0) / evt.registeredCount) * 100) : 0;

                  return (
                    <div 
                      key={evt.eventId}
                      className="card-interactive"
                      onClick={() => onSelectEvent(evt.eventId)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 24,
                        cursor: 'pointer',
                        border: isEventOngoing ? '2px solid rgba(16, 185, 129, 0.6)' : undefined,
                        boxShadow: isEventOngoing ? '0 12px 32px rgba(16, 185, 129, 0.15)' : undefined
                      }}
                    >
                      {/* Event Card Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span className="badge badge-info">{evt.type}</span>
                          <span className="badge badge-purple">{evt.clubName}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {isEventOngoing ? (
                            <span className="badge" style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#dc2626',
                              border: '1.5px solid rgba(239, 68, 68, 0.4)',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6
                            }}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }}></span>
                              LIVE ONGOING
                            </span>
                          ) : isEventConcluded ? (
                            <span className="badge" style={{
                              background: 'rgba(147, 51, 234, 0.12)',
                              color: '#7e22ce',
                              border: '1.5px solid rgba(147, 51, 234, 0.35)',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}>
                              <CheckCircle size={12} /> Completed
                            </span>
                          ) : isRegistrationPhase ? (
                            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle size={12} /> Registration Open
                            </span>
                          ) : (
                            <span className="badge" style={{
                              background: 'rgba(239, 68, 68, 0.12)',
                              color: '#b91c1c',
                              border: '1.5px solid rgba(239, 68, 68, 0.35)',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}>
                              <Lock size={12} /> Registration Closed
                            </span>
                          )}
                        </div>
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

                      {/* Timing & Venue Box */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: '0.84rem', color: '#334155', marginBottom: 18, background: 'rgba(241, 245, 249, 0.65)', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(226, 232, 240, 0.9)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <MapPin size={15} color="#4f46e5" style={{ flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{evt.venue}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Calendar size={15} color="#0284c7" style={{ flexShrink: 0 }} />
                          <span>
                            <strong>Date:</strong> {startDate ? `${startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'TBA'}
                          </span>
                        </div>
                        {isEventOngoing ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Clock size={15} color="#059669" style={{ flexShrink: 0 }} />
                            <span style={{ color: '#047857', fontWeight: 600 }}>
                              <strong>Ongoing until:</strong> {endDate ? endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'completion'}
                            </span>
                          </div>
                        ) : isRegistrationPhase ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Clock size={15} color={isDeadlinePassed ? '#dc2626' : '#d97706'} style={{ flexShrink: 0 }} />
                            <span style={{ color: isDeadlinePassed ? '#b91c1c' : '#334155' }}>
                              <strong>Reg Deadline:</strong> {deadlineDate ? `${deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'At event start'}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      {/* Phase Specific Footer Metrics */}
                      {isEventConcluded ? (
                        <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1.5px solid rgba(226, 232, 240, 0.8)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center', marginBottom: 10 }}>
                            <div style={{ background: 'rgba(241, 245, 249, 0.7)', padding: '6px 4px', borderRadius: 8 }}>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>REGISTERED</div>
                              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>{evt.registeredCount}</div>
                            </div>
                            <div style={{ background: 'rgba(209, 250, 229, 0.6)', padding: '6px 4px', borderRadius: 8 }}>
                              <div style={{ fontSize: '0.72rem', color: '#047857' }}>ATTENDED</div>
                              <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.92rem' }}>{evt.attendedCount || 0}</div>
                            </div>
                            <div style={{ background: 'rgba(243, 232, 255, 0.7)', padding: '6px 4px', borderRadius: 8 }}>
                              <div style={{ fontSize: '0.72rem', color: '#7e22ce' }}>TURNOUT</div>
                              <div style={{ fontWeight: 800, color: '#6d28d9', fontSize: '0.92rem' }}>{turnoutPercent}%</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#6d28d9', fontWeight: 700 }}>
                            <span>Full Details & Results</span>
                            <ArrowRight size={15} />
                          </div>
                        </div>
                      ) : isEventOngoing ? (
                        <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1.5px solid rgba(226, 232, 240, 0.8)' }}>
                          <div style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: 10,
                            padding: '8px 12px',
                            fontSize: '0.82rem',
                            color: '#065f46',
                            marginBottom: 8,
                            fontWeight: 600
                          }}>
                            ⚡ Live Attendance in Progress at Venue
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>
                            <span>{evt.attendedCount || 0} / {evt.registeredCount} Students Checked In</span>
                            <ArrowRight size={15} />
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
                            <span style={{ color: '#64748b', fontWeight: 500 }}>
                              {evt.registeredCount} / {evt.maxParticipants} Registered
                            </span>
                            <span style={{ fontWeight: 700, color: isFull ? '#d97706' : '#059669' }}>
                              {isFull ? 'Waitlist Open' : `${evt.seatsLeft} Seats Left`}
                            </span>
                          </div>

                          <div style={{ width: '100%', height: 7, borderRadius: 4, background: 'rgba(226, 232, 240, 0.9)', overflow: 'hidden', marginBottom: 10 }}>
                            <div style={{
                              width: `${seatsPercent}%`,
                              height: '100%',
                              background: isFull ? '#f59e0b' : 'linear-gradient(90deg, #10b981, #06b6d4)',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: '0.82rem', color: '#2563eb', fontWeight: 700 }}>
                            <span>Register Now</span>
                            <ArrowRight size={15} style={{ marginLeft: 4 }} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
