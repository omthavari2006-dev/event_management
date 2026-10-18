// ============================================================================
// CAMPUS EVENT MANAGEMENT SYSTEM - CORE CYPHER OPERATIONS
// Reference queries for ACID transactions, integrity rules, and state transitions
// ============================================================================

// 1. EVENT VENUE CLASH DETECTION (Run before Admin Approves an Event)
// ----------------------------------------------------------------------------
// Checks if another approved event occupies the same venue during the proposed time window
MATCH (other:Event)
WHERE other.venue = $venue
  AND other.status = 'Approved'
  AND other.eventId <> $eventId
  AND other.startDateTime < $endDateTime
  AND other.endDateTime > $startDateTime
RETURN other.eventId AS clashingEventId,
       other.name AS clashingEventName,
       other.startDateTime AS clashingStart,
       other.endDateTime AS clashingEnd;


// 2. ATOMIC REGISTRATION WITH CAPACITY CHECK & NODE LOCK (Single Transaction)
// ----------------------------------------------------------------------------
// Step A: Lock the event node by setting a transient timestamp (prevents race conditions)
// Step B: Check registration deadline & seat count
// Step C: MERGE registration as 'Registered' if capacity available, else 'Waitlisted'
// Step D: Create audit / notification in the same transaction
MATCH (e:Event {eventId: $eventId})
WHERE e.status = 'Approved' AND datetime(e.registrationDeadline) >= datetime()
// Acquire exclusive write lock on event node:
SET e._lock = timestamp()

WITH e
MATCH (s:Student {studentId: $studentId})

// Count current registered students
OPTIONAL MATCH (existing:Student)-[r:REGISTERED_FOR {status: 'Registered'}]->(e)
WITH e, s, count(r) AS currentRegisteredCount

// Determine status based on maxParticipants
WITH e, s,
     CASE WHEN currentRegisteredCount < e.maxParticipants THEN 'Registered'
          ELSE 'Waitlisted'
     END AS newStatus

// Create or update registration relationship atomically
MERGE (s)-[reg:REGISTERED_FOR]->(e)
ON CREATE SET 
  reg.registrationId = $registrationId,
  reg.time = toString(datetime()),
  reg.status = newStatus
ON MATCH SET 
  reg.status = newStatus,
  reg.time = toString(datetime())

// Create corresponding notification in the same transaction
CREATE (n:Notification {
  notificationId: $notificationId,
  title: CASE WHEN newStatus = 'Registered' THEN 'Registration Confirmed' ELSE 'Added to Waitlist' END,
  message: 'Your registration for ' + e.name + ' is ' + newStatus + '.',
  status: 'Unread',
  createdTimestamp: toString(datetime())
})
MERGE (s)-[:RECEIVED]->(n)

RETURN reg.registrationId AS registrationId,
       reg.status AS status,
       e.name AS eventName;


// 3. CANCELLATION AND AUTOMATIC WAITLIST PROMOTION (Single Transaction)
// ----------------------------------------------------------------------------
// Marks the cancelling student's registration as 'Cancelled'
// Finds the earliest waitlisted student, promotes them to 'Registered',
// and sends them an automated promotion notification.
MATCH (cancellingStudent:Student {studentId: $studentId})-[cancelReg:REGISTERED_FOR]->(e:Event {eventId: $eventId})
WHERE cancelReg.status = 'Registered'
SET cancelReg.status = 'Cancelled', cancelReg.cancelledAt = toString(datetime())

WITH e
// Find earliest waitlisted student
OPTIONAL MATCH (waitlistStudent:Student)-[waitReg:REGISTERED_FOR {status: 'Waitlisted'}]->(e)
WITH e, waitlistStudent, waitReg
ORDER BY waitReg.time ASC
LIMIT 1

FOREACH (_ IN CASE WHEN waitReg IS NOT NULL THEN [1] ELSE [] END |
  SET waitReg.status = 'Registered', waitReg.promotedAt = toString(datetime())
  CREATE (n:Notification {
    notificationId: randomUUID(),
    title: 'Promoted from Waitlist!',
    message: 'Good news! A seat opened up and you are now officially registered for ' + e.name + '.',
    status: 'Unread',
    createdTimestamp: toString(datetime())
  })
  CREATE (waitlistStudent)-[:RECEIVED]->(n)
)

