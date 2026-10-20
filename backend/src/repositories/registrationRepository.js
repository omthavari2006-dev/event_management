const { executeQuery, executeWriteTransaction } = require('../config/db');
const { recordsToObjects } = require('../utils/neo4jUtils');
const { v4: uuidv4 } = require('uuid');

class RegistrationRepository {
  /**
   * Check if student already has another overlapping Approved event
   */
  async checkStudentTimeClash(studentId, startDateTime, endDateTime, currentEventId) {
    const cypher = `
      MATCH (s:Student {studentId: $studentId})-[r:REGISTERED_FOR {status: 'Registered'}]->(other:Event)
      WHERE other.eventId <> $currentEventId
        AND other.status = 'Approved'
        AND other.startDateTime < $endDateTime
        AND other.endDateTime > $startDateTime
      RETURN other.eventId AS clashingEventId,
             other.name AS clashingEventName,
             other.startDateTime AS startDateTime,
             other.endDateTime AS endDateTime
    `;
    const result = await executeQuery(cypher, {
      studentId,
      startDateTime,
      endDateTime,
      currentEventId
    });
    return recordsToObjects(result.records);
  }

  /**
   * Atomic Registration with Event Node Lock & Capacity / Waitlist
   */
  async registerStudent({ studentId, eventId }) {
    const registrationId = `reg-${uuidv4().substring(0, 8)}`;
    const notificationId = `notif-${uuidv4().substring(0, 8)}`;

    return executeWriteTransaction(async (tx) => {
      // 1. Fetch and Lock Event node (prevents concurrent overbooking)
      const lockQuery = `
        MATCH (e:Event {eventId: $eventId})
        SET e._lock = timestamp()
        RETURN e.eventId AS eventId,
               e.name AS name,
               e.status AS status,
               e.maxParticipants AS maxParticipants,
               e.startDateTime AS startDateTime,
               coalesce(e.registrationDeadline, e.startDateTime) AS deadline
      `;
      const lockRes = await tx.run(lockQuery, { eventId });
      const events = recordsToObjects(lockRes.records);

      if (events.length === 0) {
        throw new Error('Event not found.');
      }

      const event = events[0];
      if (event.status === 'Pending') {
        throw new Error('This event is pending Admin approval. Registrations will open once approved.');
      }
      if (event.status !== 'Approved') {
        throw new Error(`Registration closed: Event status is ${event.status}.`);
      }

      const now = new Date();
      if (event.deadline && new Date(event.deadline) < now) {
        throw new Error('Registration closed: The registration deadline has passed.');
      }
      if (event.startDateTime && new Date(event.startDateTime) < now) {
        throw new Error('Registration closed: The event has already started.');
      }

      // 2. Count current registered students
      const countQuery = `
        MATCH (:Student)-[r:REGISTERED_FOR {status: 'Registered'}]->(e:Event {eventId: $eventId})
        RETURN count(r) AS registeredCount
      `;
      const countRes = await tx.run(countQuery, { eventId });
      const currentRegistered = countRes.records[0].get('registeredCount');

      const isRegistered = currentRegistered < event.maxParticipants;
      const finalStatus = isRegistered ? 'Registered' : 'Waitlisted';

      // 3. Atomically MERGE registration relationship
      const regQuery = `
        MATCH (s:Student {studentId: $studentId}), (e:Event {eventId: $eventId})
        MERGE (s)-[reg:REGISTERED_FOR]->(e)
        ON CREATE SET 
          reg.registrationId = $registrationId,
          reg.time = toString(datetime()),
          reg.status = $finalStatus
        ON MATCH SET 
          reg.status = $finalStatus,
          reg.time = toString(datetime())
        
        CREATE (n:Notification {
          notificationId: $notificationId,
          title: $notifTitle,
          message: $notifMsg,
          status: 'Unread',
          createdTimestamp: toString(datetime())
        })
        MERGE (s)-[:RECEIVED]->(n)

        RETURN reg.registrationId AS registrationId,
               reg.status AS status,
               reg.time AS registeredTime,
               e.name AS eventName
      `;

      const notifTitle = isRegistered ? 'Registration Confirmed' : 'Added to Waitlist';
      const notifMsg = isRegistered 
        ? `You have secured a seat for "${event.name}".`
        : `"${event.name}" is at full capacity. You are on the waitlist and will be auto-promoted if a seat opens up.`;

      const regRes = await tx.run(regQuery, {
        studentId,
        eventId,
        registrationId,
        finalStatus,
        notificationId,
        notifTitle,
        notifMsg
      });

      return recordsToObjects(regRes.records)[0];
    });
  }

