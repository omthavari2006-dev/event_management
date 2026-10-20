/**
 * Role-Based Access Control Middlewares
 */

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Admin privileges required.'
    });
  }
  next();
}

function requireStudent(req, res, next) {
  if (!req.user || req.user.role !== 'Student') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Student account required.'
    });
  }
  next();
}

/**
 * Checks if the user is a President or Organizer of the specified club or an Admin
 */
function requireClubOrganizer(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (req.user.role === 'Admin') {
    return next();
  }

  const targetClubId = req.params.clubId || req.body.clubId;

  const isPresident = req.user.presidentClubs && req.user.presidentClubs.includes(targetClubId);
  const isOrganizer = req.user.clubMemberships && req.user.clubMemberships.some(
    m => m.clubId === targetClubId && (m.role === 'President' || m.role === 'Organizer')
  );

  if (targetClubId && (isPresident || isOrganizer)) {
    return next();
  }

  const hasAnyOrgRole = (req.user.presidentClubs && req.user.presidentClubs.length > 0) ||
    (req.user.clubMemberships && req.user.clubMemberships.some(m => m.role === 'President' || m.role === 'Organizer'));

  if (hasAnyOrgRole) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden. Organizer privileges required.'
  });
}

const { executeQuery } = require('../config/db');

/**
 * Checks if the user is a President or Organizer of the specific club organizing the target event.
 * Rejects Admins (Admins cannot mark attendance; only organizers of that specific event can).
 */
async function requireEventOrganizer(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  // Administrators cannot mark attendance
  if (req.user.role === 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Administrators cannot mark attendance. Attendance must be recorded directly by the designated club organizer.'
    });
  }

  const eventId = req.params.eventId || req.body.eventId;
  if (!eventId) {
    return res.status(400).json({ success: false, message: 'Event ID is required.' });
  }

  try {
    const cypher = `
      MATCH (s:Student {studentId: $studentId})
      MATCH (c:Club)-[:ORGANIZES]->(e:Event {eventId: $eventId})
      WHERE (s)-[:PRESIDENT_OF]->(c) 
         OR (s)-[:MEMBER_OF_CLUB {role: 'President'}]->(c)
         OR (s)-[:MEMBER_OF_CLUB {role: 'Organizer'}]->(c)
      RETURN count(e) > 0 AS isAuthorized
    `;
    const result = await executeQuery(cypher, { studentId: req.user.id, eventId });
    const isAuthorized = result.records.length > 0 && result.records[0].get('isAuthorized');

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only manage attendance for events organized by your own club.'
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  requireAdmin,
  requireStudent,
  requireClubOrganizer,
  requireEventOrganizer
};
