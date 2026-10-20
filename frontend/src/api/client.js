/**
 * Campus Events API Client
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('campus_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),

  // Events
  getEvents: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.type) query.append('type', params.type);
    if (params.search) query.append('search', params.search);
    if (params.clubId) query.append('clubId', params.clubId);
    return request(`/events?${query.toString()}`);
  },
  getEvent: (eventId) => request(`/events/${eventId}`),
  createEvent: (payload) => request('/events', { method: 'POST', body: JSON.stringify(payload) }),
  approveEvent: (eventId) => request(`/events/${eventId}/approve`, { method: 'PUT' }),
  rejectEvent: (eventId, reason) => request(`/events/${eventId}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  cancelEvent: (eventId) => request(`/events/${eventId}/cancel`, { method: 'PUT' }),
  completeEvent: (eventId) => request(`/events/${eventId}/complete`, { method: 'PUT' }),
  checkVenueClash: (venue, startDateTime, endDateTime, eventId) => {
    const query = new URLSearchParams({ venue, startDateTime, endDateTime });
    if (eventId) query.append('eventId', eventId);
    return request(`/events/clash-check?${query.toString()}`);
  },

  // Clubs
  getClubs: (status) => request(status ? `/clubs?status=${status}` : '/clubs'),
  getClub: (clubId) => request(`/clubs/${clubId}`),
  requestClub: (payload) => request('/clubs/request', { method: 'POST', body: JSON.stringify(payload) }),
  approveClub: (clubId) => request(`/clubs/${clubId}/approve`, { method: 'PUT' }),
  addClubMember: (clubId, payload) => request(`/clubs/${clubId}/members`, { method: 'POST', body: JSON.stringify(payload) }),

  // Registrations
  registerForEvent: (eventId) => request(`/registrations/${eventId}`, { method: 'POST' }),
  cancelRegistration: (eventId) => request(`/registrations/${eventId}`, { method: 'DELETE' }),
  getMyRegistrations: () => request('/registrations/my'),
  getEventRegistrations: (eventId) => request(`/registrations/event/${eventId}`),

  // Teams
  createTeam: (eventId, teamName) => request(`/teams/event/${eventId}`, { method: 'POST', body: JSON.stringify({ teamName }) }),
  addTeamMember: (teamId, memberStudentId) => request(`/teams/${teamId}/members`, { method: 'POST', body: JSON.stringify({ memberStudentId }) }),
  getTeams: (eventId) => request(`/teams/event/${eventId}`),

  // Attendance & Winners
  markAttendance: (eventId, studentIds) => request(`/attendance/event/${eventId}`, { method: 'POST', body: JSON.stringify({ studentIds }) }),
  unmarkAttendance: (eventId, studentId) => request(`/attendance/event/${eventId}/student/${studentId}`, { method: 'DELETE' }),
  getAttendees: (eventId) => request(`/attendance/event/${eventId}`),
  declareWinners: (eventId, winners) => request(`/winners/event/${eventId}`, { method: 'POST', body: JSON.stringify({ winners }) }),
  getWinners: (eventId) => request(`/winners/event/${eventId}`),

  // Certificates
  generateCertificates: (eventId) => request(`/certificates/event/${eventId}/generate`, { method: 'POST' }),
  getMyCertificates: () => request('/certificates/my'),
  verifyCertificate: (code) => request(`/certificates/verify?code=${encodeURIComponent(code)}`),
  getCertificateDownloadUrl: (certificateId) => `${API_BASE}/certificates/${certificateId}/download`,

  // Feedback
  submitFeedback: (eventId, rating, comment) => request(`/feedback/event/${eventId}`, { method: 'POST', body: JSON.stringify({ rating, comment }) }),
  getFeedback: (eventId) => request(`/feedback/event/${eventId}`),

  // Notifications
  getNotifications: () => request('/notifications/my'),
  markNotificationRead: (notificationId) => request(`/notifications/${notificationId}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),

  // Recommendations & Graph
  getRecommendations: () => request('/recommendations/events'),
  getFriendsGoing: (eventId) => request(`/recommendations/friends-going/${eventId}`),
  getDegreesOfConnection: (s1, s2) => request(`/recommendations/degrees-of-connection?studentId1=${s1 || ''}&studentId2=${s2 || ''}`),
  getTeammateSuggestions: (eventId) => request(`/recommendations/teammates/${eventId}`),

  // Analytics
  getAdminAnalytics: () => request('/analytics/admin'),
  getLeaderboard: () => request('/analytics/leaderboard')
};
