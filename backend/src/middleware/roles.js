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

  // Students can propose events which always start as 'Pending' for Admin review
  if (req.user.role === 'Student') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden. Organizer privileges required.'
  });
}

module.exports = {
  requireAdmin,
  requireStudent,
  requireClubOrganizer
};
