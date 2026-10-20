const attendanceRepository = require('../repositories/attendanceRepository');
const eventRepository = require('../repositories/eventRepository');

class AttendanceService {
  async markAttendance(eventId, studentIds) {
    const event = await eventRepository.getEventById(eventId);
    if (!event) {
      throw new Error('Event not found.');
    }

    if (event.status !== 'Approved') {
      throw new Error(`Cannot record attendance. Event status is '${event.status}'.`);
    }

    const now = new Date();
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);

    if (now < start) {
      throw new Error(
        `Attendance check-in is not open yet. Attendance can ONLY be taken during the ongoing phase (event starts at ${start.toLocaleString()}).`
      );
    }

    if (now > end || event.status === 'Completed') {
      throw new Error(
        `Attendance can only be recorded while the event is ongoing. This event has already concluded.`
      );
    }

    return attendanceRepository.markAttendance(eventId, studentIds);
  }

  async getAttendees(eventId) {
    return attendanceRepository.getEventAttendees(eventId);
  }

  async unmarkAttendance(eventId, studentId) {
    const event = await eventRepository.getEventById(eventId);
    if (!event) {
      throw new Error('Event not found.');
    }

    if (event.status === 'Completed') {
      throw new Error('Event is marked Completed. Attendance cannot be modified.');
    }

    const now = new Date();
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);

    if (now < start) {
      throw new Error(`Event has not started yet.`);
    }

    if (now > end) {
      throw new Error(`Event has already concluded. Attendance cannot be modified.`);
    }

    return attendanceRepository.unmarkAttendance(eventId, studentId);
  }
}

module.exports = new AttendanceService();
