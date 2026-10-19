const { executeQuery, executeWriteTransaction } = require('../config/db');
const { recordsToObjects } = require('../utils/neo4jUtils');

class EventRepository {
  async getAllEvents({ status, type, search, clubId, limit = 50, skip = 0 }) {
    // Determine status query clause:
    // If status is not provided (or 'public'), default to only Approved and Completed events so students never see Pending
    let statusFilter = '';
    if (!status || status === 'public') {
      statusFilter = "e.status IN ['Approved', 'Completed']";
    } else if (status === 'All') {
      statusFilter = "true";
    } else {
      statusFilter = "e.status = $status";
    }

    let cypher = `
      MATCH (e:Event)
      WHERE ${statusFilter}
        AND ($type IS NULL OR e.type = $type)
    `;

    if (search && search.trim()) {
      cypher += `
        AND (toLower(e.name) CONTAINS toLower($search) 
             OR toLower(coalesce(e.description, '')) CONTAINS toLower($search) 
             OR toLower(coalesce(e.requirements, '')) CONTAINS toLower($search) 
             OR toLower(e.venue) CONTAINS toLower($search))
      `;
    }

    if (clubId) {
      cypher += `
        MATCH (c:Club {clubId: $clubId})-[:ORGANIZES]->(e)
      `;
    } else {
      cypher += `
        OPTIONAL MATCH (c:Club)-[:ORGANIZES]->(e)
      `;
    }

    cypher += `
      OPTIONAL MATCH (regStudent:Student)-[r:REGISTERED_FOR {status: 'Registered'}]->(e)
      OPTIONAL MATCH (waitStudent:Student)-[w:REGISTERED_FOR {status: 'Waitlisted'}]->(e)
      OPTIONAL MATCH (attStudent:Student)-[:ATTENDED]->(e)
      WITH e, c, 
           count(DISTINCT regStudent) AS registeredCount,
           count(DISTINCT waitStudent) AS waitlistedCount,
           count(DISTINCT attStudent) AS attendedCount
      RETURN e.eventId AS eventId,
             e.name AS name,
             e.type AS type,
             e.description AS description,
             e.requirements AS requirements,
             e.venue AS venue,
             e.startDateTime AS startDateTime,
             e.endDateTime AS endDateTime,
             e.registrationDeadline AS registrationDeadline,
             e.maxParticipants AS maxParticipants,
             e.maxTeamSize AS maxTeamSize,
             e.status AS status,
             e.rejectionReason AS rejectionReason,
             e.createdTimestamp AS createdTimestamp,
             c.clubId AS clubId,
             c.name AS clubName,
             registeredCount,
             waitlistedCount,
             attendedCount,
             (e.maxParticipants - registeredCount) AS seatsLeft
      ORDER BY e.startDateTime ASC
      SKIP toInteger($skip)
      LIMIT toInteger($limit)
    `;

    const result = await executeQuery(cypher, {
      status: status || null,
      type: type || null,
      search: search || null,
      clubId: clubId || null,
      skip: Number(skip),
      limit: Number(limit)
    });

    return recordsToObjects(result.records);
  }

  async getEventById(eventId, currentStudentId = null) {
    const cypher = `
      MATCH (e:Event {eventId: $eventId})
      OPTIONAL MATCH (c:Club)-[:ORGANIZES]->(e)
      OPTIONAL MATCH (regStudent:Student)-[r:REGISTERED_FOR {status: 'Registered'}]->(e)
      OPTIONAL MATCH (waitStudent:Student)-[w:REGISTERED_FOR {status: 'Waitlisted'}]->(e)
      OPTIONAL MATCH (attStudent:Student)-[:ATTENDED]->(e)
      OPTIONAL MATCH (t:Team)-[:FOR_EVENT]->(e)
      OPTIONAL MATCH (curStudent:Student {studentId: $currentStudentId})-[curReg:REGISTERED_FOR]->(e)
      OPTIONAL MATCH (curStudent)-[:ATTENDED]->(e)
      OPTIONAL MATCH (curStudent)-[curWon:WON]->(e)
      OPTIONAL MATCH (curStudent)-[curFb:GAVE_FEEDBACK]->(e)
      OPTIONAL MATCH (curStudent)-[:IN_TEAM]->(curTeam:Team)-[:FOR_EVENT]->(e)
      
      WITH e, c,
           count(DISTINCT regStudent) AS registeredCount,
           count(DISTINCT waitStudent) AS waitlistedCount,
           count(DISTINCT attStudent) AS attendedCount,
           count(DISTINCT t) AS teamCount,
           curReg,
           curWon,
           curFb,
           curTeam

      RETURN e.eventId AS eventId,
             e.name AS name,
             e.type AS type,
             e.description AS description,
             e.requirements AS requirements,
             e.venue AS venue,
             e.startDateTime AS startDateTime,
             e.endDateTime AS endDateTime,
             e.registrationDeadline AS registrationDeadline,
             e.maxParticipants AS maxParticipants,
             e.maxTeamSize AS maxTeamSize,
             e.status AS status,
             e.rejectionReason AS rejectionReason,
             e.createdTimestamp AS createdTimestamp,
             c.clubId AS clubId,
             c.name AS clubName,
             registeredCount,
             waitlistedCount,
             attendedCount,
             teamCount,
             (e.maxParticipants - registeredCount) AS seatsLeft,
             curReg.status AS userRegistrationStatus,
             curReg.registrationId AS userRegistrationId,
             curTeam.teamId AS userTeamId,
             curTeam.name AS userTeamName,
             curWon.position AS userWonPosition,
             curWon.prize AS userWonPrize,
             curFb.rating AS userFeedbackRating,
             curFb.comment AS userFeedbackComment
    `;

    const result = await executeQuery(cypher, { eventId, currentStudentId: currentStudentId || null });
    const events = recordsToObjects(result.records);
    return events[0] || null;
  }