  /**
   * Cancel Registration with Automated Waitlist Promotion
   */
  async cancelRegistration(studentId, eventId) {
    return executeWriteTransaction(async (tx) => {
      // 1. Mark current registration as Cancelled
      const cancelQuery = `
        MATCH (s:Student {studentId: $studentId})-[r:REGISTERED_FOR]->(e:Event {eventId: $eventId})
        WHERE r.status = 'Registered' OR r.status = 'Waitlisted'
        SET r.status = 'Cancelled', r.cancelledAt = toString(datetime())
        RETURN r.status AS prevStatus, e.name AS eventName
      `;
      const cancelRes = await tx.run(cancelQuery, { studentId, eventId });
      const cancelledRecords = recordsToObjects(cancelRes.records);

      if (cancelledRecords.length === 0) {
        throw new Error('No active registration found to cancel');
      }

      const eventName = cancelledRecords[0].eventName;

      // 2. Find earliest waitlisted student to auto-promote
      const promoteQuery = `
        MATCH (waitStudent:Student)-[waitReg:REGISTERED_FOR {status: 'Waitlisted'}]->(e:Event {eventId: $eventId})
        WITH waitStudent, waitReg, e
        ORDER BY waitReg.time ASC
        LIMIT 1
        SET waitReg.status = 'Registered', waitReg.promotedAt = toString(datetime())

        CREATE (n:Notification {
          notificationId: 'notif-' + substring(randomUUID(), 0, 8),
          title: 'Promoted from Waitlist!',
          message: 'A seat became available! You have been auto-promoted to Registered for ' + e.name + '.',
          status: 'Unread',
          createdTimestamp: toString(datetime())
        })
        CREATE (waitStudent)-[:RECEIVED]->(n)

        RETURN waitStudent.studentId AS promotedStudentId,
               waitStudent.name AS promotedStudentName,
               waitStudent.email AS promotedStudentEmail
      `;
      const promoteRes = await tx.run(promoteQuery, { eventId });
      const promoted = recordsToObjects(promoteRes.records);

      return {
        success: true,
        message: 'Registration successfully cancelled',
        promotedStudent: promoted.length > 0 ? promoted[0] : null
      };
    });
  }

  /**
   * Get all registrations for a student
   */
  async getStudentRegistrations(studentId) {
    const cypher = `
      MATCH (s:Student {studentId: $studentId})-[r:REGISTERED_FOR]->(e:Event)
      OPTIONAL MATCH (c:Club)-[:ORGANIZES]->(e)
      OPTIONAL MATCH (s)-[att:ATTENDED]->(e)
      OPTIONAL MATCH (s)-[won:WON]->(e)
      OPTIONAL MATCH (s)-[:IN_TEAM]->(t:Team)-[:FOR_EVENT]->(e)
      RETURN r.registrationId AS registrationId,
             r.status AS status,
             r.time AS registeredTime,
             e.eventId AS eventId,
             e.name AS eventName,
             e.type AS eventType,
             e.venue AS venue,
             e.startDateTime AS startDateTime,
             e.endDateTime AS endDateTime,
             e.status AS eventStatus,
             c.name AS clubName,
             CASE WHEN att IS NOT NULL THEN true ELSE false END AS attended,
             att.timeMarked AS attendedAt,
             won.position AS wonPosition,
             won.prize AS wonPrize,
             t.name AS teamName
      ORDER BY r.time DESC
    `;
    const result = await executeQuery(cypher, { studentId });
    return recordsToObjects(result.records);
  }

  /**
   * Get all registrations for an event (Organizer view)
   */
  async getEventRegistrations(eventId) {
    const cypher = `
      MATCH (s:Student)-[r:REGISTERED_FOR]->(e:Event {eventId: $eventId})
      OPTIONAL MATCH (s)-[att:ATTENDED]->(e)
      OPTIONAL MATCH (s)-[won:WON]->(e)
      OPTIONAL MATCH (s)-[:IN_TEAM]->(t:Team)-[:FOR_EVENT]->(e)
      RETURN s.studentId AS studentId,
             s.name AS studentName,
             s.email AS email,
             s.department AS department,
             s.year AS year,
             r.registrationId AS registrationId,
             r.status AS status,
             r.time AS registeredTime,
             CASE WHEN att IS NOT NULL THEN true ELSE false END AS attended,
             att.timeMarked AS attendedAt,
             won.position AS wonPosition,
             won.prize AS wonPrize,
             t.teamId AS teamId,
             t.name AS teamName
      ORDER BY r.status ASC, r.time ASC
    `;
    const result = await executeQuery(cypher, { eventId });
    return recordsToObjects(result.records);
  }
}

module.exports = new RegistrationRepository();