RETURN e.eventId AS eventId,
       waitlistStudent.studentId AS promotedStudentId,
       waitlistStudent.name AS promotedStudentName;


// 4. TEAM CREATION FOR EVENT (With Maximum Size Enforcement)
// ----------------------------------------------------------------------------
MATCH (s:Student {studentId: $studentId})-[reg:REGISTERED_FOR {status: 'Registered'}]->(e:Event {eventId: $eventId})
WHERE e.maxTeamSize > 0
// Ensure student is not already in any team for this event
OPTIONAL MATCH (s)-[:IN_TEAM]->(existingTeam:Team)-[:FOR_EVENT]->(e)
WITH s, e, existingTeam
WHERE existingTeam IS NULL

CREATE (t:Team {
  teamId: $teamId,
  name: $teamName,
  createdTimestamp: toString(datetime())
})
CREATE (t)-[:FOR_EVENT]->(e)
CREATE (s)-[:LEADS]->(t)
CREATE (s)-[:IN_TEAM {joinedTime: toString(datetime())}]->(t)

RETURN t.teamId AS teamId, t.name AS teamName, e.name AS eventName;


// 5. ATTENDANCE MARKING (Using MERGE for Idempotency)
// ----------------------------------------------------------------------------
// Only students with status 'Registered' can be marked as ATTENDED
MATCH (s:Student {studentId: $studentId})-[reg:REGISTERED_FOR {status: 'Registered'}]->(e:Event {eventId: $eventId})
MERGE (s)-[att:ATTENDED]->(e)
ON CREATE SET att.timeMarked = toString(datetime())
RETURN s.studentId AS studentId, s.name AS studentName, e.name AS eventName, att.timeMarked AS markedAt;


// 6. DECLARE WINNERS (Requires Prior Attendance)
// ----------------------------------------------------------------------------
MATCH (s:Student {studentId: $studentId})-[:ATTENDED]->(e:Event {eventId: $eventId})
MERGE (s)-[w:WON]->(e)
SET w.position = $position,
    w.prize = $prize
RETURN s.name AS winnerName, w.position AS position, w.prize AS prize;


// 7. DETERMINISTIC CERTIFICATE ISSUANCE
// ----------------------------------------------------------------------------
// Generates certificates for all attendees (Winner or Participation)
MATCH (s:Student)-[:ATTENDED]->(e:Event {eventId: $eventId})
OPTIONAL MATCH (s)-[w:WON]->(e)
WITH s, e,
     CASE WHEN w IS NOT NULL THEN 'Winner' ELSE 'Participation' END AS certType,
     e.eventId + '_' + s.studentId AS deterministicCertId

MERGE (cert:Certificate {certificateId: deterministicCertId})
ON CREATE SET 
  cert.type = certType,
  cert.verificationCode = 'VERIFY-' + toUpper(substring(randomUUID(), 0, 8)),
  cert.fileUrl = '/api/certificates/' + deterministicCertId + '/download',
  cert.issueDate = toString(date())

MERGE (e)-[:ISSUES]->(cert)
MERGE (cert)-[:AWARDED_TO]->(s)

RETURN s.name AS student, cert.type AS type, cert.verificationCode AS code;


// 8. FEEDBACK SUBMISSION (One per student per event via MERGE)
// ----------------------------------------------------------------------------
MATCH (s:Student {studentId: $studentId})-[:ATTENDED]->(e:Event {eventId: $eventId})
MERGE (s)-[fb:GAVE_FEEDBACK]->(e)
SET fb.feedbackId = coalesce(fb.feedbackId, $feedbackId),
    fb.rating = $rating,
    fb.comment = $comment,
    fb.time = toString(datetime())
RETURN s.name AS student, e.name AS event, fb.rating AS rating, fb.comment AS comment;
