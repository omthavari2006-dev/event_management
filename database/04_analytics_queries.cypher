// ============================================================================
// CAMPUS EVENT MANAGEMENT SYSTEM - ANALYTICAL & GRAPH QUERIES
// Cypher scripts for analytics dashboards, leaderboards, and graph algorithms
// ============================================================================

// ----------------------------------------------------------------------------
// A. STANDARD DBMS ANALYTICS (Aggregations, Grouping, and Metrics)
// ----------------------------------------------------------------------------

// 1. Top 5 Most Active Students by Events Attended
MATCH (s:Student)-[:ATTENDED]->(e:Event)
RETURN s.studentId AS studentId,
       s.name AS studentName,
       s.department AS department,
       count(e) AS eventsAttended
ORDER BY eventsAttended DESC
LIMIT 5;


// 2. Attendance Rate Per Event (Completed or Ongoing)
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
            THEN round(toFloat(totalAttended) * 100.0 / toFloat(totalRegistered), 2)
            ELSE 0.0 
       END AS attendancePercentage
ORDER BY attendancePercentage DESC;


// 3. Club with the Highest Average Rating
MATCH (c:Club)-[:ORGANIZES]->(e:Event)<-[fb:GAVE_FEEDBACK]-(s:Student)
RETURN c.clubId AS clubId,
       c.name AS clubName,
       count(fb) AS totalFeedbackCount,
       round(avg(fb.rating), 2) AS averageRating
ORDER BY averageRating DESC, totalFeedbackCount DESC
LIMIT 5;


// 4. "No-Show" Students: Registered But Never Attended (Completed Events)
MATCH (s:Student)-[r:REGISTERED_FOR {status: 'Registered'}]->(e:Event {status: 'Completed'})
WHERE NOT (s)-[:ATTENDED]->(e)
RETURN s.studentId AS studentId,
       s.name AS studentName,
       s.email AS email,
       s.department AS department,
       e.name AS eventMissed;


// 5. Department-wise Participation Ranking
// Cypher has no SQL window functions, so ranking is achieved via ordered list indexing
MATCH (s:Student)-[:ATTENDED]->(e:Event)
WITH s.department AS department, count(e) AS totalAttendances
ORDER BY totalAttendances DESC
WITH collect({dept: department, attendances: totalAttendances}) AS rankedList
UNWIND range(0, size(rankedList)-1) AS idx
RETURN idx + 1 AS rank,
       rankedList[idx].dept AS department,
       rankedList[idx].attendances AS totalAttendances;


// 6. Comprehensive Student Points Leaderboard
// Logic: 10 points per event attended + 50 for 1st, 30 for 2nd, 20 for 3rd place
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
ORDER BY calculatedPoints DESC;


// ----------------------------------------------------------------------------
// B. GRAPH-POWERED TRAVERSALS (Why Graph Database / Neo4j is Superior)
// ----------------------------------------------------------------------------

// 7. Event Recommendations (Collaborative Filtering via Graph Paths)
// "Find upcoming events attended/registered by peers who attended the same events as me"
MATCH (me:Student {studentId: $studentId})-[:ATTENDED|REGISTERED_FOR]->(sharedEvt:Event)
      <-[:ATTENDED|REGISTERED_FOR]-(peer:Student)
WHERE peer <> me
MATCH (peer)-[:REGISTERED_FOR {status: 'Registered'}]->(recEvt:Event)
WHERE recEvt.status = 'Approved'
  AND datetime(recEvt.startDateTime) > datetime()
  AND NOT (me)-[:REGISTERED_FOR]->(recEvt)
RETURN recEvt.eventId AS eventId,
       recEvt.name AS eventName,
       recEvt.type AS type,
       recEvt.venue AS venue,
       recEvt.startDateTime AS startDateTime,
       count(DISTINCT peer) AS peerScore
ORDER BY peerScore DESC
LIMIT 6;


// 8. "Friends Going" Badge for Event Pages
// Shows students who shared past events/teams with the current student and are registered for this event
MATCH (me:Student {studentId: $studentId})-[:ATTENDED|IN_TEAM]->()<-[:ATTENDED|IN_TEAM]-(friend:Student)
WHERE friend <> me
MATCH (friend)-[:REGISTERED_FOR {status: 'Registered'}]->(targetEvt:Event {eventId: $eventId})
RETURN friend.studentId AS studentId,
       friend.name AS name,
       friend.department AS department
LIMIT 5;


// 9. Shortest Path / Degrees of Connection Between Two Students
MATCH p = shortestPath((s1:Student {studentId: $studentId1})-[*..6]-(s2:Student {studentId: $studentId2}))
RETURN [node IN nodes(p) | 
  CASE 
    WHEN 'Student' IN labels(node) THEN 'Student: ' + node.name
    WHEN 'Event' IN labels(node) THEN 'Event: ' + node.name
    WHEN 'Team' IN labels(node) THEN 'Team: ' + node.name
    WHEN 'Club' IN labels(node) THEN 'Club: ' + node.name
    ELSE 'Node' 
  END] AS connectionPath,
  length(p) AS degreesOfSeparation;


// 10. Teammate Suggestions for an Event
// Returns registered students who are NOT yet in any team for this specific event
MATCH (s:Student)-[:REGISTERED_FOR {status: 'Registered'}]->(e:Event {eventId: $eventId})
WHERE NOT (s)-[:IN_TEAM]->(:Team)-[:FOR_EVENT]->(e)
  AND s.studentId <> $currentStudentId
RETURN s.studentId AS studentId,
       s.name AS name,
       s.department AS department,
       s.year AS year;


// 11. Club Influence Ranking
// Rank clubs by total number of UNIQUE campus students reached
MATCH (c:Club)-[:ORGANIZES]->(e:Event)<-[:REGISTERED_FOR]-(s:Student)
RETURN c.clubId AS clubId,
       c.name AS clubName,
       count(DISTINCT s) AS uniqueStudentsReached,
       count(DISTINCT e) AS totalEventsOrganized
ORDER BY uniqueStudentsReached DESC;
