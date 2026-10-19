const { executeQuery } = require('../config/db');
const { recordsToObjects } = require('../utils/neo4jUtils');

class UserRepository {
  async findByEmail(email) {
    const cypher = `
      OPTIONAL MATCH (a:Admin {email: $email})
      OPTIONAL MATCH (s:Student {email: $email})
      OPTIONAL MATCH (s)-[m:MEMBER_OF_CLUB]->(c:Club)
      OPTIONAL MATCH (s)-[p:PRESIDENT_OF]->(pClub:Club)
      RETURN a, s,
             collect(DISTINCT {
               clubId: c.clubId,
               clubName: c.name,
               role: m.role
             }) AS clubMemberships,
             collect(DISTINCT pClub.clubId) AS presidentClubs
    `;
    const result = await executeQuery(cypher, { email });
    const records = recordsToObjects(result.records);
    if (!records.length) return null;

    if (records[0].a) {
      return { ...records[0].a, role: 'Admin' };
    }
    if (records[0].s) {
      const validMemberships = (records[0].clubMemberships || []).filter(m => m && m.clubId);
      const validPresidents = (records[0].presidentClubs || []).filter(Boolean);
      return {
        ...records[0].s,
        role: 'Student',
        clubMemberships: validMemberships,
        presidentClubs: validPresidents
      };
    }
    return null;
  }

  async createStudent({ studentId, name, email, phone, department, year, passwordHash }) {
    const cypher = `
      CREATE (s:Student {
        studentId: $studentId,
        name: $name,
        email: $email,
        phone: $phone,
        department: $department,
        year: toInteger($year),
        points: 0,
        passwordHash: $passwordHash
      })
      RETURN s
    `;
    const result = await executeQuery(cypher, {
      studentId,
      name,
      email,
      phone: phone || '',
      department: department || 'General',
      year: year ? parseInt(year) : 1,
      passwordHash
    });
    return recordsToObjects(result.records)[0]?.s;
  }

  async createAdmin({ adminId, name, email, title, passwordHash }) {
    const cypher = `
      CREATE (a:Admin {
        adminId: $adminId,
        name: $name,
        email: $email,
        title: $title,
        passwordHash: $passwordHash
      })
      RETURN a
    `;
    const result = await executeQuery(cypher, {
      adminId,
      name,
      email,
      title: title || 'Campus Administrator',
      passwordHash
    });
    return recordsToObjects(result.records)[0]?.a;
  }

  async linkPresident({ studentId, clubId, clubName }) {
    const { v4: uuidv4 } = require('uuid');
    let cypher;
    let params;
    if (clubId) {
      cypher = `
        MATCH (s:Student {studentId: $studentId}), (c:Club {clubId: $clubId})
        MERGE (s)-[:PRESIDENT_OF {sinceDate: toString(datetime())}]->(c)
        MERGE (s)-[:MEMBER_OF_CLUB {role: 'President', joinedDate: toString(datetime())}]->(c)
        RETURN c.clubId AS clubId, c.name AS clubName
      `;
      params = { studentId, clubId };
    } else {
      const newClubId = `club-${uuidv4().substring(0, 6)}`;
      cypher = `
        MATCH (s:Student {studentId: $studentId})
        MERGE (c:Club {name: $clubName})
        ON CREATE SET 
          c.clubId = $newClubId,
          c.description = $clubName + ' student organization',
          c.facultyAdvisor = 'Faculty Coordinator',
          c.status = 'Approved',
          c.createdDate = toString(datetime())
        MERGE (s)-[:PRESIDENT_OF {sinceDate: toString(datetime())}]->(c)
        MERGE (s)-[:MEMBER_OF_CLUB {role: 'President', joinedDate: toString(datetime())}]->(c)
        RETURN c.clubId AS clubId, c.name AS clubName
      `;
      params = { studentId, clubName: (clubName || 'Student Club').trim(), newClubId };
    }
    const result = await executeQuery(cypher, params);
    return recordsToObjects(result.records)[0];
  }

  async getStudentProfile(studentId) {
    const cypher = `
      MATCH (s:Student {studentId: $studentId})
      OPTIONAL MATCH (s)-[m:MEMBER_OF_CLUB]->(c:Club)
      OPTIONAL MATCH (s)-[:ATTENDED]->(attEvt:Event)
      OPTIONAL MATCH (s)-[w:WON]->(wonEvt:Event)
      OPTIONAL MATCH (s)-[:AWARDED_TO]-(cert:Certificate)
      RETURN s.studentId AS studentId,
             s.name AS name,
             s.email AS email,
             s.department AS department,
             s.year AS year,
             s.points AS points,
             count(DISTINCT attEvt) AS eventsAttended,
             count(DISTINCT wonEvt) AS eventsWon,
             count(DISTINCT cert) AS certificateCount,
             collect(DISTINCT {
               clubId: c.clubId,
               clubName: c.name,
               role: m.role
             }) AS clubs
    `;
    const result = await executeQuery(cypher, { studentId });
    return recordsToObjects(result.records)[0];
  }
}

module.exports = new UserRepository();
