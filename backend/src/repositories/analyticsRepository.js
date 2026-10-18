const { executeQuery } = require('../config/db');
const { recordsToObjects } = require('../utils/neo4jUtils');

class AnalyticsRepository {
  // 1. Top 5 Most Active Students
  async getTopActiveStudents(limit = 5) {
    const cypher = `
      MATCH (s:Student)-[:ATTENDED]->(e:Event)
      RETURN s.studentId AS studentId,
             s.name AS studentName,
             s.department AS department,
             count(e) AS eventsAttended
      ORDER BY eventsAttended DESC
      LIMIT toInteger($limit)
    `;
    const result = await executeQuery(cypher, { limit });
    return recordsToObjects(result.records);
  }

  // 2. Attendance Rate Per Event
  async getAttendanceRates() {
    const cypher = `
      MATCH (e:Event)
      OPTIONAL MATCH (sReg:Student)-[:REGISTERED_FOR {status: 'Registered'}]->(e)
      WITH e, count(DISTINCT sReg) AS totalRegistered
      OPTIONAL MATCH (sAtt:Student)-[:ATTENDED]->(e)
      WITH e, totalRegistered, count(DISTINCT sAtt) AS totalAttended
      RETURN e.eventId AS eventId,
             e.name AS eventName,
             e.status AS status,
             totalRegistered,
             totalAttended,
             CASE WHEN totalRegistered > 0 
                  THEN round(toFloat(totalAttended) * 100.0 / toFloat(totalRegistered), 1)
                  ELSE 0.0 
             END AS attendancePercentage
      ORDER BY attendancePercentage DESC
    `;
    const result = await executeQuery(cypher);
    return recordsToObjects(result.records);
  }

  // 3. Club With Highest Average Rating
  async getTopRatedClubs() {
    const cypher = `
      MATCH (c:Club)-[:ORGANIZES]->(e:Event)<-[fb:GAVE_FEEDBACK]-(s:Student)
      RETURN c.clubId AS clubId,
             c.name AS clubName,
             count(fb) AS totalFeedbackCount,
             round(avg(fb.rating), 2) AS averageRating
      ORDER BY averageRating DESC, totalFeedbackCount DESC
      LIMIT 10
    `;
    const result = await executeQuery(cypher);
    return recordsToObjects(result.records);
  }

  // 4. Registered but Never Attended (Completed Events)
  async getNoShowStudents() {
    const cypher = `
      MATCH (s:Student)-[r:REGISTERED_FOR {status: 'Registered'}]->(e:Event {status: 'Completed'})
      WHERE NOT (s)-[:ATTENDED]->(e)
      RETURN s.studentId AS studentId,
             s.name AS studentName,
             s.email AS email,
             s.department AS department,
             e.eventId AS eventId,
             e.name AS eventName
    `;
    const result = await executeQuery(cypher);
    return recordsToObjects(result.records);
  }

  // 5. Department-wise Participation Ranking
  async getDepartmentRanking() {
    const cypher = `
      MATCH (s:Student)-[:ATTENDED]->(e:Event)
      WITH s.department AS department, count(e) AS totalAttendances
      ORDER BY totalAttendances DESC
      WITH collect({department: department, totalAttendances: totalAttendances}) AS rankedList
      UNWIND range(0, size(rankedList)-1) AS idx
      RETURN idx + 1 AS rank,
             rankedList[idx].department AS department,
             rankedList[idx].totalAttendances AS totalAttendances
    `;
    const result = await executeQuery(cypher);
    return recordsToObjects(result.records);
  }

  // 6. Leaderboard (10 pts per attended + 50/30/20 for winning)
  async getLeaderboard(limit = 10) {
    const cypher = `
      MATCH (s:Student)
      OPTIONAL MATCH (s)-[:ATTENDED]->(attEvent:Event)
      WITH s, count(DISTINCT attEvent) * 10 AS attendanceScore
      OPTIONAL MATCH (s)-[w:WON]->(wonEvent:Event)
      WITH s, attendanceScore,
           sum(CASE w.position
                 WHEN 1 THEN 50
                 WHEN 2 THEN 30
                 WHEN 3 THEN 20
                 ELSE 10 END) AS winnerBonus
      RETURN s.studentId AS studentId,
             s.name AS studentName,
             s.department AS department,
             s.year AS year,
             (attendanceScore + coalesce(winnerBonus, 0)) AS calculatedPoints
      ORDER BY calculatedPoints DESC
      LIMIT toInteger($limit)
    `;
    const result = await executeQuery(cypher, { limit });
    return recordsToObjects(result.records);
  }

