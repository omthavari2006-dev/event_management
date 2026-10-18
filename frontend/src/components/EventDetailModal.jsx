import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, MapPin, Users, Clock, AlertTriangle, 
  CheckCircle, ShieldAlert, Star, MessageSquare, Plus, UserPlus 
} from 'lucide-react';
import { api } from '../api/client';
import confetti from 'canvas-confetti';

export default function EventDetailModal({ 
  eventId, 
  user, 
  onClose, 
  onRefresh, 
  onViewTicket 
}) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [friendsGoing, setFriendsGoing] = useState([]);
  const [teams, setTeams] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // New team form state
  const [newTeamName, setNewTeamName] = useState('');
  const [showTeamForm, setShowTeamForm] = useState(false);

  // Add member to team form state
  const [memberStudentId, setMemberStudentId] = useState('');
  const [teammateSuggestions, setTeammateSuggestions] = useState([]);

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getEvent(eventId);
      setEvent(res.event);

      // Load teams if team event
      if (res.event.maxTeamSize > 0) {
        const teamRes = await api.getTeams(eventId);
        setTeams(teamRes.teams || []);
      }

      // Load feedback
      const fbRes = await api.getFeedback(eventId);
      setFeedbacks(fbRes.feedback || []);

      // If student is logged in, load graph-based friends going and teammate suggestions
      if (user && user.role === 'Student') {
        try {
          const friendsRes = await api.getFriendsGoing(eventId);
          setFriendsGoing(friendsRes.friends || []);

          if (res.event.maxTeamSize > 0) {
            const suggRes = await api.getTeammateSuggestions(eventId);
            setTeammateSuggestions(suggRes.suggestions || []);
          }
        } catch (e) {
          // ignore graph suggestions if unavailable
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadData();
    }
  }, [eventId, user]);

  const handleRegister = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setMessage(null);
      const res = await api.registerForEvent(eventId);
      setMessage({
        type: res.status === 'Registered' ? 'success' : 'warning',
        text: res.status === 'Registered' 
          ? 'Seat successfully confirmed! View your pass in My Registrations.' 
          : 'Event is full! You have been added to the waitlist.'
      });
      if (res.warning) {
        setError(res.warning);
      }
      if (res.status === 'Registered') {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      }
      await loadData();
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration? If waitlisted peers exist, one will be auto-promoted.')) {
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      const res = await api.cancelRegistration(eventId);
      let msg = 'Registration cancelled.';
      if (res.promotedStudent) {
        msg += ` Peer "${res.promotedStudent.promotedStudentName}" was auto-promoted from the waitlist!`;
      }
      setMessage({ type: 'info', text: msg });
      await loadData();
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    try {
      setActionLoading(true);
      await api.createTeam(eventId, newTeamName.trim());
      setNewTeamName('');
      setShowTeamForm(false);
      setMessage({ type: 'success', text: 'Team created successfully! You are the leader.' });
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async (teamId) => {
    if (!memberStudentId.trim()) return;
    try {
      setActionLoading(true);
      await api.addTeamMember(teamId, memberStudentId.trim());
      setMemberStudentId('');
      setMessage({ type: 'success', text: 'Member added to team!' });
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.submitFeedback(eventId, feedbackRating, feedbackComment);
      setMessage({ type: 'success', text: 'Thank you for your feedback!' });
      setFeedbackComment('');
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!eventId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 760 }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
            Loading event graph data...
          </div>
        ) : event ? (
          <div>
            {/* Modal Header Banner */}
            <div style={{
              padding: '28px 32px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              position: 'relative'
            }}>
              <button 
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <span className="badge badge-info">{event.type}</span>
                <span className={`badge ${event.status === 'Approved' ? 'badge-success' : event.status === 'Completed' ? 'badge-purple' : 'badge-warning'}`}>
                  {event.status}
                </span>
                <span className="badge badge-purple">{event.clubName}</span>
              </div>

              <h2 style={{ fontSize: '1.75rem', marginBottom: 8, lineHeight: 1.25 }}>{event.name}</h2>
              <div style={{ fontSize: '0.92rem', color: '#cbd5e1' }}>{event.description}</div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 32px' }}>
              {/* Alert Feedback Messages */}
              {message && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  marginBottom: 16,
                  background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                  border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <CheckCircle size={18} color="#34d399" />
                  <span>{message.text}</span>
                </div>
              )}

              {error && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  marginBottom: 16,
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <ShieldAlert size={18} color="#f87171" />
                  <span>{error}</span>
                </div>
              )}

              {/* Event Metadata Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                background: 'rgba(255, 255, 255, 0.03)',
                padding: 16,
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.06)',
                marginBottom: 24
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MapPin size={18} color="#818cf8" />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Venue</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{event.venue}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Calendar size={18} color="#38bdf8" />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Date & Time</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                      {new Date(event.startDateTime).toLocaleDateString()} at {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Clock size={18} color="#f59e0b" />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Deadline</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                      {new Date(event.registrationDeadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Users size={18} color="#34d399" />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Capacity & Teams</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                      {event.registeredCount} / {event.maxParticipants} Seats ({event.maxTeamSize > 0 ? `Team of ${event.maxTeamSize}` : 'Solo'})
                    </div>
                  </div>
                </div>
              </div>

              {/* Graph Intelligence: Friends Going Banner */}
              {friendsGoing.length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  padding: '12px 16px',
                  borderRadius: 12,
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', marginLeft: 8 }}>
                    {friendsGoing.map((f, i) => (
                      <div key={i} style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: '#6366f1',
                        border: '2px solid #0f172a',
                        marginLeft: -8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }} title={`${f.name} (${f.department})`}>
                        {f.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong style={{ color: '#c084fc' }}>Friends Going (Graph Traversal):</strong>{' '}
                    {friendsGoing.map(f => f.name).join(', ')} from your past shared events are registered!
                  </div>
                </div>
              )}

              {/* Registration Action Zone */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                padding: 20,
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Registration Status</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    {event.userRegistrationStatus ? (
                      <span className={`badge ${event.userRegistrationStatus === 'Registered' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                        {event.userRegistrationStatus === 'Registered' ? 'Confirmed Participant' : 'Waitlisted (Position #1)'}
                      </span>
                    ) : (
                      <span>{event.seatsLeft > 0 ? `${event.seatsLeft} Seats Available` : 'Event Full (Waitlist Open)'}</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  {event.userRegistrationStatus ? (
                    <>
                      {event.userRegistrationStatus === 'Registered' && (
                        <button 
                          className="btn btn-secondary"
                          onClick={() => {
                            onClose();
                            if (onViewTicket) onViewTicket(event);
                          }}
                        >
                          View Pass & QR
                        </button>
                      )}
                      <button 
                        className="btn btn-outline-danger"
                        onClick={handleCancelRegistration}
                        disabled={actionLoading}
                      >
                        Cancel Registration
                      </button>
                    </>
                  ) : (
                    <button 
                      className="btn btn-primary"
                      onClick={handleRegister}
                      disabled={actionLoading || event.status !== 'Approved'}
                      style={{ padding: '12px 24px', fontSize: '1rem' }}
                    >
                      {actionLoading ? 'Processing...' : event.seatsLeft > 0 ? 'Register for Event' : 'Join Waitlist'}
                    </button>
                  )}
                </div>
              </div>

              {/* Teams Section (If maxTeamSize > 0) */}
              {event.maxTeamSize > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Users size={18} color="#818cf8" /> Teams & Teammates (Max {event.maxTeamSize} per team)
                    </h3>
                    {event.userRegistrationStatus === 'Registered' && !event.userTeamId && !showTeamForm && (
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => setShowTeamForm(true)}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <Plus size={14} /> Create Team
                      </button>
                    )}
                  </div>

                  {/* Create Team Form */}
                  {showTeamForm && (
                    <form onSubmit={handleCreateTeam} style={{
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      padding: 14,
                      borderRadius: 10,
                      marginBottom: 16,
                      display: 'flex',
                      gap: 10
                    }}>
                      <input 
                        type="text" 
                        placeholder="Enter your team name..."
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        style={{ flex: 1 }}
                        required
                      />
                      <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                        Create
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowTeamForm(false)}>
                        Cancel
                      </button>
                    </form>
                  )}

                  {/* List of Teams */}
                  {teams.length === 0 ? (
                    <div style={{ padding: 16, borderRadius: 10, background: 'rgba(255, 255, 255, 0.02)', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                      No teams formed yet for this event. Register and create the first team!
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                      {teams.map((t) => (
                        <div key={t.teamId} style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: 10,
                          padding: 14
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ fontWeight: 700, color: '#f8fafc' }}>{t.teamName}</div>
                            <span className="badge badge-purple">{t.members?.length || 0} / {event.maxTeamSize}</span>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 8 }}>
                            Leader: <strong style={{ color: '#818cf8' }}>{t.leaderName}</strong>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                            {t.members?.map((m) => (
                              <span key={m.studentId} className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                                {m.name} {m.isLeader ? '👑' : ''}
                              </span>
                            ))}
                          </div>

                          {/* Leader controls: Add member */}
                          {user && t.leaderId === user.id && t.members?.length < event.maxTeamSize && (
                            <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                              <select 
                                value={memberStudentId} 
                                onChange={(e) => setMemberStudentId(e.target.value)}
                                style={{ flex: 1, fontSize: '0.78rem', padding: '6px 8px' }}
                              >
                                <option value="">Select registered peer...</option>
                                {teammateSuggestions.map((s) => (
                                  <option key={s.studentId} value={s.studentId}>
                                    {s.name} ({s.department})
                                  </option>
                                ))}
                              </select>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                onClick={() => handleAddMember(t.teamId)}
                              >
                                <UserPlus size={12} /> Add
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Feedback Section */}
              <div>
                <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <MessageSquare size={18} color="#38bdf8" /> Attendee Feedback & Ratings
                </h3>

                {/* Submit Feedback if attended */}
                {event.attendedCount > 0 && user && (
                  <form onSubmit={handleSubmitFeedback} style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 16
                  }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: 8 }}>
                      Leave your feedback (Only students who attended):
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          style={{
                            background: 'transparent',
                            color: star <= feedbackRating ? '#fbbf24' : '#475569',
                            fontSize: '1.2rem',
                            display: 'flex'
                          }}
                        >
                          <Star size={20} fill={star <= feedbackRating ? '#fbbf24' : 'none'} />
                        </button>
                      ))}
                    </div>
                    <textarea 
                      rows={2}
                      placeholder="Share your experience about the organization, content, and speakers..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      style={{ width: '100%', marginBottom: 10 }}
                      required
                    />
                    <button type="submit" className="btn btn-secondary" disabled={actionLoading}>
                      Submit Feedback
                    </button>
                  </form>
                )}

                {/* Feedback List */}
                {feedbacks.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No feedback submitted yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {feedbacks.map((fb) => (
                      <div key={fb.feedbackId} style={{
                        padding: 12,
                        borderRadius: 8,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#e2e8f0' }}>{fb.studentName} ({fb.department})</span>
                          <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem' }}>
                            <Star size={14} fill="#fbbf24" /> {fb.rating} / 5
                          </span>
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#94a3b8' }}>"{fb.comment}"</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
