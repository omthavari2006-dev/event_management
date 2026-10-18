import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Calendar, CheckSquare, Award, AlertTriangle, 
  MapPin, Clock, CheckCircle, ShieldAlert 
} from 'lucide-react';
import { api } from '../api/client';

export default function OrganizerPage({ user, onRefresh }) {
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Create Event Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Workshop');
  const [eventDesc, setEventDesc] = useState('');
  const [eventVenue, setEventVenue] = useState('CS Computer Lab 3');
  const [startDateTime, setStartDateTime] = useState('2026-11-20T14:00');
  const [endDateTime, setEndDateTime] = useState('2026-11-20T18:00');
  const [regDeadline, setRegDeadline] = useState('2026-11-19T23:59');
  const [maxParticipants, setMaxParticipants] = useState('40');
  const [maxTeamSize, setMaxTeamSize] = useState('0');
  const [venueClashWarning, setVenueClashWarning] = useState(null);

  // Winner declaration form state
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winner1, setWinner1] = useState('');
  const [winner2, setWinner2] = useState('');
  const [winner3, setWinner3] = useState('');

  // Load user's clubs
  useEffect(() => {
    async function loadClubs() {
      try {
        const res = await api.getClubs('Approved');
        setClubs(res.clubs || []);
        if (res.clubs && res.clubs.length > 0) {
          setSelectedClubId(res.clubs[0].clubId);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadClubs();
  }, []);

  // Load club events
  useEffect(() => {
    async function loadEvents() {
      if (!selectedClubId) return;
      try {
        const clubRes = await api.getClub(selectedClubId);
        setEvents(clubRes.club?.events || []);
        if (clubRes.club?.events?.length > 0) {
          setSelectedEventId(clubRes.club.events[0].eventId);
        } else {
          setSelectedEventId('');
          setRegistrations([]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadEvents();
  }, [selectedClubId]);

  // Load event registrations
  useEffect(() => {
    async function loadRegs() {
      if (!selectedEventId) {
        setRegistrations([]);
        return;
      }
      try {
        setLoading(true);
        const res = await api.getEventRegistrations(selectedEventId);
        setRegistrations(res.registrations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRegs();
  }, [selectedEventId]);

  // Real-time Venue Clash Checker
  const checkVenueClash = async (venue, start, end) => {
    if (!venue || !start || !end) return;
    try {
      const res = await api.checkVenueClash(venue, new Date(start).toISOString(), new Date(end).toISOString());
      if (res.hasClash) {
        setVenueClashWarning(`⚠️ Venue Clash Alert! "${res.clashes[0].clashingEventName}" is already scheduled at ${venue} during this period.`);
      } else {
        setVenueClashWarning(null);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.createEvent({
        clubId: selectedClubId,
        name: eventName,
        type: eventType,
        description: eventDesc,
        venue: eventVenue,
        startDateTime: new Date(startDateTime).toISOString(),
        endDateTime: new Date(endDateTime).toISOString(),
        registrationDeadline: new Date(regDeadline).toISOString(),
        maxParticipants: parseInt(maxParticipants),
        maxTeamSize: parseInt(maxTeamSize)
      });
      setShowCreateModal(false);
      setStatusMessage({ type: 'success', text: 'Event created and submitted for Admin approval!' });
      // reload events
      const clubRes = await api.getClub(selectedClubId);
      setEvents(clubRes.club?.events || []);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (studentId) => {
    try {
      await api.markAttendance(selectedEventId, [studentId]);
      setStatusMessage({ type: 'success', text: 'Attendance marked!' });
      const res = await api.getEventRegistrations(selectedEventId);
      setRegistrations(res.registrations || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMarkAllAttendance = async () => {
    const registeredIds = registrations.filter(r => r.status === 'Registered').map(r => r.studentId);
    if (registeredIds.length === 0) return;
    try {
      await api.markAttendance(selectedEventId, registeredIds);
      setStatusMessage({ type: 'success', text: `Marked attendance for ${registeredIds.length} students!` });
      const res = await api.getEventRegistrations(selectedEventId);
      setRegistrations(res.registrations || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGenerateCertificates = async () => {
    try {
      const res = await api.generateCertificates(selectedEventId);
      setStatusMessage({ type: 'success', text: `Issued ${res.count} verifiable certificates in Neo4j!` });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeclareWinners = async (e) => {
    e.preventDefault();
    const winners = [];
    if (winner1) winners.push({ studentId: winner1, position: 1, prize: '$300 1st Prize' });
    if (winner2) winners.push({ studentId: winner2, position: 2, prize: '$200 2nd Prize' });
    if (winner3) winners.push({ studentId: winner3, position: 3, prize: '$100 3rd Prize' });

    if (winners.length === 0) return;
    try {
      await api.declareWinners(selectedEventId, winners);
      setShowWinnerModal(false);
      setStatusMessage({ type: 'success', text: 'Winners declared successfully!' });
      const res = await api.getEventRegistrations(selectedEventId);
      setRegistrations(res.registrations || []);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={28} color="#ec4899" /> Club Organizer Studio
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Host events, review registrations, track attendance, award prizes, and issue official credentials.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
          <Plus size={18} /> Create New Event
        </button>
      </div>

      {statusMessage && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 10,
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          marginBottom: 20
        }}>
          {statusMessage.text}
        </div>
      )}

      {/* Selector Toolbar */}
      <div style={{
        background: 'rgba(23, 31, 51, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 28,
        display: 'flex',
        gap: 20,
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Select Active Club</label>
          <select 
            value={selectedClubId} 
            onChange={(e) => setSelectedClubId(e.target.value)}
            style={{ width: '100%' }}
          >
            {clubs.map(c => (
              <option key={c.clubId} value={c.clubId}>{c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Select Event</label>
          <select 
            value={selectedEventId} 
            onChange={(e) => setSelectedEventId(e.target.value)}
            style={{ width: '100%' }}
            disabled={events.length === 0}
          >
            {events.length === 0 && <option value="">No events found for this club</option>}
            {events.map(e => (
              <option key={e.eventId} value={e.eventId}>{e.name} ({e.status})</option>
            ))}
          </select>
        </div>

        {selectedEventId && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <button className="btn btn-secondary" onClick={handleMarkAllAttendance}>
              <CheckSquare size={16} /> Mark All Present
            </button>
            <button className="btn btn-secondary" onClick={() => setShowWinnerModal(true)}>
              <Award size={16} /> Declare Winners
            </button>
            <button className="btn btn-primary" onClick={handleGenerateCertificates} style={{ background: '#10b981' }}>
              <CheckCircle size={16} /> Issue Certificates
            </button>
          </div>
        )}
      </div>

      {/* Registrations & Attendance Table */}
      <div style={{
        background: 'rgba(23, 31, 51, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 24
      }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>
          Live Registrations & Attendance ({registrations.length} students)
        </h3>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading registrations...</div>
        ) : registrations.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No students registered yet for this event.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '12px 14px' }}>Student</th>
                  <th style={{ padding: '12px 14px' }}>Department</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px' }}>Team</th>
                  <th style={{ padding: '12px 14px' }}>Attendance</th>
                  <th style={{ padding: '12px 14px' }}>Distinction</th>
                  <th style={{ padding: '12px 14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(r => (
                  <tr key={r.studentId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#f8fafc' }}>
                      {r.studentName}
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{r.studentId}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#cbd5e1' }}>{r.department} (Yr {r.year})</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge ${r.status === 'Registered' ? 'badge-success' : 'badge-warning'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#c084fc' }}>{r.teamName || '—'}</td>
                    <td style={{ padding: '12px 14px' }}>
                      {r.attended ? (
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle size={12} /> Present
                        </span>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Absent</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {r.wonPosition ? (
                        <span className="badge badge-warning">#{r.wonPosition} ({r.wonPrize})</span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {!r.attended && r.status === 'Registered' && (
                        <button 
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                          onClick={() => handleMarkAttendance(r.studentId)}
                        >
                          Check In
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Event */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600, padding: 28 }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 16 }}>Create New Club Event</h2>

            {venueClashWarning && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fcd34d',
                fontSize: '0.84rem',
                marginBottom: 16
              }}>
                {venueClashWarning}
              </div>
            )}

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Event Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Next-Gen Robotics Sprint" 
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Event Type</label>
                  <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={{ width: '100%' }}>
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Venue</label>
                  <input 
                    type="text" 
                    value={eventVenue} 
                    onChange={(e) => {
                      setEventVenue(e.target.value);
                      checkVenueClash(e.target.value, startDateTime, endDateTime);
                    }}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Description</label>
                <textarea 
                  rows={2} 
                  value={eventDesc} 
                  onChange={(e) => setEventDesc(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Start Date-Time</label>
                  <input 
                    type="datetime-local" 
                    value={startDateTime}
                    onChange={(e) => {
                      setStartDateTime(e.target.value);
                      checkVenueClash(eventVenue, e.target.value, endDateTime);
                    }}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>End Date-Time</label>
                  <input 
                    type="datetime-local" 
                    value={endDateTime}
                    onChange={(e) => {
                      setEndDateTime(e.target.value);
                      checkVenueClash(eventVenue, startDateTime, e.target.value);
                    }}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Deadline</label>
                  <input 
                    type="datetime-local" 
                    value={regDeadline}
                    onChange={(e) => setRegDeadline(e.target.value)}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Max Seats</label>
                  <input 
                    type="number" 
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Team Size (0=Solo)</label>
                  <input 
                    type="number" 
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(e.target.value)}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  Submit Event
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Declare Winners */}
      {showWinnerModal && (
        <div className="modal-overlay" onClick={() => setShowWinnerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500, padding: 28 }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 16 }}>Declare Winners (Attendees Only)</h2>
            <form onSubmit={handleDeclareWinners} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>1st Place Winner ($300)</label>
                <select value={winner1} onChange={(e) => setWinner1(e.target.value)} style={{ width: '100%' }}>
                  <option value="">Select attending student...</option>
                  {registrations.filter(r => r.attended).map(r => (
                    <option key={r.studentId} value={r.studentId}>{r.studentName} ({r.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>2nd Place Winner ($200)</label>
                <select value={winner2} onChange={(e) => setWinner2(e.target.value)} style={{ width: '100%' }}>
                  <option value="">Select attending student...</option>
                  {registrations.filter(r => r.attended).map(r => (
                    <option key={r.studentId} value={r.studentId}>{r.studentName} ({r.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>3rd Place Winner ($100)</label>
                <select value={winner3} onChange={(e) => setWinner3(e.target.value)} style={{ width: '100%' }}>
                  <option value="">Select attending student...</option>
                  {registrations.filter(r => r.attended).map(r => (
                    <option key={r.studentId} value={r.studentId}>{r.studentName} ({r.department})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Winners</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowWinnerModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
