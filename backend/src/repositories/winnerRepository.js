const { executeQuery, executeWriteTransaction } = require('../config/db');
const { recordsToObjects } = require('../utils/neo4jUtils');

class WinnerRepository {
  /**
   * Declare winners for an event. Only students who ATTENDED can win.
   */
  async declareWinners(eventId, winners) {
    // winners is an array of { studentId, position, prize }
    return executeWriteTransaction(async (tx) => {
      const cypher = `
        UNWIND $winners AS w
        MATCH (s:Student {studentId: w.studentId})-[:ATTENDED]->(e:Event {eventId: $eventId})
        MERGE (s)-[won:WON]->(e)
        SET won.position = toInteger(w.position),
            won.prize = w.prize,
            won.declaredAt = toString(datetime())
        RETURN s.studentId AS studentId,
               s.name AS studentName,
               won.position AS position,
               won.prize AS prize
        ORDER BY won.position ASC
      `;
      const result = await tx.run(cypher, { eventId, winners });
      return recordsToObjects(result.records);
    });
  }

  async getEventWinners(eventId) {
    const cypher = `
      MATCH (s:Student)-[won:WON]->(e:Event {eventId: $eventId})
      RETURN s.studentId AS studentId,
             s.name AS studentName,
             s.department AS department,
             won.position AS position,
             won.prize AS prize,
             won.declaredAt AS declaredAt
      ORDER BY won.position ASC
    `;
    const result = await executeQuery(cypher, { eventId });
    return recordsToObjects(result.records);
  }
}

module.exports = new WinnerRepository();
