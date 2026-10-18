const { executeQuery, executeWriteTransaction } = require('../config/db');
const { recordsToObjects } = require('../utils/neo4jUtils');
const { v4: uuidv4 } = require('uuid');

class TeamRepository {
  async createTeam({ studentId, eventId, teamName }) {
    return executeWriteTransaction(async (tx) => {
      // 1. Check event allows teams and student is Registered
      const checkQuery = `
        MATCH (s:Student {studentId: $studentId})-[reg:REGISTERED_FOR {status: 'Registered'}]->(e:Event {eventId: $eventId})
        WHERE e.maxTeamSize > 0
        OPTIONAL MATCH (s)-[:IN_TEAM]->(existingTeam:Team)-[:FOR_EVENT]->(e)
        RETURN e.maxTeamSize AS maxTeamSize, existingTeam
      `;
      const checkRes = await tx.run(checkQuery, { studentId, eventId });
      const records = recordsToObjects(checkRes.records);

      if (records.length === 0) {
        throw new Error('Student is not registered for this event or event is an individual event (maxTeamSize = 0).');
      }

      if (records[0].existingTeam) {
        throw new Error('Student already belongs to a team for this event.');
      }

      const teamId = `team-${uuidv4().substring(0, 8)}`;

      // 2. Create team, link to event, and set student as leader and member
      const createQuery = `
        MATCH (s:Student {studentId: $studentId}), (e:Event {eventId: $eventId})
        CREATE (t:Team {
          teamId: $teamId,
          name: $teamName,
          createdTimestamp: toString(datetime())
        })
        CREATE (t)-[:FOR_EVENT]->(e)
        CREATE (s)-[:LEADS]->(t)
        CREATE (s)-[:IN_TEAM {joinedTime: toString(datetime())}]->(t)
        RETURN t.teamId AS teamId, t.name AS teamName, e.name AS eventName
      `;
      const createRes = await tx.run(createQuery, { studentId, eventId, teamId, teamName });
      return recordsToObjects(createRes.records)[0];
    });
  }

  async addTeamMember({ teamId, leaderId, memberStudentId }) {
    return executeWriteTransaction(async (tx) => {
      // 1. Verify leader owns team, event team size limit, and member registration status
      const checkQuery = `
        MATCH (leader:Student {studentId: $leaderId})-[:LEADS]->(t:Team {teamId: $teamId})-[:FOR_EVENT]->(e:Event)
        MATCH (member:Student {studentId: $memberStudentId})-[reg:REGISTERED_FOR {status: 'Registered'}]->(e)
        OPTIONAL MATCH (existingMembers:Student)-[:IN_TEAM]->(t)
        OPTIONAL MATCH (member)-[:IN_TEAM]->(otherTeam:Team)-[:FOR_EVENT]->(e)
        RETURN e.maxTeamSize AS maxTeamSize,
               count(DISTINCT existingMembers) AS currentMemberCount,
               otherTeam
      `;
      const checkRes = await tx.run(checkQuery, { teamId, leaderId, memberStudentId });
      const records = recordsToObjects(checkRes.records);

      if (records.length === 0) {
        throw new Error('Leader unauthorized, team not found, or student is not registered for this event.');
      }

      const { maxTeamSize, currentMemberCount, otherTeam } = records[0];

      if (otherTeam) {
        throw new Error('The target student is already in a team for this event.');
      }

      if (currentMemberCount >= maxTeamSize) {
        throw new Error(`Team is full! Maximum team size is ${maxTeamSize}.`);
      }

      // 2. Add member
      const addQuery = `
        MATCH (member:Student {studentId: $memberStudentId}), (t:Team {teamId: $teamId})
        MERGE (member)-[inTeam:IN_TEAM]->(t)
        ON CREATE SET inTeam.joinedTime = toString(datetime())
        RETURN member.name AS memberName, t.name AS teamName
      `;
      const addRes = await tx.run(addQuery, { memberStudentId, teamId });
      return recordsToObjects(addRes.records)[0];
    });
  }

  async getTeamsByEvent(eventId) {
    const cypher = `
      MATCH (t:Team)-[:FOR_EVENT]->(e:Event {eventId: $eventId})
      OPTIONAL MATCH (leader:Student)-[:LEADS]->(t)
      OPTIONAL MATCH (m:Student)-[inTeam:IN_TEAM]->(t)
      RETURN t.teamId AS teamId,
             t.name AS teamName,
             leader.studentId AS leaderId,
             leader.name AS leaderName,
             collect(DISTINCT {
               studentId: m.studentId,
               name: m.name,
               department: m.department,
               joinedTime: inTeam.joinedTime,
               isLeader: (m.studentId = leader.studentId)
             }) AS members
      ORDER BY t.createdTimestamp ASC
    `;
    const result = await executeQuery(cypher, { eventId });
    return recordsToObjects(result.records);
  }
}

module.exports = new TeamRepository();
