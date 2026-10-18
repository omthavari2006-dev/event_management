const registrationRepository = require('../repositories/registrationRepository');
const eventRepository = require('../repositories/eventRepository');

class RegistrationService {
  async register(studentId, eventId) {
    const event = await eventRepository.getEventById(eventId);
    if (!event) {
      throw new Error('Event not found.');
    }

    if (event.status !== 'Approved') {
      throw new Error(`Cannot register for event with status: ${event.status}`);
    }

    // Check student personal timetable clash
    const timeClashes = await registrationRepository.checkStudentTimeClash(
      studentId,
      event.startDateTime,
      event.endDateTime,
      eventId
    );

    let warning = null;
    if (timeClashes.length > 0) {
      warning = `Time overlap detected with your registered event: "${timeClashes[0].clashingEventName}".`;
    }

    const regResult = await registrationRepository.registerStudent({ studentId, eventId });
    return {
      ...regResult,
      warning
    };
  }

  async cancel(studentId, eventId) {
    return registrationRepository.cancelRegistration(studentId, eventId);
  }

  async getMyRegistrations(studentId) {
    return registrationRepository.getStudentRegistrations(studentId);
  }

  async getEventRegistrations(eventId) {
    return registrationRepository.getEventRegistrations(eventId);
  }
}

module.exports = new RegistrationService();