  // 7. Graph-Only: Event Recommendations for a Student
  async getEventRecommendations(studentId, limit = 6) {
    const cypher = `
      MATCH (me:Student {studentId: $studentId})-[:ATTENDED|REGISTERED_FOR]->(sharedEvt:Event)
            <-[:ATTENDED|REGISTERED_FOR]-(peer:Student)
      WHERE peer <> me
      MATCH (peer)-[:REGISTERED_FOR {status: 'Registered'}]->(recEvt:Event)
      WHERE recEvt.status = 'Approved'
        AND NOT (me)-[:REGISTERED_FOR]->(recEvt)
      OPTIONAL MATCH (c:Club)-[:ORGANIZES]->(recEvt)
      RETURN recEvt.eventId AS eventId,
             recEvt.name AS name,
             recEvt.type AS type,
             recEvt.venue AS venue,
             recEvt.startDateTime AS startDateTime,
             recEvt.description AS description,
             c.name AS clubName,
             count(DISTINCT peer) AS peerScore
      ORDER BY peerScore DESC
      LIMIT toInteger($limit)
    `;
    const result = await executeQuery(cypher, { studentId, limit });
    return recordsToObjects(result.records);
  }

  // 8. Graph-Only: Friends Going for an Event
  async getFriendsGoing(studentId, eventId) {
    const cypher = `
      MATCH (me:Student {studentId: $studentId})-[:ATTENDED|IN_TEAM]->()<-[:ATTENDED|IN_TEAM]-(friend:Student)
      WHERE friend <> me
      MATCH (friend)-[:REGISTERED_FOR {status: 'Registered'}]->(targetEvt:Event {eventId: $eventId})
      RETURN friend.studentId AS studentId,
             friend.name AS name,
             friend.department AS department
      LIMIT 8
    `;
    const result = await executeQuery(cypher, { studentId, eventId });
    return recordsToObjects(result.records);
  }

  // 9. Graph-Only: Degrees of Connection Between Two Students
  async getDegreesOfConnection(studentId1, studentId2) {
    const cypher = `
      MATCH p = shortestPath((s1:Student {studentId: $studentId1})-[*..6]-(s2:Student {studentId: $studentId2}))
      RETURN [node IN nodes(p) | {
        labels: labels(node),
        id: coalesce(node.studentId, node.eventId, node.teamId, node.clubId),
        name: node.name
      }] AS pathNodes,
      [r IN relationships(p) | type(r)] AS relationshipTypes,
      length(p) AS degreesOfSeparation
    `;
    const result = await executeQuery(cypher, { studentId1, studentId2 });
    return recordsToObjects(result.records)[0] || null;
  }

  // 10. Graph-Only: Teammate Suggestions
  async getTeammateSuggestions(studentId, eventId) {
    const cypher = `
      MATCH (s:Student)-[:REGISTERED_FOR {status: 'Registered'}]->(e:Event {eventId: $eventId})
      WHERE NOT (s)-[:IN_TEAM]->(:Team)-[:FOR_EVENT]->(e)
        AND s.studentId <> $studentId
      RETURN s.studentId AS studentId,
             s.name AS name,
             s.department AS department,
             s.year AS year
      LIMIT 10
    `;
    const result = await executeQuery(cypher, { studentId, eventId });
    return recordsToObjects(result.records);
  }

  // 11. Graph-Only: Club Influence Ranking
  async getClubInfluence() {
    const cypher = `
      MATCH (c:Club)-[:ORGANIZES]->(e:Event)<-[:REGISTERED_FOR]-(s:Student)
      RETURN c.clubId AS clubId,
             c.name AS clubName,
             count(DISTINCT s) AS uniqueStudentsReached,
             count(DISTINCT e) AS totalEventsOrganized
      ORDER BY uniqueStudentsReached DESC
    `;
    const result = await executeQuery(cypher);
    return recordsToObjects(result.records);
  }

  // Admin High-Level Dashboard Stats
  async getAdminStats() {
    const cypher = `
      OPTIONAL MATCH (s:Student) WITH count(s) AS totalStudents
      OPTIONAL MATCH (c:Club) WITH totalStudents, count(c) AS totalClubs
      OPTIONAL MATCH (e:Event) WITH totalStudents, totalClubs, count(e) AS totalEvents
      OPTIONAL MATCH (:Student)-[r:REGISTERED_FOR {status: 'Registered'}]->(:Event)
      WITH totalStudents, totalClubs, totalEvents, count(r) AS totalRegistrations
      OPTIONAL MATCH (:Student)-[:ATTENDED]->(:Event)
      WITH totalStudents, totalClubs, totalEvents, totalRegistrations, count(*) AS totalAttendances
      OPTIONAL MATCH (cert:Certificate)
      RETURN totalStudents, totalClubs, totalEvents, totalRegistrations, totalAttendances, count(cert) AS totalCertificates
    `;
    const result = await executeQuery(cypher);
    return recordsToObjects(result.records)[0];
  }
}

module.exports = new AnalyticsRepository();
