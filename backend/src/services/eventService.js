const eventRepository = require('../repositories/eventRepository');
const { v4: uuidv4 } = require('uuid');

class EventService {
  async listEvents(query) {
    return eventRepository.getAllEvents(query);
  }

  async getEvent(eventId, currentStudentId) {
    const event = await eventRepository.getEventById(eventId, currentStudentId);
    if (!event) {
      throw new Error('Event not found.');
    }
    return event;
  }

  async createEvent(eventData) {
    const eventId = `evt-${uuidv4().substring(0, 6)}`;
    return eventRepository.createEvent({
      eventId,
      ...eventData
    });
  }

  async approveEvent(eventId, adminId) {
    const event = await eventRepository.getEventById(eventId);
    if (!event) {
      throw new Error('Event not found.');
    }

    // Check for Venue Clash before approving
    const clashes = await eventRepository.checkVenueClash(
      event.venue,
      event.startDateTime,
      event.endDateTime,
      eventId
    );

    if (clashes.length > 0) {
      const clash = clashes[0];
      const err = new Error(
        `Venue Clash Detected! "${clash.clashingEventName}" is already scheduled at "${event.venue}" between ${clash.clashingStart} and ${clash.clashingEnd}.`
      );
      err.statusCode = 409;
      err.clashingEvents = clashes;
      throw err;
    }

    return eventRepository.approveEvent(eventId, adminId);
  }

  async rejectEvent(eventId, reason) {
    return eventRepository.rejectEvent(eventId, reason);
  }

  async cancelEvent(eventId) {
    return eventRepository.cancelEvent(eventId);
  }

  async completeEvent(eventId) {
    return eventRepository.completeEvent(eventId);
  }

  async checkClash(venue, startDateTime, endDateTime, eventId) {
    return eventRepository.checkVenueClash(venue, startDateTime, endDateTime, eventId);
  }
}

module.exports = new EventService();
