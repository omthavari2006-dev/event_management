import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Calendar, CheckSquare, Award, AlertTriangle, 
  MapPin, Clock, CheckCircle, ShieldAlert, Search, FileText, 
  Check, ArrowRight, Sparkles, Filter, ChevronRight, RefreshCw, X,
  Upload, ExternalLink, File
} from 'lucide-react';
import { api } from '../api/client';

export default function OrganizerPage({ user, onRefresh }) {
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Filter states
  const [eventStatusFilter, setEventStatusFilter] = useState('All'); // 'All' | 'Pending' | 'Approved' | 'Completed'
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('All'); // 'All' | 'Present' | 'Absent'
  const [quickStudentId, setQuickStudentId] = useState('');

  // Create Event Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createClubId, setCreateClubId] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Workshop');
  const [eventDesc, setEventDesc] = useState('');
  const [eventRequirements, setEventRequirements] = useState('Participants should bring a laptop with Node.js and Git installed. Open to all engineering students. College ID required at entry.');
  const [eventVenue, setEventVenue] = useState('CS Computer Lab 3');
  const getDefaultDateStr = (daysAhead, hours) => {
    const d = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hours)}:00`;
  };

  const [startDateTime, setStartDateTime] = useState(() => getDefaultDateStr(7, 14));
  const [endDateTime, setEndDateTime] = useState(() => getDefaultDateStr(7, 18));
  const [regDeadline, setRegDeadline] = useState(() => getDefaultDateStr(6, 23));
  const [maxParticipants, setMaxParticipants] = useState('40');
  const [maxTeamSize, setMaxTeamSize] = useState('0');
  const [venueClashWarning, setVenueClashWarning] = useState(null);

  // Winner declaration form state
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winner1, setWinner1] = useState('');
  const [winner2, setWinner2] = useState('');
  const [winner3, setWinner3] = useState('');

  // Certificate Issuing state
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [attendeeCertificates, setAttendeeCertificates] = useState([]);
  const [loadingCertAttendees, setLoadingCertAttendees] = useState(false);
  const [selectedAttendeeForUpload, setSelectedAttendeeForUpload] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCertType, setUploadCertType] = useState('Participation');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [certSearchQuery, setCertSearchQuery] = useState('');

  // Load user's clubs - strictly restricted to clubs the user is President or Organizer of
  useEffect(() => {
    async function loadClubs() {
      try {
        const res = await api.getClubs('Approved');
        const allClubs = res.clubs || [];

        // Scoping: Organizers can only access clubs they officially lead
        let organizerClubs = allClubs;
        if (user && user.role !== 'Admin') {
          const userClubIds = new Set([
            ...(user.presidentClubs || []),
            ...(user.clubMemberships?.filter(m => ['President', 'Organizer', 'Lead', 'Core Member'].includes(m.role)).map(m => m.clubId) || [])
          ]);
          organizerClubs = allClubs.filter(c => userClubIds.has(c.clubId));
        }

        setClubs(organizerClubs);

        let defaultClubId = '';
        if (organizerClubs.length > 0) {
          defaultClubId = organizerClubs[0].clubId;
        }

        setSelectedClubId(defaultClubId);
        setCreateClubId(defaultClubId);
      } catch (err) {
        console.error(err);
      }
    }
    loadClubs();
  }, [user]);

  // Load club events whenever active club changes
  const loadClubEvents = async (clubId) => {
    if (!clubId) return;
    try {
      setLoading(true);
      // Fetch all events for this club (Pending, Approved, Completed)
      const res = await api.getEvents({ clubId, status: 'All' });
      const clubEvents = res.events || [];
      setEvents(clubEvents);

      if (clubEvents.length > 0) {
        // Retain current selection if possible, otherwise select first
        setSelectedEventId(prev => {
          const exists = clubEvents.some(e => e.eventId === prev);
          const newId = exists ? prev : clubEvents[0].eventId;
          const found = clubEvents.find(e => e.eventId === newId);
          setSelectedEvent(found || clubEvents[0]);
          return newId;
        });
      } else {
        setSelectedEventId('');
        setSelectedEvent(null);
        setRegistrations([]);
      }
    } catch (err) {
      console.error('Error loading club events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubEvents(selectedClubId);
  }, [selectedClubId]);

  // Load event details & registrations whenever selected event changes
  useEffect(() => {
    async function loadEventData() {
      if (!selectedEventId) {
        setSelectedEvent(null);
        setRegistrations([]);
        return;
      }
      try {
        setLoading(true);
        const [eventRes, regsRes] = await Promise.all([
          api.getEvent(selectedEventId),
          api.getEventRegistrations(selectedEventId).catch(() => ({ registrations: [] }))
        ]);
        setSelectedEvent(eventRes.event);
        setRegistrations(regsRes.registrations || []);
      } catch (err) {
        console.error('Error loading event data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEventData();
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
      const chosenClubId = createClubId || selectedClubId || (clubs[0] ? clubs[0].clubId : 'club-001');
      await api.createEvent({
        clubId: chosenClubId,
        name: eventName,
        type: eventType,
        description: eventDesc || 'Campus student event.',
        requirements: eventRequirements,
        venue: eventVenue,
        startDateTime: new Date(startDateTime).toISOString(),
        endDateTime: new Date(endDateTime).toISOString(),
        registrationDeadline: new Date(regDeadline || startDateTime).toISOString(),
        maxParticipants: parseInt(maxParticipants) || 50,
        maxTeamSize: parseInt(maxTeamSize) || 0
      });
      setShowCreateModal(false);
      setStatusMessage({ 
        type: 'success', 
        text: `✨ Event "${eventName}" created successfully in Neo4j database! Status is 'Pending' for Admin review. Once the Dean/Admin approves it, it will automatically appear in the student Discover catalog.` 
      });
      // reload events
      await loadClubEvents(chosenClubId);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Could not create event.');
    } finally {
      setLoading(false);
    }
  };

  const isEventOngoingNow = () => {
    if (!selectedEvent || selectedEvent.status !== 'Approved') return false;
    const now = new Date();
    const start = new Date(selectedEvent.startDateTime);
    const end = selectedEvent.endDateTime ? new Date(selectedEvent.endDateTime) : null;
    return now >= start && (!end || now <= end);
  };

  const handleMarkAttendance = async (studentId) => {
    if (!studentId) return;
    if (user?.role === 'Admin') {
      alert('Administrators cannot mark attendance. Attendance must be taken by the event organizer during the ongoing phase.');
      return;
    }
    if (!isEventOngoingNow()) {
      alert('Attendance can ONLY be taken during the ongoing phase (between event start and end time).');
      return;
    }
    try {
      await api.markAttendance(selectedEventId, [studentId]);
      setStatusMessage({ type: 'success', text: `Attendance checked in for student ${studentId}!` });
      const res = await api.getEventRegistrations(selectedEventId);
      setRegistrations(res.registrations || []);
      setQuickStudentId('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUnmarkAttendance = async (studentId) => {
    if (!studentId) return;
    if (user?.role === 'Admin') {
      alert('Administrators cannot modify attendance.');
      return;
    }
    if (!isEventOngoingNow()) {
      alert('Attendance can ONLY be modified during the ongoing phase.');
      return;
    }
    try {
      await api.unmarkAttendance(selectedEventId, studentId);
      setStatusMessage({ type: 'info', text: `Attendance unmarked for student ${studentId}.` });
      const res = await api.getEventRegistrations(selectedEventId);
      setRegistrations(res.registrations || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleQuickCheckInSubmit = (e) => {
    e.preventDefault();
    if (!quickStudentId.trim()) return;
    if (user?.role === 'Admin') {
      alert('Administrators cannot mark attendance.');
      return;
    }
    if (!isEventOngoingNow()) {
      alert('Attendance check-in is ONLY permitted during the live ongoing phase.');
      return;
    }
    // Find matching student
    const match = registrations.find(r => 
      r.studentId?.toLowerCase() === quickStudentId.trim().toLowerCase() ||
      r.studentName?.toLowerCase().includes(quickStudentId.trim().toLowerCase())
    );
    if (!match) {
      alert(`No registered student found matching "${quickStudentId}".`);
      return;
    }
    if (match.attended) {
      alert(`${match.studentName} is already checked in!`);
      setQuickStudentId('');
      return;
    }
    handleMarkAttendance(match.studentId);
  };

  const handleMarkAllAttendance = async () => {
    if (user?.role === 'Admin') {
      alert('Administrators cannot mark attendance.');
      return;
    }
    if (!isEventOngoingNow()) {
      alert('Attendance can ONLY be taken during the ongoing phase (between event start and end time).');
      return;
    }
    const unAttendedIds = registrations.filter(r => r.status === 'Registered' && !r.attended).map(r => r.studentId);
    if (unAttendedIds.length === 0) {
      alert('All registered students are already marked present.');
      return;
    }
    if (!window.confirm(`Mark attendance for all ${unAttendedIds.length} remaining registered students?`)) {
      return;
    }
    try {
      await api.markAttendance(selectedEventId, unAttendedIds);
      setStatusMessage({ type: 'success', text: `Marked attendance for ${unAttendedIds.length} students!` });
      const res = await api.getEventRegistrations(selectedEventId);
      setRegistrations(res.registrations || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const openCertificateModal = () => {
    setShowCertificateModal(true);
    setSelectedAttendeeForUpload(null);
    setUploadFile(null);
    loadAttendeeCertificates();
  };

  const loadAttendeeCertificates = async () => {
    if (!selectedEventId) return;
    try {
      setLoadingCertAttendees(true);
      const res = await api.getEventAttendeesWithCertificates(selectedEventId);
      setAttendeeCertificates(res.attendees || []);
    } catch (err) {
      console.error('Error fetching attendees with certificates:', err);
      const fallback = registrations.filter(r => r.attended).map(r => ({
        studentId: r.studentId,
        studentName: r.studentName,
        email: r.email,
        department: r.department,
        attendedAt: r.attendedAt,
        wonPosition: r.wonPosition,
        wonPrize: r.wonPrize
      }));
      setAttendeeCertificates(fallback);
    } finally {
      setLoadingCertAttendees(false);
    }
  };

  const handleSelectAttendeeForUpload = (attendee) => {
    setSelectedAttendeeForUpload(attendee);
    setUploadFile(null);
    setUploadCertType(attendee.wonPosition ? 'Winner' : 'Participation');
  };

  const handleUploadCertificate = async (e) => {
    e.preventDefault();
    if (!selectedAttendeeForUpload) return;
    if (!uploadFile) {
      alert('Please choose a certificate file (.pdf, .png, .jpg) to upload.');
      return;
    }

    try {
      setUploadLoading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result;
          await api.uploadStudentCertificate(selectedEventId, selectedAttendeeForUpload.studentId, {
            fileData: base64Data,
            fileName: uploadFile.name,
            fileType: uploadFile.type,
            type: uploadCertType
          });
          setStatusMessage({
            type: 'success',
            text: `Certificate successfully issued and uploaded for ${selectedAttendeeForUpload.studentName}!`
          });
          setUploadFile(null);
          setSelectedAttendeeForUpload(null);
          await loadAttendeeCertificates();
        } catch (err) {
          alert(`Upload error: ${err.message}`);
        } finally {
          setUploadLoading(false);
        }
      };
      reader.onerror = () => {
        alert('Could not read file from disk.');
        setUploadLoading(false);
      };
      reader.readAsDataURL(uploadFile);
    } catch (err) {
      alert(err.message);
      setUploadLoading(false);
    }
  };

  const handleBatchIssueStandard = async () => {
    try {
      setUploadLoading(true);
      const res = await api.generateCertificates(selectedEventId);
      setStatusMessage({ type: 'success', text: `Generated standard verifiable certificates for ${res.count} attendees!` });
      await loadAttendeeCertificates();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeclareWinners = async (e) => {
    e.preventDefault();
    const winners = [];
    if (winner1) winners.push({ studentId: winner1, position: 1, prize: '$300 1st Prize' });
    if (winner2) winners.push({ studentId: winner2, position: 2, prize: '$200 2nd Prize' });
    if (winner3) winners.push({ studentId: winner3, position: 3, prize: '$100 3rd Prize' });

    if (winners.length === 0) {
      alert('Please select at least one winner.');
      return;
    }
    try {
      await api.declareWinners(selectedEventId, winners);
      setShowWinnerModal(false);
      setStatusMessage({ type: 'success', text: 'Winners declared and recorded in Neo4j!' });
      const res = await api.getEventRegistrations(selectedEventId);
      setRegistrations(res.registrations || []);
    } catch (err) {
      alert(err.message);
    }
  };

  // Turnout computations
  const registeredStudents = registrations.filter(r => r.status === 'Registered');
  const attendedCount = registeredStudents.filter(r => r.attended).length;
  const absentCount = registeredStudents.length - attendedCount;
  const turnoutPercent = registeredStudents.length > 0 ? Math.round((attendedCount / registeredStudents.length) * 100) : 0;

  // Filtered registrations
  const filteredRegistrations = registrations.filter(r => {
    const matchesSearch = 
      r.studentName?.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
      r.studentId?.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
      r.department?.toLowerCase().includes(attendanceSearch.toLowerCase());
    
    if (!matchesSearch) return false;
    if (attendanceFilter === 'Present') return r.attended;
    if (attendanceFilter === 'Absent') return !r.attended && r.status === 'Registered';
    return true;
  });

  // Filtered events
  const filteredEvents = events.filter(e => {
    if (eventStatusFilter === 'All') return true;
    return e.status === eventStatusFilter;
  });

  const pendingCount = events.filter(e => e.status === 'Pending').length;
  const approvedCount = events.filter(e => e.status === 'Approved').length;
  const completedCount = events.filter(e => e.status === 'Completed').length;

  return (
    <div style={{ maxWidth: 1360, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '2.1rem', display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '-0.02em', color: '#0f172a', fontWeight: 800 }}>
              <Users size={30} color="#ec4899" /> Club Organizer Studio
            </h1>
            <span className="badge badge-purple" style={{ fontSize: '0.8rem' }}>
              {user?.role === 'Admin' ? 'Campus Admin Access' : 'Authorized Club Organizer'}
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.96rem', marginTop: 4 }}>
            Issue events with full requirements, monitor Admin approval review, and manage live student check-ins & attendance.
          </p>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => setShowCreateModal(true)} 
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            padding: '12px 22px',
            fontSize: '0.95rem',
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(236, 72, 153, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Plus size={19} /> Issue New Event
        </button>
      </div>

      {/* Global Status Message */}
      {statusMessage && (
        <div style={{
          padding: '14px 20px',
          borderRadius: 14,
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1.5px solid rgba(16, 185, 129, 0.3)',
          color: '#065f46',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.92rem',
          fontWeight: 600
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={18} color="#059669" />
            <span>{statusMessage.text}</span>
          </div>
          <button 
            onClick={() => setStatusMessage(null)}
            style={{ background: 'transparent', color: '#065f46', cursor: 'pointer', border: 'none', padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Club Context Bar & Overview Counters */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255, 255, 255, 0.95)',
        borderRadius: 22,
        padding: 24,
        marginBottom: 32,
        boxShadow: '0 16px 36px -8px rgba(100, 116, 139, 0.12), inset 0 1px 2px #ffffff'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
          borderBottom: '1.5px solid rgba(226, 232, 240, 0.8)',
          paddingBottom: 20,
          marginBottom: 20
        }}>
          <div style={{ minWidth: 320, flex: 1 }}>
            <label style={{ fontSize: '0.8rem', color: '#475569', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              🏛️ Active Club Organization
            </label>
            <select 
              value={selectedClubId} 
              onChange={(e) => {
                setSelectedClubId(e.target.value);
                setCreateClubId(e.target.value);
              }}
              style={{ width: '100%', fontSize: '0.95rem', padding: '10px 14px' }}
            >
              {clubs.map(c => (
                <option key={c.clubId} value={c.clubId}>
                  {c.name} {user?.presidentClubs?.includes(c.clubId) ? '👑 (You are President)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(241, 245, 249, 0.85)',
              border: '1.5px solid rgba(226, 232, 240, 0.9)',
              padding: '10px 20px',
              borderRadius: 14,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>TOTAL EVENTS</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>{events.length}</div>
            </div>

            <div style={{
              background: 'rgba(254, 243, 199, 0.7)',
              border: '1.5px solid rgba(245, 158, 11, 0.3)',
              padding: '10px 20px',
              borderRadius: 14,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.74rem', color: '#b45309', fontWeight: 700 }}>⏳ PENDING ADMIN</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#b45309' }}>{pendingCount}</div>
            </div>

            <div style={{
              background: 'rgba(209, 250, 229, 0.7)',
              border: '1.5px solid rgba(16, 185, 129, 0.3)',
              padding: '10px 20px',
              borderRadius: 14,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700 }}>🟢 APPROVED & LIVE</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#047857' }}>{approvedCount}</div>
            </div>

            <div style={{
              background: 'rgba(243, 232, 255, 0.7)',
              border: '1.5px solid rgba(168, 85, 247, 0.3)',
              padding: '10px 20px',
              borderRadius: 14,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.74rem', color: '#7e22ce', fontWeight: 700 }}>🏁 COMPLETED</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#7e22ce' }}>{completedCount}</div>
            </div>
          </div>
        </div>

        {/* Club Events Filter Tabs */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 700 }}>
              Select Club Event to Manage:
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {['All', 'Pending', 'Approved', 'Completed'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setEventStatusFilter(tab)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 16,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: eventStatusFilter === tab ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.85)',
                    border: `1.5px solid ${eventStatusFilter === tab ? 'rgba(99, 102, 241, 0.4)' : 'rgba(226, 232, 240, 0.9)'}`,
                    color: eventStatusFilter === tab ? '#4f46e5' : '#64748b',
                    cursor: 'pointer',
                    boxShadow: eventStatusFilter === tab ? '0 2px 8px rgba(99, 102, 241, 0.15)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab === 'Pending' ? `⏳ Pending (${pendingCount})` : tab === 'Approved' ? `🟢 Approved (${approvedCount})` : tab === 'Completed' ? `🏁 Completed (${completedCount})` : `All (${events.length})`}
                </button>
              ))}
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: '0.92rem' }}>
              No events found with status "{eventStatusFilter}" for this club.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 12
            }}>
              {filteredEvents.map(e => {
                const isSelected = e.eventId === selectedEventId;
                return (
                  <div
                    key={e.eventId}
                    onClick={() => {
                      setSelectedEventId(e.eventId);
                      setSelectedEvent(e);
                    }}
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      background: isSelected 
                        ? 'linear-gradient(135deg, rgba(238, 242, 255, 0.96) 0%, rgba(253, 242, 248, 0.96) 100%)' 
                        : 'rgba(255, 255, 255, 0.75)',
                      border: isSelected 
                        ? '2px solid #6366f1' 
                        : '1.5px solid rgba(226, 232, 240, 0.85)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected 
                        ? '0 10px 24px -4px rgba(99, 102, 241, 0.25), inset 0 1px 1px #fff' 
                        : '0 2px 6px rgba(100, 116, 139, 0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>{e.type}</span>
                      <span className={`badge ${e.status === 'Approved' ? 'badge-success' : e.status === 'Completed' ? 'badge-purple' : 'badge-warning'}`} style={{ fontSize: '0.72rem' }}>
                        {e.status === 'Pending' ? '⏳ Pending Approval' : e.status}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0f172a', marginBottom: 6 }}>
                      {e.name}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <MapPin size={13} color="#4f46e5" /> {e.venue}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} color="#0284c7" /> {new Date(e.startDateTime).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected Event Context Card & Attendance Studio */}
      {selectedEvent ? (
        <div>
          {/* If Event is Pending Admin Review */}
          {selectedEvent.status === 'Pending' ? (
            <div style={{
              background: 'rgba(254, 243, 199, 0.65)',
              border: '1.5px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 22,
              padding: 32,
              marginBottom: 32,
              boxShadow: '0 12px 30px rgba(245, 158, 11, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <Clock size={32} color="#d97706" style={{ flexShrink: 0, marginTop: 4 }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <h2 style={{ fontSize: '1.4rem', color: '#92400e', fontWeight: 800 }}>
                      Event Issued: "{selectedEvent.name}" is Awaiting Admin Approval
                    </h2>
                    <span className="badge badge-warning">Status: Pending Review</span>
                  </div>

                  <p style={{ color: '#78350f', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: 20 }}>
                    This event has been issued by your club and submitted to the <strong>Campus Administrator (Dean of Student Affairs)</strong>. 
                    Per campus policy, events undergo venue clash and charter verification before they are released. 
                    <strong> Once the Admin approves this event, it will automatically appear in the student discovery catalog and registrations & attendance tracking will activate!</strong>
                  </p>

                  {/* Summary of what organizer filled in */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.92)',
                    borderRadius: 16,
                    padding: 22,
                    border: '1.5px solid rgba(245, 158, 11, 0.25)',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.06)'
                  }}>
                    <h4 style={{ fontSize: '0.9rem', color: '#b45309', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 800 }}>
                      Submitted Event Details & Requirements:
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, fontSize: '0.88rem', color: '#334155', marginBottom: 16 }}>
                      <div>Venue: <strong style={{ color: '#0f172a' }}>{selectedEvent.venue}</strong></div>
                      <div>Type: <strong style={{ color: '#0f172a' }}>{selectedEvent.type}</strong></div>
                      <div>Date & Time: <strong style={{ color: '#0f172a' }}>{new Date(selectedEvent.startDateTime).toLocaleString()}</strong></div>
                      <div>Registration Deadline: <strong style={{ color: '#0f172a' }}>{new Date(selectedEvent.registrationDeadline).toLocaleString()}</strong></div>
                      <div>Max Participants: <strong style={{ color: '#0f172a' }}>{selectedEvent.maxParticipants} Seats</strong></div>
                      <div>Team Size: <strong style={{ color: '#0f172a' }}>{selectedEvent.maxTeamSize > 0 ? `Team of ${selectedEvent.maxTeamSize}` : 'Solo / Individual'}</strong></div>
                    </div>

                    {selectedEvent.requirements && (
                      <div style={{
                        padding: '14px 16px',
                        borderRadius: 12,
                        background: 'rgba(248, 250, 252, 0.9)',
                        border: '1px solid rgba(226, 232, 240, 0.9)',
                        fontSize: '0.88rem'
                      }}>
                        <div style={{ color: '#4f46e5', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FileText size={15} /> Requirements & Eligibility filled by Organizer:
                        </div>
                        <div style={{ color: '#1e293b', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                          {selectedEvent.requirements}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Event is Approved or Completed: Full Live Attendance & Control Studio */
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1.5px solid rgba(255, 255, 255, 0.95)',
              borderRadius: 22,
              padding: 28,
              boxShadow: '0 16px 40px -8px rgba(100, 116, 139, 0.12), inset 0 1px 2px #ffffff',
              backdropFilter: 'blur(20px)'
            }}>
              {/* Event Header & Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 20,
                borderBottom: '1.5px solid rgba(226, 232, 240, 0.8)',
                paddingBottom: 22,
                marginBottom: 24
              }}>
                <div style={{ flex: 1, minWidth: 320 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.65rem', color: '#0f172a', fontWeight: 800 }}>{selectedEvent.name}</h2>
                    <span className={`badge ${selectedEvent.status === 'Approved' ? 'badge-success' : selectedEvent.status === 'Completed' ? 'badge-purple' : 'badge-warning'}`}>
                      {selectedEvent.status === 'Approved' ? '🟢 Live & Open' : selectedEvent.status === 'Completed' ? '🏁 Completed' : selectedEvent.status}
                    </span>
                    <span className="badge badge-info">{selectedEvent.type}</span>
                    <span className="badge badge-purple">{selectedEvent.clubName}</span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 10,
                    fontSize: '0.86rem',
                    color: '#334155',
                    background: 'rgba(241, 245, 249, 0.7)',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: '1px solid rgba(226, 232, 240, 0.9)',
                    marginBottom: 12
                  }}>
                    <div>
                      📍 <strong>Venue:</strong> {selectedEvent.venue}
                    </div>
                    <div>
                      📅 <strong>Event Starts:</strong> {new Date(selectedEvent.startDateTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(selectedEvent.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div>
                      🏁 <strong>Event Ends:</strong> {selectedEvent.endDateTime ? `${new Date(selectedEvent.endDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${new Date(selectedEvent.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'TBA'}
                    </div>
                    <div>
                      ⏰ <strong>Reg Deadline:</strong> {new Date(selectedEvent.registrationDeadline || selectedEvent.startDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(selectedEvent.registrationDeadline || selectedEvent.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Timing & Manual Attendance Status Banner */}
                  {(() => {
                    const now = new Date();
                    const eventStart = new Date(selectedEvent.startDateTime);
                    const eventEnd = selectedEvent.endDateTime ? new Date(selectedEvent.endDateTime) : null;
                    const isStarted = now >= eventStart;
                    const isEnded = selectedEvent.status === 'Completed' || (eventEnd && now >= eventEnd);
                    const isOngoing = selectedEvent.status === 'Approved' && isStarted && !isEnded;

                    if (selectedEvent.status === 'Completed' || isEnded) {
                      return (
                        <div style={{
                          padding: '12px 16px',
                          borderRadius: 12,
                          background: 'rgba(147, 51, 234, 0.1)',
                          border: '1.5px solid rgba(147, 51, 234, 0.35)',
                          color: '#6b21a8',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          marginBottom: 14,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10
                        }}>
                          <CheckCircle size={19} color="#9333ea" style={{ flexShrink: 0 }} />
                          <div>
                            <strong>🏁 Event Concluded (Completed Automatically)</strong>
                            <div style={{ fontSize: '0.82rem', color: '#7e22ce', marginTop: 2 }}>
                              The event deadline has occurred and the event concluded automatically. You can decide winners and issue certificates below at any time. Attendance check-in is closed.
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (selectedEvent.status === 'Approved' && !isStarted) {
                      return (
                        <div style={{
                          padding: '12px 16px',
                          borderRadius: 12,
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1.5px solid rgba(59, 130, 246, 0.35)',
                          color: '#1d4ed8',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          marginBottom: 14,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10
                        }}>
                          <Clock size={19} color="#2563eb" style={{ flexShrink: 0 }} />
                          <div>
                            <strong>⏳ Upcoming Event (Registration Phase)</strong>
                            <div style={{ fontSize: '0.82rem', color: '#1e40af', marginTop: 2 }}>
                              Event starts on <strong>{eventStart.toLocaleString()}</strong>. Attendance check-in is <strong>LOCKED</strong>. Per campus rules, organizers can ONLY take attendance while the event is actively ongoing.
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (isOngoing) {
                      return (
                        <div style={{
                          padding: '12px 16px',
                          borderRadius: 12,
                          background: 'rgba(16, 185, 129, 0.12)',
                          border: '1.5px solid rgba(16, 185, 129, 0.4)',
                          color: '#065f46',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          marginBottom: 14,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10
                        }}>
                          <Sparkles size={19} color="#059669" style={{ flexShrink: 0 }} />
                          <div>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }}></span>
                              <strong>LIVE ONGOING PHASE</strong>
                            </span>
                            <div style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 500, marginTop: 2 }}>
                              Event is actively in progress! You can now mark registered students present manually or using Quick Check-In below. Attendance closes at {eventEnd ? eventEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'event completion'}.
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })()}

                  {selectedEvent.requirements && (
                    <div style={{ marginTop: 6, fontSize: '0.84rem', color: '#4338ca', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '7px 14px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={15} color="#4f46e5" />
                      <span><strong>Requirements:</strong> {selectedEvent.requirements}</span>
                    </div>
                  )}
                </div>

                {/* Organizer Operation Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {(() => {
                    const isOngoing = isEventOngoingNow();
                    const canMark = isOngoing && user?.role !== 'Admin';
                    return (
                      <button 
                        className="btn btn-secondary" 
                        onClick={handleMarkAllAttendance}
                        disabled={!canMark}
                        style={{
                          opacity: canMark ? 1 : 0.5,
                          cursor: canMark ? 'pointer' : 'not-allowed'
                        }}
                        title={!canMark ? (user?.role === 'Admin' ? 'Admins cannot mark attendance' : 'Attendance can ONLY be taken during the ongoing phase') : 'Mark all remaining students present'}
                      >
                        <CheckSquare size={16} /> Mark All Present
                      </button>
                    );
                  })()}
                  <button className="btn btn-secondary" onClick={() => setShowWinnerModal(true)}>
                    <Award size={16} /> Declare Winners
                  </button>
                  <button className="btn btn-primary" onClick={openCertificateModal} style={{ background: '#10b981' }}>
                    <Award size={16} /> Issue Certificates
                  </button>
                </div>
              </div>

              {/* Attendance Turnout KPI Metrics Bar */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                marginBottom: 28
              }}>
                <div className="glass-panel" style={{ padding: 18 }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Registered</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                    {registeredStudents.length} / {selectedEvent.maxParticipants}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#0284c7', marginTop: 4, fontWeight: 600 }}>
                    {selectedEvent.maxParticipants - registeredStudents.length} Seats Left
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: 18 }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Checked In (Present)</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: 4 }}>
                    {attendedCount}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: 4, fontWeight: 600 }}>
                    Verified Attendees
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: 18 }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Absent / Pending</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626', marginTop: 4 }}>
                    {absentCount}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                    Awaiting Check-in
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: 18 }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Turnout Percentage</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4f46e5', marginTop: 4 }}>
                    {turnoutPercent}%
                  </div>
                  <div style={{ width: '100%', height: 7, borderRadius: 4, background: 'rgba(226, 232, 240, 0.9)', marginTop: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${turnoutPercent}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #6366f1)', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              </div>

              {/* Fast Check-In Tool & Live Search */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                marginBottom: 20
              }}>
                {/* Quick Student ID Check-In */}
                {(() => {
                  const isOngoing = isEventOngoingNow();
                  const canMark = isOngoing && user?.role !== 'Admin';
                  return (
                    <form onSubmit={handleQuickCheckInSubmit} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 320, maxWidth: 500 }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input 
                          type="text" 
                          placeholder={!canMark ? (user?.role === 'Admin' ? "Attendance read-only for Administrators" : "Check-in locked (available only during ongoing phase)...") : "Fast Check-In: Enter Student ID (e.g. stud-001) or Name..."} 
                          value={quickStudentId}
                          onChange={(e) => setQuickStudentId(e.target.value)}
                          disabled={!canMark}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: '0.88rem', opacity: canMark ? 1 : 0.6 }}
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={!canMark}
                        style={{ padding: '10px 18px', fontSize: '0.88rem', background: '#10b981', opacity: canMark ? 1 : 0.5, cursor: canMark ? 'pointer' : 'not-allowed' }}
                      >
                        <Check size={16} /> Check In
                      </button>
                    </form>
                  );
                })()}

                {/* Table Filter Pills & Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input 
                      type="text"
                      placeholder="Filter student list..."
                      value={attendanceSearch}
                      onChange={(e) => setAttendanceSearch(e.target.value)}
                      style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 10, fontSize: '0.84rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    {['All', 'Present', 'Absent'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setAttendanceFilter(tab)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 12,
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          background: attendanceFilter === tab ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.85)',
                          border: `1.5px solid ${attendanceFilter === tab ? 'rgba(99, 102, 241, 0.4)' : 'rgba(226, 232, 240, 0.9)'}`,
                          color: attendanceFilter === tab ? '#4f46e5' : '#64748b',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {tab === 'Present' ? `Present (${attendedCount})` : tab === 'Absent' ? `Absent (${absentCount})` : `All (${registrations.length})`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Attendance Table */}
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>Loading registrations & attendance...</div>
              ) : filteredRegistrations.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>
                  No students found matching your attendance filter.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid rgba(226, 232, 240, 0.9)', color: '#64748b' }}>
                        <th style={{ padding: '12px 14px' }}>Student</th>
                        <th style={{ padding: '12px 14px' }}>Department</th>
                        <th style={{ padding: '12px 14px' }}>Status</th>
                        <th style={{ padding: '12px 14px' }}>Team</th>
                        <th style={{ padding: '12px 14px' }}>Attendance Status</th>
                        <th style={{ padding: '12px 14px' }}>Distinction</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.map(r => {
                        const isOngoing = isEventOngoingNow();
                        const canMark = isOngoing && user?.role !== 'Admin';

                        return (
                          <tr key={r.studentId} style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.7)' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>
                              {r.studentName}
                              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 400 }}>{r.studentId} • {r.email}</div>
                            </td>
                            <td style={{ padding: '12px 14px', color: '#475569' }}>{r.department} (Yr {r.year})</td>
                            <td style={{ padding: '12px 14px' }}>
                              <span className={`badge ${r.status === 'Registered' ? 'badge-success' : 'badge-warning'}`}>
                                {r.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', color: '#7e22ce', fontWeight: 600 }}>{r.teamName || '—'}</td>
                            <td style={{ padding: '12px 14px' }}>
                              {r.attended ? (
                                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <CheckCircle size={12} /> Present {r.attendedAt ? `(${new Date(r.attendedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}
                                </span>
                              ) : (
                                <span className="badge" style={{ background: 'rgba(100, 116, 139, 0.12)', color: '#64748b', fontSize: '0.78rem' }}>
                                  Awaiting Check-In
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              {r.wonPosition ? (
                                <span className="badge badge-warning">#{r.wonPosition} ({r.wonPrize})</span>
                              ) : '—'}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                              {canMark ? (
                                !r.attended && r.status === 'Registered' ? (
                                  <button 
                                    className="btn btn-secondary"
                                    style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#10b981', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                    onClick={() => handleMarkAttendance(r.studentId)}
                                  >
                                    <Check size={14} /> Mark Present
                                  </button>
                                ) : r.attended ? (
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ color: '#059669', fontSize: '0.82rem', fontWeight: 700 }}>Present ✓</span>
                                    {selectedEvent.status !== 'Completed' && (
                                      <button
                                        onClick={() => handleUnmarkAttendance(r.studentId)}
                                        style={{
                                          background: 'rgba(239, 68, 68, 0.08)',
                                          border: '1px solid rgba(239, 68, 68, 0.3)',
                                          color: '#dc2626',
                                          borderRadius: 6,
                                          padding: '3px 8px',
                                          fontSize: '0.72rem',
                                          cursor: 'pointer',
                                          fontWeight: 600
                                        }}
                                        title="Unmark attendance (set Absent)"
                                      >
                                        Mark Absent
                                      </button>
                                    )}
                                  </div>
                                ) : null
                              ) : (
                                r.attended ? (
                                  <span style={{ color: '#059669', fontSize: '0.82rem', fontWeight: 700 }}>Present ✓</span>
                                ) : (
                                  <span style={{ color: '#94a3b8', fontSize: '0.78rem', background: 'rgba(148, 163, 184, 0.12)', padding: '4px 8px', borderRadius: 6 }}>
                                    Check-in Locked
                                  </span>
                                )
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Modal: Create Event */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 660, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 4, color: '#0f172a', fontWeight: 800 }}>Issue New Club Event</h2>
                <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
                  Fill in event specifications and requirements. This request will be submitted to the Admin for approval.
                </p>
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', color: '#64748b', cursor: 'pointer', border: 'none' }}>
                <X size={20} />
              </button>
            </div>

            {venueClashWarning && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 12,
                background: 'rgba(254, 243, 199, 0.8)',
                border: '1.5px solid rgba(245, 158, 11, 0.4)',
                color: '#92400e',
                fontSize: '0.88rem',
                fontWeight: 600,
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0 }} />
                <span>{venueClashWarning}</span>
              </div>
            )}

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Organizing Club</label>
                <select 
                  value={createClubId} 
                  onChange={(e) => setCreateClubId(e.target.value)} 
                  style={{ width: '100%' }}
                  required
                >
                  {clubs.map(c => (
                    <option key={c.clubId} value={c.clubId}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Event Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Next-Gen Robotics Sprint & Hack" 
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Event Type</label>
                  <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={{ width: '100%' }}>
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Tech Talk">Tech Talk</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Venue</label>
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
                <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Detailed Description</label>
                <textarea 
                  rows={2} 
                  placeholder="Provide an overview of event highlights, itinerary, and speakers..."
                  value={eventDesc} 
                  onChange={(e) => setEventDesc(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  📋 Event Requirements & Prerequisites
                </label>
                <textarea 
                  rows={3} 
                  placeholder="e.g. Bring your own laptop with Node.js and Git installed; Open to 2nd-4th year CS/IT students; College ID card required at entry..."
                  value={eventRequirements} 
                  onChange={(e) => setEventRequirements(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Start Date-Time</label>
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
                  <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>End Date-Time</label>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Registration Deadline</label>
                  <input 
                    type="datetime-local" 
                    value={regDeadline}
                    onChange={(e) => setRegDeadline(e.target.value)}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Max Seats (Capacity)</label>
                  <input 
                    type="number" 
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: 6 }}>Team Size (0 = Solo)</label>
                  <input 
                    type="number" 
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(e.target.value)}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }} 
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Event Request to Admin'}
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, padding: 30 }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Declare Event Winners</h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 18 }}>
              Award official distinctions. Winners can be decided anytime during or after the event from verified attendees.
            </p>

            {registrations.filter(r => r.attended).length === 0 ? (
              <div style={{ padding: 14, background: 'rgba(239, 68, 68, 0.08)', borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.25)', color: '#b91c1c', fontSize: '0.86rem', marginBottom: 16 }}>
                ⚠️ No verified attendees found yet. Winners can be awarded to any student who attended the event.
              </div>
            ) : null}

            <form onSubmit={handleDeclareWinners} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                  🥇 1st Place Winner ($300 Prize)
                </label>
                <select value={winner1} onChange={(e) => setWinner1(e.target.value)} style={{ width: '100%' }}>
                  <option value="">Select verified attendee...</option>
                  {registrations.filter(r => r.attended).map(r => (
                    <option key={r.studentId} value={r.studentId}>{r.studentName} ({r.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                  🥈 2nd Place Winner ($200 Prize)
                </label>
                <select value={winner2} onChange={(e) => setWinner2(e.target.value)} style={{ width: '100%' }}>
                  <option value="">Select verified attendee...</option>
                  {registrations.filter(r => r.attended).map(r => (
                    <option key={r.studentId} value={r.studentId}>{r.studentName} ({r.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                  🥉 3rd Place Winner ($100 Prize)
                </label>
                <select value={winner3} onChange={(e) => setWinner3(e.target.value)} style={{ width: '100%' }}>
                  <option value="">Select verified attendee...</option>
                  {registrations.filter(r => r.attended).map(r => (
                    <option key={r.studentId} value={r.studentId}>{r.studentName} ({r.department})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save & Award Winners</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowWinnerModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Issue Certificates (Attendees List & File Upload) */}
      {showCertificateModal && (
        <div className="modal-overlay" onClick={() => setShowCertificateModal(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: 860, width: '92%', maxHeight: '88vh', overflowY: 'auto', padding: 32 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.45rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={24} color="#d97706" /> Issue Certificates to Event Attendees
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: 4 }}>
                  Below are the students who attended <strong>"{selectedEvent?.name}"</strong>. Click on any student's name to attach their certificate file.
                </p>
              </div>
              <button 
                onClick={() => setShowCertificateModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Active Upload Panel for Selected Student */}
            {selectedAttendeeForUpload && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.95), rgba(245, 243, 255, 0.95))',
                border: '1.5px solid rgba(99, 102, 241, 0.4)',
                borderRadius: 16,
                padding: 24,
                marginBottom: 24,
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.12)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#4f46e5', fontWeight: 800, letterSpacing: '0.04em' }}>
                      Attaching Certificate File
                    </span>
                    <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, marginTop: 2 }}>
                      {selectedAttendeeForUpload.studentName}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      ID: {selectedAttendeeForUpload.studentId} • {selectedAttendeeForUpload.email} • {selectedAttendeeForUpload.department}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setSelectedAttendeeForUpload(null)}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleUploadCertificate}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                        Certificate Category
                      </label>
                      <select 
                        value={uploadCertType} 
                        onChange={(e) => setUploadCertType(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: '0.88rem' }}
                      >
                        <option value="Participation">Participation Certificate</option>
                        <option value="Winner">Winner Certificate (Excellence)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                        Select Certificate File (PDF / Image)
                      </label>
                      <input 
                        type="file" 
                        accept=".pdf,image/png,image/jpeg,image/webp" 
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        style={{ width: '100%', padding: '8px', fontSize: '0.84rem', background: '#fff', borderRadius: 10, border: '1.5px dashed rgba(99, 102, 241, 0.4)' }}
                        required
                      />
                    </div>
                  </div>

                  {uploadFile && (
                    <div style={{
                      padding: '10px 14px',
                      background: '#fff',
                      borderRadius: 10,
                      border: '1px solid rgba(226, 232, 240, 0.9)',
                      marginBottom: 16,
                      fontSize: '0.84rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      color: '#0f172a'
                    }}>
                      <File size={16} color="#4f46e5" />
                      <span><strong>{uploadFile.name}</strong> ({(uploadFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={uploadLoading || !uploadFile}
                      style={{ padding: '10px 20px', fontSize: '0.88rem', background: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Upload size={16} /> {uploadLoading ? 'Uploading Certificate...' : 'Upload & Issue Certificate'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setSelectedAttendeeForUpload(null)}
                      style={{ padding: '10px 16px', fontSize: '0.88rem' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Attendees List Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="text"
                  placeholder="Filter attendees by name or ID..."
                  value={certSearchQuery}
                  onChange={(e) => setCertSearchQuery(e.target.value)}
                  style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 10, fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={loadAttendeeCertificates}
                  style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                  title="Reload attendees list"
                >
                  <RefreshCw size={14} /> Refresh
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleBatchIssueStandard}
                  disabled={uploadLoading}
                  style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                  title="Auto-generates standard PDF certificates for all attendees"
                >
                  ⚡ Auto-Generate All Standard
                </button>
              </div>
            </div>

            {/* Attendees Table */}
            {loadingCertAttendees ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading verified attendees...</div>
            ) : attendeeCertificates.length === 0 ? (
              <div style={{
                padding: 40,
                textAlign: 'center',
                background: 'rgba(248, 250, 252, 0.8)',
                borderRadius: 14,
                border: '1px solid rgba(226, 232, 240, 0.9)'
              }}>
                <Award size={36} style={{ margin: '0 auto 10px', color: '#94a3b8' }} />
                <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>No Checked-In Attendees Yet</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>
                  Certificates can only be issued to students marked <strong>Present</strong> during the event.
                </p>
              </div>
            ) : (
              <div style={{ border: '1px solid rgba(226, 232, 240, 0.9)', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(248, 250, 252, 0.9)', borderBottom: '1.5px solid rgba(226, 232, 240, 0.9)', color: '#64748b' }}>
                      <th style={{ padding: '12px 14px' }}>Participant Name (Click to Add File)</th>
                      <th style={{ padding: '12px 14px' }}>Department</th>
                      <th style={{ padding: '12px 14px' }}>Attended At</th>
                      <th style={{ padding: '12px 14px' }}>Distinction</th>
                      <th style={{ padding: '12px 14px' }}>Certificate Status</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendeeCertificates
                      .filter(a => {
                        if (!certSearchQuery.trim()) return true;
                        const q = certSearchQuery.toLowerCase();
                        return (
                          a.studentName?.toLowerCase().includes(q) ||
                          a.studentId?.toLowerCase().includes(q) ||
                          a.email?.toLowerCase().includes(q)
                        );
                      })
                      .map(a => {
                        const hasCert = !!a.certificateId;
                        const hasCustom = a.hasCustomFile;

                        return (
                          <tr 
                            key={a.studentId}
                            style={{ 
                              borderBottom: '1px solid rgba(226, 232, 240, 0.7)',
                              background: selectedAttendeeForUpload?.studentId === a.studentId ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                              transition: 'background 0.15s ease'
                            }}
                          >
                            <td 
                              style={{ padding: '12px 14px', cursor: 'pointer' }}
                              onClick={() => handleSelectAttendeeForUpload(a)}
                              title="Click to add/replace certificate file for this student"
                            >
                              <div style={{ fontWeight: 700, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>{a.studentName}</span>
                                <Upload size={13} color="#6366f1" />
                              </div>
                              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{a.studentId} • {a.email}</div>
                            </td>
                            <td style={{ padding: '12px 14px', color: '#475569' }}>
                              {a.department} {a.year ? `(Yr ${a.year})` : ''}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#059669', fontSize: '0.82rem', fontWeight: 600 }}>
                              {a.attendedAt ? new Date(a.attendedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Present'}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              {a.wonPosition ? (
                                <span className="badge badge-warning" style={{ fontSize: '0.74rem' }}>
                                  #{a.wonPosition} ({a.wonPrize})
                                </span>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Participant</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              {hasCustom ? (
                                <div>
                                  <span className="badge badge-success" style={{ fontSize: '0.74rem' }}>
                                    ✓ Custom File Attached
                                  </span>
                                  {a.fileName && (
                                    <div style={{ fontSize: '0.72rem', color: '#4338ca', marginTop: 3 }}>
                                      {a.fileName}
                                    </div>
                                  )}
                                </div>
                              ) : hasCert ? (
                                <span className="badge badge-info" style={{ fontSize: '0.74rem' }}>
                                  ✓ Standard Issued
                                </span>
                              ) : (
                                <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                                  ⏳ Not Issued Yet
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                                {hasCert && a.fileUrl && (
                                  <a 
                                    href={a.fileUrl.startsWith('http') ? a.fileUrl : `http://localhost:5000${a.fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-secondary"
                                    style={{ padding: '5px 10px', fontSize: '0.75rem', gap: 4 }}
                                    title="View uploaded certificate file"
                                  >
                                    View <ExternalLink size={12} />
                                  </a>
                                )}
                                <button 
                                  type="button"
                                  onClick={() => handleSelectAttendeeForUpload(a)}
                                  className="btn btn-primary"
                                  style={{ padding: '5px 12px', fontSize: '0.75rem', gap: 4, background: hasCustom ? '#4f46e5' : '#10b981' }}
                                >
                                  <Upload size={12} /> {hasCustom ? 'Replace File' : 'Add File'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
