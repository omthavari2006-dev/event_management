const { executeQuery } = require('../config/db');
const { recordsToObjects } = require('../utils/neo4jUtils');
const { v4: uuidv4 } = require('uuid');

class FeedbackRepository {
  /**
   * Submit Feedback: Only attendees can leave feedback.
   * MERGE on relationship ensures 1 feedback per student per event.
   */
  async submitFeedback({ studentId, eventId, rating, comment }) {
    const feedbackId = `fb-${uuidv4().substring(0, 8)}`;
    const cypher = `
      MATCH (s:Student {studentId: $studentId})-[:ATTENDED]->(e:Event {eventId: $eventId})
      MERGE (s)-[fb:GAVE_FEEDBACK]->(e)
      SET fb.feedbackId = coalesce(fb.feedbackId, $feedbackId),
          fb.rating = toInteger($rating),
          fb.comment = $comment,
          fb.time = toString(datetime())
      RETURN s.name AS studentName,
             e.name AS eventName,
             fb.rating AS rating,
             fb.comment AS comment,
             fb.time AS submittedAt
    `;
    const result = await executeQuery(cypher, { studentId, eventId, feedbackId, rating, comment });
    const records = recordsToObjects(result.records);
    if (records.length === 0) {
      throw new Error('Only students who attended this event can submit feedback.');
    }
    return records[0];
  }

  async getEventFeedback(eventId) {
    const cypher = `
      MATCH (s:Student)-[fb:GAVE_FEEDBACK]->(e:Event {eventId: $eventId})
      RETURN fb.feedbackId AS feedbackId,
             fb.rating AS rating,
             fb.comment AS comment,
             fb.time AS time,
             s.name AS studentName,
             s.department AS department
      ORDER BY fb.time DESC
    `;
    const result = await executeQuery(cypher, { eventId });
    return recordsToObjects(result.records);
  }
}

module.exports = new FeedbackRepository();
