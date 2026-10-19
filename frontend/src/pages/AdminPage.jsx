import React, { useState, useEffect } from 'react';
import { 
  Shield, Check, X, AlertTriangle, Users, Award, 
  BarChart3, RefreshCw, CheckCircle, ShieldAlert,
  Calendar, MapPin, Clock, FileText
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
  const [pendingClubs, setPendingClubs] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const isAdmin = user && user.role === 'Admin';

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Fetch pending clubs independently
      try {
        const clubsRes = await api.getClubs('Pending');
        setPendingClubs(clubsRes.clubs || []);
      } catch (err) {
        console.warn('Could not fetch pending clubs:', err);
      }

      // 2. Fetch pending events independently
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

      // 3. Fetch admin analytics independently (only succeeds if Admin token)
      try {
        const analyticsRes = await api.getAdminAnalytics();
        setAnalytics(analyticsRes.analytics || null);
      } catch (err) {
        console.info('Admin analytics unavailable (non-admin persona or guest):', err.message);
        setAnalytics(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

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
      setMessage('Event approved! Now live in the discovery catalog.');
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
            Only Campus Administrators can access this command center to review, approve, or reject event charters. Please log in with Administrator credentials.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 24px' }}>
      {/* Admin Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: 10, color: '#0f172a', fontWeight: 800 }}>
            <Shield size={28} color="#d97706" /> Administrator Command Center
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            System-wide governance, venue clash verification, club approvals, and Neo4j graph analytics.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadData} disabled={loading}>
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
          marginBottom: 20
        }}>
          {message}
        </div>
      )}

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

      {/* Pending Approvals Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24, marginBottom: 36 }}>
        {/* Pending Events with Venue Clash Alert */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a', fontWeight: 800 }}>
            <Calendar size={18} color="#d97706" /> Pending Event Approvals ({pendingEvents.length})
          </h3>

          {pendingEvents.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.92rem' }}>No events awaiting approval.</div>
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
                        <span>Deadline: {new Date(evt.registrationDeadline).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={14} color="#059669" />
                        <span>Capacity: <strong style={{ color: '#0f172a' }}>{evt.maxParticipants} Seats</strong> {evt.maxTeamSize > 0 ? `(Team of ${evt.maxTeamSize})` : '(Solo)'}</span>
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
                            This slot clashes with approved event <strong>"{evt.clashes[0].clashingEventName}"</strong> at {evt.venue} ({new Date(evt.clashes[0].clashingStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(evt.clashes[0].clashingEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).
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
                      {isClashing && (
                        <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>
                          ⚠️ Approving will override or fail conflict check
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Clubs */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a', fontWeight: 800 }}>
            <Users size={18} color="#0284c7" /> Pending Club Charter Requests ({pendingClubs.length})
          </h3>

          {pendingClubs.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.92rem' }}>No club charters pending review.</div>
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
  );
}
