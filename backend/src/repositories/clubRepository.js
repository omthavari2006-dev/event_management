const { executeQuery, executeWriteTransaction } = require('../config/db');
const { recordsToObjects } = require('../utils/neo4jUtils');

class ClubRepository {
  async getAllClubs(status = 'Approved') {
    const cypher = `
      MATCH (c:Club)
      WHERE ($status IS NULL OR c.status = $status)
      OPTIONAL MATCH (p:Student)-[:PRESIDENT_OF]->(c)
      OPTIONAL MATCH (c)-[:ORGANIZES]->(e:Event)
      OPTIONAL MATCH (m:Student)-[:MEMBER_OF_CLUB]->(c)
      RETURN c.clubId AS clubId,
             c.name AS name,
             c.description AS description,
             c.facultyAdvisor AS facultyAdvisor,
             c.status AS status,
             c.createdDate AS createdDate,
             p.name AS presidentName,
             p.studentId AS presidentId,
             count(DISTINCT e) AS totalEvents,
             count(DISTINCT m) AS memberCount
      ORDER BY c.name ASC
    `;
    const result = await executeQuery(cypher, { status });
    return recordsToObjects(result.records);
  }

  async getClubById(clubId) {
    const cypher = `
      MATCH (c:Club {clubId: $clubId})
      OPTIONAL MATCH (p:Student)-[:PRESIDENT_OF]->(c)
      OPTIONAL MATCH (m:Student)-[mem:MEMBER_OF_CLUB]->(c)
      OPTIONAL MATCH (c)-[:ORGANIZES]->(e:Event)
      RETURN c.clubId AS clubId,
             c.name AS name,
             c.description AS description,
             c.facultyAdvisor AS facultyAdvisor,
             c.status AS status,
             c.createdDate AS createdDate,
             p.name AS presidentName,
             p.studentId AS presidentId,
             collect(DISTINCT {
               studentId: m.studentId,
               name: m.name,
               role: mem.role,
               joinedDate: mem.joinedDate
             }) AS members,
             collect(DISTINCT {
               eventId: e.eventId,
               name: e.name,
               type: e.type,
               status: e.status,
               startDateTime: e.startDateTime
             }) AS events
    `;
    const result = await executeQuery(cypher, { clubId });
    const clubs = recordsToObjects(result.records);
    return clubs[0] || null;
  }

  async requestClub({ clubId, name, description, facultyAdvisor, studentId }) {
    return executeWriteTransaction(async (tx) => {
      const cypher = `
        MATCH (s:Student {studentId: $studentId})
        CREATE (c:Club {
          clubId: $clubId,
          name: $name,
          description: $description,
          facultyAdvisor: $facultyAdvisor,
          status: 'Pending',
          createdDate: toString(date())
        })
        CREATE (s)-[:PRESIDENT_OF {sinceDate: toString(date())}]->(c)
        CREATE (s)-[:MEMBER_OF_CLUB {role: 'President', joinedDate: toString(date())}]->(c)
        RETURN c
      `;
      const result = await tx.run(cypher, {
        clubId,
        name,
        description,
        facultyAdvisor,
        studentId
      });
      return recordsToObjects(result.records)[0]?.c;
    });
  }

  async approveClub(clubId, adminId) {
    const cypher = `
      MATCH (c:Club {clubId: $clubId}), (a:Admin {adminId: $adminId})
      SET c.status = 'Approved'
      MERGE (a)-[app:APPROVED]->(c)
      SET app.approvalTime = toString(datetime())
      RETURN c.clubId AS clubId, c.status AS status, app.approvalTime AS approvedAt
    `;
    const result = await executeQuery(cypher, { clubId, adminId });
    return recordsToObjects(result.records)[0] || null;
  }

  async addMember({ clubId, studentId, role = 'Member' }) {
    const cypher = `
      MATCH (c:Club {clubId: $clubId}), (s:Student {studentId: $studentId})
      MERGE (s)-[m:MEMBER_OF_CLUB]->(c)
      ON CREATE SET m.role = $role, m.joinedDate = toString(date())
      ON MATCH SET m.role = $role
      RETURN s.name AS studentName, c.name AS clubName, m.role AS role
    `;
    const result = await executeQuery(cypher, { clubId, studentId, role });
    return recordsToObjects(result.records)[0] || null;
  }
}

module.exports = new ClubRepository();
