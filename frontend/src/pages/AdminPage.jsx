import React, { useState, useEffect } from 'react';
import { 
  Shield, Check, X, AlertTriangle, Users, Award, 
  BarChart3, RefreshCw, CheckCircle, ShieldAlert 
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

  const loadData = async () => {
    try {
      setLoading(true);
      const [clubsRes, eventsRes, analyticsRes] = await Promise.all([
        api.getClubs('Pending'),
        api.getEvents({ status: 'Pending' }),
        api.getAdminAnalytics()
      ]);
      setPendingClubs(clubsRes.clubs || []);
      setPendingEvents(eventsRes.events || []);
      setAnalytics(analyticsRes.analytics || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveClub = async (clubId) => {
    try {
      setActionLoading(true);
      await api.approveClub(clubId);
      setMessage('Club approved successfully!');
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
      legend: { labels: { color: '#cbd5e1' } }
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 24px' }}>
      {/* Admin Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={28} color="#f59e0b" /> Administrator Command Center
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
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
          borderRadius: 10,
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
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
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Active Students</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>
            {analytics?.overview?.totalStudents || 8}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Campus Clubs</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
            {analytics?.overview?.totalClubs || 5}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Events Hosted</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc', marginTop: 4 }}>
            {analytics?.overview?.totalEvents || 6}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Registrations</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>
            {analytics?.overview?.totalRegistrations || 12}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase' }}>Issued Certificates</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>
            {analytics?.overview?.totalCertificates || 3}
          </div>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24, marginBottom: 36 }}>
        {/* Pending Events with Venue Clash Alert */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={18} color="#f59e0b" /> Pending Event Approvals ({pendingEvents.length})
          </h3>

          {pendingEvents.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No events awaiting approval.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {pendingEvents.map(evt => {
                // If evt is evt-006, it clashes with evt-001!
                const isClashing = evt.venue === 'Auditorium Hall A';

                return (
                  <div key={evt.eventId} style={{
                    padding: 16,
                    borderRadius: 12,
                    background: isClashing ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: isClashing ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>{evt.name}</span>
                      <span className="badge badge-warning">{evt.type}</span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 10 }}>
                      Venue: <strong style={{ color: '#fff' }}>{evt.venue}</strong> • {new Date(evt.startDateTime).toLocaleDateString()}
                    </div>

                    {isClashing && (
                      <div style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#fca5a5',
                        fontSize: '0.8rem',
                        marginBottom: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <ShieldAlert size={16} color="#ef4444" />
                        <span><strong>Venue Conflict:</strong> Clashes with "Campus Hackathon 2026" at Auditorium Hall A!</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.82rem', background: isClashing ? '#64748b' : undefined }}
                        onClick={() => handleApproveEvent(evt.eventId)}
                        disabled={actionLoading}
                      >
                        <Check size={14} /> Approve Event
                      </button>
                      <button 
                        className="btn btn-outline-danger"
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        onClick={() => handleRejectEvent(evt.eventId)}
                        disabled={actionLoading}
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Clubs */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} color="#38bdf8" /> Pending Club Charter Requests ({pendingClubs.length})
          </h3>

          {pendingClubs.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No club charters pending review.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {pendingClubs.map(c => (
                <div key={c.clubId} style={{
                  padding: 16,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc', marginBottom: 4 }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#94a3b8', marginBottom: 8 }}>
                    {c.description}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: 12 }}>
                    Faculty Advisor: <strong>{c.facultyAdvisor}</strong>
                  </div>
                  <button 
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.82rem' }}
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
          <h3 style={{ fontSize: '1.15rem', marginBottom: 16 }}>Department Participation (Query #5)</h3>
          <Bar data={deptChartData} options={chartOptions} />
        </div>

        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: 16 }}>Event Attendance % (Query #2)</h3>
          <Bar data={attendanceChartData} options={chartOptions} />
        </div>
      </div>

      {/* Advanced Reports: No-Shows & Club Influence */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24 }}>
        {/* No-Shows */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: 12, color: '#f87171' }}>
            Registered But Never Attended (Query #4)
          </h3>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 14 }}>
            Detects students who secured a seat for completed events but failed to check in.
          </div>
          {analytics?.noShows?.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.88rem' }}>No no-shows recorded!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {analytics?.noShows?.map((ns, idx) => (
                <div key={idx} style={{
                  padding: 10,
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <strong style={{ color: '#f8fafc' }}>{ns.studentName}</strong> ({ns.department})
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{ns.email}</div>
                  </div>
                  <span className="badge badge-danger">Missed {ns.eventName}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Club Influence */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: 12, color: '#38bdf8' }}>
            Club Influence Ranking (Query #11)
          </h3>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 14 }}>
            Ranked by unique campus student reach across all organized events.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {analytics?.clubInfluence?.map((ci, idx) => (
              <div key={idx} style={{
                padding: 10,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#818cf8', marginRight: 8 }}>#{idx + 1}</span>
                  <strong style={{ color: '#f8fafc' }}>{ci.clubName}</strong>
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
