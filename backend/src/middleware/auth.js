const { verifyToken } = require('../utils/tokenHelper');
const { executeQuery } = require('../config/db');
const { recordsToObjects } = require('../utils/neo4jUtils');

/**
 * Authentication Middleware:
 * Validates JWT, finds Admin or Student in Neo4j, and loads their club affiliations
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No Bearer token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }

    const { id, role } = decoded;

    if (role === 'Admin') {
      const cypher = `
        MATCH (a:Admin {adminId: $id})
        RETURN a.adminId AS id, a.name AS name, a.email AS email, 'Admin' AS role
      `;
      const result = await executeQuery(cypher, { id });
      const admins = recordsToObjects(result.records);
      if (admins.length === 0) {
        return res.status(401).json({ success: false, message: 'Admin not found.' });
      }
      req.user = admins[0];
      return next();
    }

    // Role is Student or Organizer
    const studentCypher = `
      MATCH (s:Student {studentId: $id})
      OPTIONAL MATCH (s)-[m:MEMBER_OF_CLUB]->(c:Club)
      OPTIONAL MATCH (s)-[p:PRESIDENT_OF]->(pClub:Club)
      RETURN s.studentId AS id,
             s.name AS name,
             s.email AS email,
             s.department AS department,
             s.year AS year,
             'Student' AS role,
             collect(DISTINCT {
               clubId: c.clubId,
               clubName: c.name,
               role: m.role
             }) AS clubMemberships,
             collect(DISTINCT pClub.clubId) AS presidentClubs
    `;
    const result = await executeQuery(studentCypher, { id });
    const students = recordsToObjects(result.records);
    if (students.length === 0) {
      return res.status(401).json({ success: false, message: 'Student account not found.' });
    }

    req.user = students[0];
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional Authentication: Attaches req.user if token is present, else continues
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return authenticate(req, res, next);
}

module.exports = {
  authenticate,
  optionalAuth
};
