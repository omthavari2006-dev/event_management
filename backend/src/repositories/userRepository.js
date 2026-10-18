const { executeQuery } = require('../config/db');
const { recordsToObjects } = require('../utils/neo4jUtils');

class UserRepository {
  async findByEmail(email) {
    const cypher = `
      OPTIONAL MATCH (a:Admin {email: $email})
      OPTIONAL MATCH (s:Student {email: $email})
      RETURN a, s
    `;
    const result = await executeQuery(cypher, { email });
    const records = recordsToObjects(result.records);
    if (!records.length) return null;

    if (records[0].a) {
      return { ...records[0].a, role: 'Admin' };
    }
    if (records[0].s) {
      return { ...records[0].s, role: 'Student' };
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
      phone,
      department,
      year,
      passwordHash
    });
    return recordsToObjects(result.records)[0]?.s;
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
