const { executeQuery } = require('../config/db');
const { recordsToObjects } = require('../utils/neo4jUtils');

class NotificationRepository {
  async getNotificationsByStudent(studentId) {
    const cypher = `
      MATCH (s:Student {studentId: $studentId})-[:RECEIVED]->(n:Notification)
      RETURN n.notificationId AS notificationId,
             n.title AS title,
             n.message AS message,
             n.status AS status,
             n.createdTimestamp AS createdTimestamp
      ORDER BY n.createdTimestamp DESC
    `;
    const result = await executeQuery(cypher, { studentId });
    return recordsToObjects(result.records);
  }

  async markNotificationAsRead(notificationId, studentId) {
    const cypher = `
      MATCH (s:Student {studentId: $studentId})-[:RECEIVED]->(n:Notification {notificationId: $notificationId})
      SET n.status = 'Read'
      RETURN n.notificationId AS notificationId, n.status AS status
    `;
    const result = await executeQuery(cypher, { studentId, notificationId });
    return recordsToObjects(result.records)[0] || null;
  }

  async markAllAsRead(studentId) {
    const cypher = `
      MATCH (s:Student {studentId: $studentId})-[:RECEIVED]->(n:Notification {status: 'Unread'})
      SET n.status = 'Read'
      RETURN count(n) AS updatedCount
    `;
    const result = await executeQuery(cypher, { studentId });
    return recordsToObjects(result.records)[0];
  }
}

module.exports = new NotificationRepository();
