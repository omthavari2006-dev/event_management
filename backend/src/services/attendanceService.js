const attendanceRepository = require('../repositories/attendanceRepository');

class AttendanceService {
  async markAttendance(eventId, studentIds) {
    return attendanceRepository.markAttendance(eventId, studentIds);
  }

  async getAttendees(eventId) {
    return attendanceRepository.getEventAttendees(eventId);
  }
}

module.exports = new AttendanceService();
