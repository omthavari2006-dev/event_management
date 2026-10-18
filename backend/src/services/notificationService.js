const notificationRepository = require('../repositories/notificationRepository');

class NotificationService {
  async getMyNotifications(studentId) {
    return notificationRepository.getNotificationsByStudent(studentId);
  }

  async markAsRead(notificationId, studentId) {
    return notificationRepository.markNotificationAsRead(notificationId, studentId);
  }

  async markAllAsRead(studentId) {
    return notificationRepository.markAllAsRead(studentId);
  }
}

module.exports = new NotificationService();
