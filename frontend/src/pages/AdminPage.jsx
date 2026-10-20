import React, { useState, useEffect } from 'react';
import { 
  Shield, Check, X, AlertTriangle, Users, Award, 
  BarChart3, RefreshCw, CheckCircle, ShieldAlert,
  Calendar, MapPin, Clock, FileText, Search, Star,
  Filter, ChevronRight, Lock, UserCheck, UserX, MessageSquare
} from 'lucide-react';
import { api } from '../api/client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminPage({ user, onRefresh }) {
  const [activeAdminTab, setActiveAdminTab] = useState('approvals'); // 'approvals' | 'completed' | 'analytics'
  const [pendingClubs, setPendingClubs] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [selectedCompletedEventId, setSelectedCompletedEventId] = useState('');
  const [selectedCompletedEvent, setSelectedCompletedEvent] = useState(null);
  const [completedRegistrations, setCompletedRegistrations] = useState([]);
  const [completedWinners, setCompletedWinners] = useState([]);
  const [completedFeedback, setCompletedFeedback] = useState([]);

  const [completedSearch, setCompletedSearch] = useState('');
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [attendeeFilter, setAttendeeFilter] = useState('All'); // 'All' | 'Present' | 'Absent'

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const isAdmin = user && user.role === 'Admin';

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Fetch pending clubs
      try {
        const clubsRes = await api.getClubs('Pending');
        setPendingClubs(clubsRes.clubs || []);
      } catch (err) {
        console.warn('Could not fetch pending clubs:', err);
      }

      // 2. Fetch pending events with venue clash check
      try {
        const eventsRes = await api.getEvents({ status: 'Pending' });
        const rawEvents = eventsRes.events || [];
        const eventsWithClash = await Promise.all(
          rawEvents.map(async (evt) => {
            try {
              const clashRes = await api.checkVenueClash(
                evt.venue,
                evt.startDateTime,
                evt.endDateTime,
                evt.eventId
              );
              return {
                ...evt,
                hasClash: clashRes.hasClash,
                clashes: clashRes.clashes || []
              };
            } catch {
              return { ...evt, hasClash: false, clashes: [] };
            }
          })
        );
        setPendingEvents(eventsWithClash);
      } catch (err) {
        console.warn('Could not fetch pending events:', err);
      }

      // 3. Fetch completed events
      try {
        const compRes = await api.getEvents({ status: 'Completed' });
        const cEvents = compRes.events || [];
        setCompletedEvents(cEvents);
        if (cEvents.length > 0 && !selectedCompletedEventId) {
          setSelectedCompletedEventId(cEvents[0].eventId);
        }
      } catch (err) {
        console.warn('Could not fetch completed events:', err);
      }

      // 4. Fetch admin analytics
      try {
        const analyticsRes = await api.getAdminAnalytics();
        setAnalytics(analyticsRes.analytics || null);
      } catch (err) {
        console.info('Admin analytics unavailable:', err.message);
        setAnalytics(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Load detailed information for the selected completed event
  useEffect(() => {
    async function loadCompletedEventDetails() {
      if (!selectedCompletedEventId) {
        setSelectedCompletedEvent(null);
        setCompletedRegistrations([]);
        setCompletedWinners([]);
        setCompletedFeedback([]);
        return;
      }
      try {
        setDetailLoading(true);
        const [eventRes, regsRes, winRes, fbRes] = await Promise.all([
          api.getEvent(selectedCompletedEventId).catch(() => ({ event: null })),
          api.getEventRegistrations(selectedCompletedEventId).catch(() => ({ registrations: [] })),
          api.getWinners(selectedCompletedEventId).catch(() => ({ winners: [] })),
          api.getFeedback(selectedCompletedEventId).catch(() => ({ feedback: [] }))
        ]);
        setSelectedCompletedEvent(eventRes?.event || null);
        setCompletedRegistrations(regsRes?.registrations || []);
        setCompletedWinners(winRes?.winners || []);
        setCompletedFeedback(fbRes?.feedback || []);
      } catch (err) {
        console.error('Error loading completed event details:', err);
      } finally {
        setDetailLoading(false);
      }
    }

    if (selectedCompletedEventId) {
      loadCompletedEventDetails();
    }
  }, [selectedCompletedEventId]);

  const handleApproveClub = async (clubId) => {
    try {
      setActionLoading(true);
      await api.approveClub(clubId);
      setMessage('Club charter approved successfully!');
      await loadData();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveEvent = async (eventId) => {
    try {
      setActionLoading(true);
      await api.approveEvent(eventId);
      setMessage('Event approved! Now live in the discovery catalog for students.');
      await loadData();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectEvent = async (eventId) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    try {
      setActionLoading(true);
      await api.rejectEvent(eventId, reason);
      setMessage('Event rejected.');
      await loadData();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Completed events aggregated stats
  const totalCompletedCount = completedEvents.length;
  const totalCompletedRegs = completedEvents.reduce((acc, e) => acc + (e.registeredCount || 0), 0);
  const totalCompletedAttended = completedEvents.reduce((acc, e) => acc + (e.attendedCount || 0), 0);
  const overallCompletedTurnout = totalCompletedRegs > 0 ? Math.round((totalCompletedAttended / totalCompletedRegs) * 100) : 0;

  // Filtered completed events list
  const filteredCompletedEvents = completedEvents.filter(e => {
    if (!completedSearch.trim()) return true;
    const q = completedSearch.toLowerCase();
    return (
      e.name?.toLowerCase().includes(q) ||
      e.clubName?.toLowerCase().includes(q) ||
      e.venue?.toLowerCase().includes(q) ||
      e.type?.toLowerCase().includes(q)
    );
  });

  // Selected completed event attendance metrics
  const registeredAttendees = completedRegistrations.filter(r => r.status === 'Registered');
  const verifiedAttendedCount = registeredAttendees.filter(r => r.attended).length;
  const absentAttendeeCount = registeredAttendees.length - verifiedAttendedCount;
  const selectedTurnoutPercent = registeredAttendees.length > 0 ? Math.round((verifiedAttendedCount / registeredAttendees.length) * 100) : 0;

  // Filtered registrations in selected completed event
  const filteredAttendees = completedRegistrations.filter(r => {
    const matchesSearch = 
      !attendeeSearch.trim() ||
      r.studentName?.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      r.studentId?.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      r.department?.toLowerCase().includes(attendeeSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (attendeeFilter === 'Present') return r.attended;
    if (attendeeFilter === 'Absent') return !r.attended && r.status === 'Registered';
    return true;
  });

  // Chart data: Department Participation
  const deptChartData = {
    labels: analytics?.deptRanking?.map(d => d.department) || ['CS', 'ECE', 'IT', 'Mech'],
    datasets: [
      {
        label: 'Total Attendances',
        data: analytics?.deptRanking?.map(d => d.totalAttendances) || [12, 8, 6, 4],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: '#6366f1',
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  };

  // Chart data: Attendance Rate %
  const attendanceChartData = {
    labels: analytics?.attendanceRates?.map(e => e.eventName.substring(0, 15) + '...') || [],
    datasets: [
      {
        label: 'Attendance Rate %',
        data: analytics?.attendanceRates?.map(e => e.attendancePercentage) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#334155', font: { weight: '600' } } }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(226, 232, 240, 0.8)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(226, 232, 240, 0.8)' } }
    }
  };

  if (!user || user.role !== 'Admin') {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: 48, borderRadius: 20 }}>
          <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Administrator Access Required</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Only Campus Administrators can access this command center to review, approve, or audit event records. Please log in with Administrator credentials.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1360, margin: '0 auto', padding: '32px 24px' }}>
      {/* Admin Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '2.1rem', display: 'flex', alignItems: 'center', gap: 10, color: '#0f172a', fontWeight: 800 }}>
              <Shield size={30} color="#d97706" /> Administrator Command Center
            </h1>
            <span className="badge badge-warning" style={{ fontSize: '0.8rem' }}>Campus Authority</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: 4 }}>
            System-wide governance: review incoming requests, audit completed event attendance & organizer submissions, and explore graph analytics.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadData} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={16} /> Refresh Metrics
        </button>
      </div>

      {message && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 12,
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1.5px solid rgba(16, 185, 129, 0.3)',
          color: '#065f46',
          fontWeight: 600,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{message}</span>
          <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}>✕</button>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 28,
        borderBottom: '1.5px solid rgba(226, 232, 240, 0.9)',
        paddingBottom: 16,
        flexWrap: 'wrap'
      }}>
        {/* Tab 1: Pending Requests */}
        <button
          onClick={() => setActiveAdminTab('approvals')}
          style={{
            padding: '10px 22px',
            borderRadius: 14,
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: activeAdminTab === 'approvals' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.85)',
            color: activeAdminTab === 'approvals' ? '#ffffff' : '#475569',
            border: activeAdminTab === 'approvals' ? 'none' : '1px solid #e2e8f0',
            boxShadow: activeAdminTab === 'approvals' ? '0 4px 14px rgba(99, 102, 241, 0.35)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Clock size={16} /> Pending Approvals & Requests
          {(pendingEvents.length + pendingClubs.length) > 0 && (
            <span style={{
              background: activeAdminTab === 'approvals' ? 'rgba(255, 255, 255, 0.28)' : '#ef4444',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: 10,
              fontSize: '0.74rem',
              fontWeight: 800
            }}>
              {pendingEvents.length + pendingClubs.length}
            </span>
          )}
        </button>

        {/* Tab 2: Completed Events (The separate tab requested by user!) */}
        <button
          onClick={() => setActiveAdminTab('completed')}
          style={{
            padding: '10px 22px',
            borderRadius: 14,
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: activeAdminTab === 'completed' ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : 'rgba(255, 255, 255, 0.85)',
            color: activeAdminTab === 'completed' ? '#ffffff' : '#475569',
            border: activeAdminTab === 'completed' ? 'none' : '1px solid #e2e8f0',
            boxShadow: activeAdminTab === 'completed' ? '0 4px 14px rgba(124, 58, 237, 0.35)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <CheckCircle size={16} /> Completed Events & Audit
          <span style={{
            background: activeAdminTab === 'completed' ? 'rgba(255, 255, 255, 0.28)' : 'rgba(124, 58, 237, 0.12)',
            color: activeAdminTab === 'completed' ? '#ffffff' : '#7c3aed',
            padding: '2px 8px',
            borderRadius: 10,
            fontSize: '0.74rem',
            fontWeight: 800
          }}>
            {completedEvents.length}
          </span>
        </button>

        {/* Tab 3: Campus Analytics */}
        <button
          onClick={() => setActiveAdminTab('analytics')}
          style={{
            padding: '10px 22px',
            borderRadius: 14,
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: activeAdminTab === 'analytics' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.85)',
            color: activeAdminTab === 'analytics' ? '#ffffff' : '#475569',
            border: activeAdminTab === 'analytics' ? 'none' : '1px solid #e2e8f0',
            boxShadow: activeAdminTab === 'analytics' ? '0 4px 14px rgba(99, 102, 241, 0.35)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <BarChart3 size={16} /> Campus Analytics & Insights
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PENDING APPROVALS                                                 */}
      {/* ========================================================================= */}
      {activeAdminTab === 'approvals' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24 }}>
            {/* Pending Events with Venue Clash Alert */}
            <div className="glass-panel" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a', fontWeight: 800 }}>
                  <Calendar size={18} color="#d97706" /> Pending Event Approvals ({pendingEvents.length})
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Must approve before student registration opens</span>
              </div>

              {pendingEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b', fontSize: '0.92rem' }}>
                  <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 10px' }} />
                  <div>All event charters are up to date! No events awaiting approval.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {pendingEvents.map(evt => {
                    const isClashing = evt.hasClash;

                    return (
                      <div key={evt.eventId} style={{
                        padding: 18,
                        borderRadius: 16,
                        background: isClashing ? 'rgba(254, 242, 242, 0.95)' : 'rgba(248, 250, 252, 0.9)',
                        border: isClashing ? '1.5px solid rgba(239, 68, 68, 0.45)' : '1.5px solid rgba(226, 232, 240, 0.9)',
                        boxShadow: '0 4px 14px rgba(100, 116, 139, 0.05)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, fontSize: '1.08rem', color: '#0f172a' }}>{evt.name}</span>
                              <span className="badge badge-warning">{evt.type}</span>
                              {evt.clubName && <span className="badge badge-purple">{evt.clubName}</span>}
                            </div>
                            {evt.description && (
                              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: '4px 0 10px' }}>
                                {evt.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Requirements Box */}
                        {evt.requirements && (
                          <div style={{
                            padding: '10px 14px',
                            borderRadius: 10,
                            background: 'rgba(99, 102, 241, 0.08)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            fontSize: '0.84rem',
                            color: '#334155',
                            marginBottom: 12
                          }}>
                            <div style={{ color: '#4f46e5', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                              <FileText size={14} /> Organizer Requirements & Prerequisites:
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>{evt.requirements}</div>
                          </div>
                        )}

                        {/* Meta Info Grid */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: 8,
                          fontSize: '0.82rem',
                          color: '#334155',
                          marginBottom: 12,
                          background: 'rgba(241, 245, 249, 0.75)',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid rgba(226, 232, 240, 0.8)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <MapPin size={14} color="#4f46e5" />
                            <span>Venue: <strong style={{ color: '#0f172a' }}>{evt.venue}</strong></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={14} color="#0284c7" />
                            <span>{new Date(evt.startDateTime).toLocaleDateString()} ({new Date(evt.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={14} color="#d97706" />
                            <span>Reg Deadline: {new Date(evt.registrationDeadline || evt.startDateTime).toLocaleDateString()}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Users size={14} color="#059669" />
                            <span>Capacity: <strong style={{ color: '#0f172a' }}>{evt.maxParticipants} Seats</strong></span>
                          </div>
                        </div>

                        {/* Venue Clash Warning */}
                        {isClashing && evt.clashes?.length > 0 && (
                          <div style={{
                            padding: '10px 14px',
                            borderRadius: 10,
                            background: 'rgba(254, 226, 226, 0.95)',
                            border: '1.5px solid rgba(239, 68, 68, 0.4)',
                            color: '#991b1b',
                            fontSize: '0.84rem',
                            marginBottom: 12,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 10
                          }}>
                            <ShieldAlert size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                            <div>
                              <strong>Venue Conflict Detected!</strong>
                              <div>
                                This slot clashes with approved event <strong>"{evt.clashes[0].clashingEventName}"</strong> at {evt.venue}.
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <button 
                            className="btn btn-primary"
                            style={{
                              padding: '8px 20px',
                              fontSize: '0.86rem',
                              background: isClashing ? '#dc2626' : '#10b981',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                            onClick={() => handleApproveEvent(evt.eventId)}
                            disabled={actionLoading}
                          >
                            <Check size={15} /> Approve Event
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            style={{ padding: '8px 18px', fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            onClick={() => handleRejectEvent(evt.eventId)}
                            disabled={actionLoading}
                          >
                            <X size={15} /> Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending Club Charters */}
            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a', fontWeight: 800 }}>
                <Users size={18} color="#0284c7" /> Pending Club Charter Requests ({pendingClubs.length})
              </h3>

              {pendingClubs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b', fontSize: '0.92rem' }}>
                  <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 10px' }} />
                  <div>No club charters pending review.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {pendingClubs.map(c => (
                    <div key={c.clubId} style={{
                      padding: 16,
                      borderRadius: 14,
                      background: 'rgba(248, 250, 252, 0.9)',
                      border: '1.5px solid rgba(226, 232, 240, 0.9)',
                      boxShadow: '0 2px 8px rgba(100, 116, 139, 0.04)'
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '1.02rem', color: '#0f172a', marginBottom: 4 }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: '0.86rem', color: '#475569', marginBottom: 8 }}>
                        {c.description}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#334155', marginBottom: 12 }}>
                        Faculty Advisor: <strong style={{ color: '#0f172a' }}>{c.facultyAdvisor}</strong>
                      </div>
                      <button 
                        className="btn btn-primary"
                        style={{ padding: '7px 16px', fontSize: '0.84rem' }}
                        onClick={() => handleApproveClub(c.clubId)}
                        disabled={actionLoading}
                      >
                        <Check size={14} /> Approve Charter
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPLETED EVENTS (SEPARATED TAB)                                  */}
      {/* ========================================================================= */}
      {activeAdminTab === 'completed' && (
        <div>
          {/* Top KPI Header for Completed Events */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 28
          }}>
            <div className="glass-panel" style={{ padding: 18 }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Completed Events</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed', marginTop: 4 }}>
                {totalCompletedCount}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>Concluded & recorded in Neo4j</div>
            </div>

            <div className="glass-panel" style={{ padding: 18 }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Registered Students</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                {totalCompletedRegs}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#0284c7', marginTop: 4 }}>Across all concluded events</div>
            </div>

            <div className="glass-panel" style={{ padding: 18 }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Verified In-Person Attendees</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>
                {totalCompletedAttended}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: 4, fontWeight: 600 }}>Marked by Club Organizers</div>
            </div>

            <div className="glass-panel" style={{ padding: 18 }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Overall Turnout Rate</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4f46e5', marginTop: 4 }}>
                {overallCompletedTurnout}%
              </div>
              <div style={{ width: '100%', height: 6, borderRadius: 4, background: '#e2e8f0', marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: `${overallCompletedTurnout}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #6366f1)' }} />
              </div>
            </div>
          </div>

          {/* Master-Detail Layout */}
          {completedEvents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '64px 24px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 22,
              border: '1.5px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 10px 30px rgba(100, 116, 139, 0.06)'
            }}>
              <CheckCircle size={48} color="#7c3aed" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.35rem', marginBottom: 8, color: '#0f172a', fontWeight: 700 }}>No Completed Events Yet</h3>
              <p style={{ color: '#64748b', fontSize: '0.94rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
                Events that have been conducted by club organizers and sealed via the <strong>"Complete Event"</strong> action will appear here. The administration can inspect individual student attendance records, turnout rates, declared winners, and participant feedback.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: 24, alignItems: 'flex-start' }}>
              {/* Left Column: Completed Events List & Selector */}
              <div className="glass-panel" style={{ padding: 20 }}>
                <div style={{ marginBottom: 14 }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, marginBottom: 10 }}>
                    Completed Events ({filteredCompletedEvents.length})
                  </h3>
                  <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input 
                      type="text"
                      placeholder="Search completed events..."
                      value={completedSearch}
                      onChange={(e) => setCompletedSearch(e.target.value)}
                      style={{ width: '100%', paddingLeft: 34, paddingRight: 10, paddingTop: 8, paddingBottom: 8, borderRadius: 10, fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '680px', overflowY: 'auto', paddingRight: 4 }}>
                  {filteredCompletedEvents.map((evt) => {
                    const isSelected = selectedCompletedEventId === evt.eventId;
                    const turnout = evt.registeredCount > 0 ? Math.round((evt.attendedCount / evt.registeredCount) * 100) : 0;

                    return (
                      <div
                        key={evt.eventId}
                        onClick={() => setSelectedCompletedEventId(evt.eventId)}
                        style={{
                          padding: 14,
                          borderRadius: 14,
                          cursor: 'pointer',
                          background: isSelected 
                            ? 'linear-gradient(135deg, rgba(238, 242, 255, 0.95), rgba(243, 232, 255, 0.95))' 
                            : 'rgba(255, 255, 255, 0.85)',
                          border: isSelected 
                            ? '2px solid #7c3aed' 
                            : '1.5px solid rgba(226, 232, 240, 0.9)',
                          boxShadow: isSelected 
                            ? '0 6px 18px rgba(124, 58, 237, 0.15)' 
                            : '0 2px 6px rgba(100, 116, 139, 0.04)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <span className="badge badge-purple" style={{ fontSize: '0.74rem' }}>{evt.clubName}</span>
                          <span className="badge badge-info" style={{ fontSize: '0.74rem' }}>{evt.type}</span>
                        </div>

                        <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                          {evt.name}
                        </h4>

                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 8 }}>
                          📅 {new Date(evt.startDateTime).toLocaleDateString()} • 📍 {evt.venue}
                        </div>

                        {/* Brief Stat Pills */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: '0.76rem',
                          background: isSelected ? 'rgba(255, 255, 255, 0.7)' : 'rgba(241, 245, 249, 0.8)',
                          padding: '6px 10px',
                          borderRadius: 8
                        }}>
                          <span style={{ color: '#0f172a', fontWeight: 600 }}>👥 Reg: {evt.registeredCount}</span>
                          <span style={{ color: '#cbd5e1' }}>•</span>
                          <span style={{ color: '#059669', fontWeight: 700 }}>✅ Attended: {evt.attendedCount}</span>
                          <span style={{ color: '#cbd5e1' }}>•</span>
                          <span style={{ color: '#7c3aed', fontWeight: 700 }}>{turnout}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Comprehensive Selected Event Details Updated by Organiser */}
              {selectedCompletedEvent ? (
                <div className="glass-panel" style={{ padding: 28 }}>
                  {detailLoading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading event attendance details...</div>
                  ) : (
                    <div>
                      {/* Event Main Header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: 16,
                        borderBottom: '1.5px solid rgba(226, 232, 240, 0.8)',
                        paddingBottom: 20,
                        marginBottom: 20
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                            <h2 style={{ fontSize: '1.65rem', color: '#0f172a', fontWeight: 800 }}>
                              {selectedCompletedEvent.name}
                            </h2>
                            <span className="badge badge-purple" style={{ fontSize: '0.8rem' }}>🏁 Completed</span>
                            <span className="badge badge-info">{selectedCompletedEvent.type}</span>
                          </div>

                          {/* "Who Organises" details */}
                          <div style={{
                            display: 'flex',
                            gap: 18,
                            flexWrap: 'wrap',
                            fontSize: '0.88rem',
                            color: '#475569',
                            background: 'rgba(241, 245, 249, 0.65)',
                            padding: '10px 16px',
                            borderRadius: 12,
                            border: '1px solid rgba(226, 232, 240, 0.9)'
                          }}>
                            <div>
                              🏛️ <strong>Organized By:</strong> <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedCompletedEvent.clubName}</span>
                            </div>
                            {selectedCompletedEvent.presidentName && (
                              <div>
                                👑 <strong>Club President:</strong> <span style={{ color: '#0f172a' }}>{selectedCompletedEvent.presidentName}</span>
                              </div>
                            )}
                            {selectedCompletedEvent.facultyAdvisor && (
                              <div>
                                🎓 <strong>Faculty Advisor:</strong> <span style={{ color: '#0f172a' }}>{selectedCompletedEvent.facultyAdvisor}</span>
                              </div>
                            )}
                            <div>
                              📍 <strong>Venue:</strong> <span style={{ color: '#0f172a' }}>{selectedCompletedEvent.venue}</span>
                            </div>
                            <div>
                              📅 <strong>Event Date:</strong> <span style={{ color: '#0f172a' }}>{new Date(selectedCompletedEvent.startDateTime).toLocaleDateString()} ({new Date(selectedCompletedEvent.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Brief Stats Dashboard Counters */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: 14,
                        marginBottom: 24
                      }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.9)', border: '1px solid #e2e8f0', borderRadius: 14, padding: 14 }}>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Registered</div>
                          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                            {registeredAttendees.length}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Capacity: {selectedCompletedEvent.maxParticipants}</div>
                        </div>

                        <div style={{ background: 'rgba(236, 253, 245, 0.9)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 14, padding: 14 }}>
                          <div style={{ fontSize: '0.72rem', color: '#065f46', textTransform: 'uppercase', fontWeight: 700 }}>Students Attended</div>
                          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: 2 }}>
                            {verifiedAttendedCount}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 600 }}>Verified by Organizers</div>
                        </div>

                        <div style={{ background: 'rgba(254, 242, 242, 0.9)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 14, padding: 14 }}>
                          <div style={{ fontSize: '0.72rem', color: '#991b1b', textTransform: 'uppercase', fontWeight: 700 }}>No-Shows (Absent)</div>
                          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#dc2626', marginTop: 2 }}>
                            {absentAttendeeCount}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#dc2626' }}>Registered but missed</div>
                        </div>

                        <div style={{ background: 'rgba(245, 243, 255, 0.9)', border: '1px solid rgba(124, 58, 237, 0.3)', borderRadius: 14, padding: 14 }}>
                          <div style={{ fontSize: '0.72rem', color: '#6b21a8', textTransform: 'uppercase', fontWeight: 700 }}>Attendance Turnout</div>
                          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7c3aed', marginTop: 2 }}>
                            {selectedTurnoutPercent}%
                          </div>
                          <div style={{ width: '100%', height: 5, borderRadius: 3, background: '#e2e8f0', marginTop: 6, overflow: 'hidden' }}>
                            <div style={{ width: `${selectedTurnoutPercent}%`, height: '100%', background: '#7c3aed' }} />
                          </div>
                        </div>
                      </div>

                      {/* Organizer's Description & Requirements Box */}
                      {(selectedCompletedEvent.description || selectedCompletedEvent.requirements) && (
                        <div style={{
                          background: 'rgba(248, 250, 252, 0.9)',
                          border: '1px solid rgba(226, 232, 240, 0.9)',
                          borderRadius: 14,
                          padding: 16,
                          marginBottom: 24
                        }}>
                          {selectedCompletedEvent.description && (
                            <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.55, marginBottom: selectedCompletedEvent.requirements ? 12 : 0 }}>
                              <strong>Event Overview:</strong> {selectedCompletedEvent.description}
                            </p>
                          )}
                          {selectedCompletedEvent.requirements && (
                            <div style={{
                              background: 'rgba(99, 102, 241, 0.08)',
                              border: '1px solid rgba(99, 102, 241, 0.25)',
                              borderRadius: 10,
                              padding: '10px 14px',
                              fontSize: '0.85rem'
                            }}>
                              <div style={{ color: '#4f46e5', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FileText size={15} /> Requirements Specified by Organizer:
                              </div>
                              <div style={{ color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                                {selectedCompletedEvent.requirements}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Declared Honors & Winners (if any) */}
                      {completedWinners.length > 0 && (
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.8), rgba(253, 230, 138, 0.6))',
                          border: '1.5px solid rgba(245, 158, 11, 0.35)',
                          borderRadius: 14,
                          padding: 16,
                          marginBottom: 24
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontWeight: 700, color: '#92400e', fontSize: '0.95rem' }}>
                            <Award size={18} color="#d97706" /> Declared Event Winners (Awarded by Organizer):
                          </div>
                          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {completedWinners.map(w => (
                              <div key={w.studentId} style={{ background: '#fff', borderRadius: 10, padding: '8px 14px', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.86rem' }}>
                                <strong style={{ color: '#b45309' }}>#{w.position} Place</strong> ({w.prize}):{' '}
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>{w.studentName}</span> ({w.studentId})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Attendee Roster Section Header & Filters */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12,
                        marginBottom: 14
                      }}>
                        <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Users size={18} color="#4f46e5" />
                          Student Attendance Roster ({filteredAttendees.length} records)
                        </h3>

                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <div style={{ position: 'relative' }}>
                            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input 
                              type="text"
                              placeholder="Search student or department..."
                              value={attendeeSearch}
                              onChange={(e) => setAttendeeSearch(e.target.value)}
                              style={{ paddingLeft: 30, paddingRight: 10, paddingTop: 6, paddingBottom: 6, borderRadius: 8, fontSize: '0.82rem' }}
                            />
                          </div>

                          <div style={{ display: 'flex', gap: 4 }}>
                            {['All', 'Present', 'Absent'].map(tab => (
                              <button
                                key={tab}
                                onClick={() => setAttendeeFilter(tab)}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: 8,
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  background: attendeeFilter === tab ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.85)',
                                  border: `1px solid ${attendeeFilter === tab ? 'rgba(99, 102, 241, 0.4)' : '#e2e8f0'}`,
                                  color: attendeeFilter === tab ? '#4f46e5' : '#64748b',
                                  cursor: 'pointer'
                                }}
                              >
                                {tab === 'Present' ? `Present (${verifiedAttendedCount})` : tab === 'Absent' ? `Absent (${absentAttendeeCount})` : `All (${completedRegistrations.length})`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Attendee Roster Table */}
                      {filteredAttendees.length === 0 ? (
                        <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                          No students found matching your search.
                        </div>
                      ) : (
                        <div style={{ overflowX: 'auto', border: '1px solid rgba(226, 232, 240, 0.9)', borderRadius: 12 }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                            <thead>
                              <tr style={{ background: 'rgba(241, 245, 249, 0.8)', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                                <th style={{ padding: '10px 14px' }}>Student</th>
                                <th style={{ padding: '10px 14px' }}>Department</th>
                                <th style={{ padding: '10px 14px' }}>Reg Status</th>
                                <th style={{ padding: '10px 14px' }}>Attendance Status (Updated by Organizer)</th>
                                <th style={{ padding: '10px 14px' }}>Distinction / Awards</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredAttendees.map(r => (
                                <tr key={r.studentId} style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.7)' }}>
                                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>
                                    {r.studentName}
                                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 400 }}>{r.studentId} • {r.email}</div>
                                  </td>
                                  <td style={{ padding: '10px 14px', color: '#475569' }}>{r.department} (Yr {r.year})</td>
                                  <td style={{ padding: '10px 14px' }}>
                                    <span className={`badge ${r.status === 'Registered' ? 'badge-success' : 'badge-warning'}`}>
                                      {r.status}
                                    </span>
                                  </td>
                                  <td style={{ padding: '10px 14px' }}>
                                    {r.attended ? (
                                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        <CheckCircle size={12} /> Present {r.attendedAt ? `(${new Date(r.attendedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}
                                      </span>
                                    ) : (
                                      <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        <UserX size={13} /> Absent / No-Show
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '10px 14px' }}>
                                    {r.wonPosition ? (
                                      <span className="badge badge-warning">#{r.wonPosition} ({r.wonPrize})</span>
                                    ) : '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Student Feedback Reviews Section */}
                      {completedFeedback.length > 0 && (
                        <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid rgba(226, 232, 240, 0.9)' }}>
                          <h4 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <MessageSquare size={16} color="#4f46e5" /> Student Feedback & Ratings ({completedFeedback.length})
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                            {completedFeedback.map((fb, idx) => (
                              <div key={idx} style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.84rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                  <strong style={{ color: '#0f172a' }}>{fb.studentName}</strong>
                                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>{'★'.repeat(fb.rating || 5)}</span>
                                </div>
                                <div style={{ color: '#475569' }}>"{fb.comment}"</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
                  Select an event from the list on the left to inspect its complete records.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CAMPUS ANALYTICS                                                  */}
      {/* ========================================================================= */}
      {activeAdminTab === 'analytics' && (
        <div>
          {/* KPI Stats Counters */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginBottom: 32
          }}>
            <div className="glass-panel" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Active Students</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                {analytics?.overview?.totalStudents || 8}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Campus Clubs</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0284c7', marginTop: 4 }}>
                {analytics?.overview?.totalClubs || 5}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Events Hosted</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#7e22ce', marginTop: 4 }}>
                {analytics?.overview?.totalEvents || 6}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Registrations</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: 4 }}>
                {analytics?.overview?.totalRegistrations || 12}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Issued Certificates</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#d97706', marginTop: 4 }}>
                {analytics?.overview?.totalCertificates || 3}
              </div>
            </div>
          </div>

          {/* Analytics Charts (Chart.js) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24, marginBottom: 36 }}>
            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.18rem', marginBottom: 16, color: '#0f172a', fontWeight: 800 }}>Department Participation (Query #5)</h3>
              <Bar data={deptChartData} options={chartOptions} />
            </div>

            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.18rem', marginBottom: 16, color: '#0f172a', fontWeight: 800 }}>Event Attendance % (Query #2)</h3>
              <Bar data={attendanceChartData} options={chartOptions} />
            </div>
          </div>

          {/* Advanced Reports: No-Shows & Club Influence */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24 }}>
            {/* No-Shows */}
            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.18rem', marginBottom: 12, color: '#dc2626', fontWeight: 800 }}>
                Registered But Never Attended (Query #4)
              </h3>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 14 }}>
                Detects students who secured a seat for completed events but failed to check in.
              </div>
              {analytics?.noShows?.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '0.88rem' }}>No no-shows recorded!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {analytics?.noShows?.map((ns, idx) => (
                    <div key={idx} style={{
                      padding: 12,
                      borderRadius: 10,
                      background: 'rgba(254, 242, 242, 0.9)',
                      border: '1.5px solid rgba(239, 68, 68, 0.25)',
                      fontSize: '0.88rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <strong style={{ color: '#0f172a' }}>{ns.studentName}</strong> ({ns.department})
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{ns.email}</div>
                      </div>
                      <span className="badge badge-danger">Missed {ns.eventName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Club Influence */}
            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.18rem', marginBottom: 12, color: '#0284c7', fontWeight: 800 }}>
                Club Influence Ranking (Query #11)
              </h3>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 14 }}>
                Ranked by unique campus student reach across all organized events.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {analytics?.clubInfluence?.map((ci, idx) => (
                  <div key={idx} style={{
                    padding: 12,
                    borderRadius: 10,
                    background: 'rgba(248, 250, 252, 0.9)',
                    border: '1.5px solid rgba(226, 232, 240, 0.85)',
                    fontSize: '0.88rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <span style={{ fontWeight: 800, color: '#4f46e5', marginRight: 8 }}>#{idx + 1}</span>
                      <strong style={{ color: '#0f172a' }}>{ci.clubName}</strong>
                    </div>
                    <span className="badge badge-info">{ci.uniqueStudentsReached} Students Reached</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