  async checkVenueClash(venue, startDateTime, endDateTime, excludeEventId = null) {
    const cypher = `
      MATCH (other:Event)
      WHERE other.venue = $venue
        AND other.status = 'Approved'
        AND ($excludeEventId IS NULL OR other.eventId <> $excludeEventId)
        AND other.startDateTime < $endDateTime
        AND other.endDateTime > $startDateTime
      RETURN other.eventId AS clashingEventId,
             other.name AS clashingEventName,
             other.startDateTime AS clashingStart,
             other.endDateTime AS clashingEnd
    `;
    const result = await executeQuery(cypher, {
      venue,
      startDateTime,
      endDateTime,
      excludeEventId: excludeEventId || null
    });
    return recordsToObjects(result.records);
  }

  async createEvent({
    eventId,
    clubId,
    name,
    type,
    description,
    requirements,
    venue,
    startDateTime,
    endDateTime,
    registrationDeadline,
    maxParticipants,
    maxTeamSize
  }) {
    const cypher = `
      MATCH (c:Club {clubId: $clubId})
      CREATE (e:Event {
        eventId: $eventId,
        name: $name,
        type: $type,
        description: $description,
        requirements: $requirements,
        venue: $venue,
        startDateTime: $startDateTime,
        endDateTime: $endDateTime,
        registrationDeadline: $registrationDeadline,
        maxParticipants: toInteger($maxParticipants),
        maxTeamSize: toInteger($maxTeamSize),
        status: 'Pending',
        createdTimestamp: toString(datetime())
      })
      CREATE (c)-[:ORGANIZES]->(e)
      RETURN e
    `;
    const result = await executeQuery(cypher, {
      eventId,
      clubId,
      name,
      type,
      description,
      requirements: requirements || '',
      venue,
      startDateTime,
      endDateTime,
      registrationDeadline,
      maxParticipants,
      maxTeamSize
    });
    return recordsToObjects(result.records)[0]?.e;
  }

  async approveEvent(eventId, adminId) {
    const cypher = `
      MATCH (e:Event {eventId: $eventId}), (a:Admin {adminId: $adminId})
      SET e.status = 'Approved'
      MERGE (a)-[app:APPROVED]->(e)
      SET app.approvalTime = toString(datetime())
      RETURN e.eventId AS eventId, e.status AS status, app.approvalTime AS approvedAt
    `;
    const result = await executeQuery(cypher, { eventId, adminId });
    return recordsToObjects(result.records)[0] || null;
  }

  async notifyOrganizers(eventId, title, message) {
    try {
      const cypher = `
        MATCH (e:Event {eventId: $eventId})<-[:ORGANIZES]-(c:Club)
        MATCH (s:Student)-[m:MEMBER_OF_CLUB|PRESIDENT_OF]->(c)
        WHERE m.role IN ['President', 'Organizer'] OR type(m) = 'PRESIDENT_OF'
        CREATE (n:Notification {
          notificationId: 'notif-' + toString(datetime().epochMillis) + '-' + s.studentId,
          title: $title,
          message: $message,
          status: 'Unread',
          createdTimestamp: toString(datetime())
        })
        MERGE (s)-[:RECEIVED]->(n)
        RETURN count(n) AS notifsSent
      `;
      await executeQuery(cypher, { eventId, title, message });
    } catch (e) {
      console.warn('Could not send notification to organizers:', e.message);
    }
  }

  async rejectEvent(eventId, reason = 'Rejected by Admin') {
    const cypher = `
      MATCH (e:Event {eventId: $eventId})
      SET e.status = 'Rejected', e.rejectionReason = $reason
      RETURN e.eventId AS eventId, e.status AS status
    `;
    const result = await executeQuery(cypher, { eventId, reason });
    return recordsToObjects(result.records)[0] || null;
  }

  async cancelEvent(eventId) {
    const cypher = `
      MATCH (e:Event {eventId: $eventId})
      SET e.status = 'Cancelled'
      RETURN e.eventId AS eventId, e.status AS status
    `;
    const result = await executeQuery(cypher, { eventId });
    return recordsToObjects(result.records)[0] || null;
  }

  async completeEvent(eventId) {
    const cypher = `
      MATCH (e:Event {eventId: $eventId})
      SET e.status = 'Completed'
      RETURN e.eventId AS eventId, e.status AS status
    `;
    const result = await executeQuery(cypher, { eventId });
    return recordsToObjects(result.records)[0] || null;
  }
}

module.exports = new EventRepository();
