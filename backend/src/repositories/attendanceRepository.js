const { executeQuery, executeWriteTransaction } = require('../config/db');
const { recordsToObjects } = require('../utils/neo4jUtils');

class AttendanceRepository {
  /**
   * Mark Attendance for a single student or batch of students
   * Only Registered students can be marked. Repeat marking has no duplicate effect due to MERGE.
   */
  async markAttendance(eventId, studentIds) {
    const ids = Array.isArray(studentIds) ? studentIds : [studentIds];

    return executeWriteTransaction(async (tx) => {
      const cypher = `
        UNWIND $ids AS sId
        MATCH (s:Student {studentId: sId})-[reg:REGISTERED_FOR {status: 'Registered'}]->(e:Event {eventId: $eventId})
        MERGE (s)-[att:ATTENDED]->(e)
        ON CREATE SET att.timeMarked = toString(datetime())
        RETURN s.studentId AS studentId, s.name AS studentName, att.timeMarked AS markedAt
      `;
      const result = await tx.run(cypher, { eventId, ids });
      return recordsToObjects(result.records);
    });
  }

  async getEventAttendees(eventId) {
    const cypher = `
      MATCH (s:Student)-[att:ATTENDED]->(e:Event {eventId: $eventId})
      RETURN s.studentId AS studentId,
             s.name AS studentName,
             s.email AS email,
             s.department AS department,
             att.timeMarked AS attendedAt
      ORDER BY att.timeMarked ASC
    `;
    const result = await executeQuery(cypher, { eventId });
    return recordsToObjects(result.records);
  }
}

module.exports = new AttendanceRepository();
