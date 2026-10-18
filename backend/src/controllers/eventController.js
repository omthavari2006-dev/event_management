const eventService = require('../services/eventService');
const asyncHandler = require('../utils/asyncHandler');

const getEvents = asyncHandler(async (req, res) => {
  const { status, type, search, limit, skip } = req.query;
  const events = await eventService.listEvents({ status, type, search, limit, skip });
  res.status(200).json({ success: true, count: events.length, events });
});

const getEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const currentStudentId = req.user ? req.user.id : null;
  const event = await eventService.getEvent(eventId, currentStudentId);
  res.status(200).json({ success: true, event });
});

const createEvent = asyncHandler(async (req, res) => {
  const {
    clubId,
    name,
    type,
    description,
    venue,
    startDateTime,
    endDateTime,
    registrationDeadline,
    maxParticipants,
    maxTeamSize
  } = req.body;

  if (!clubId || !name || !venue || !startDateTime || !endDateTime) {
    return res.status(400).json({ success: false, message: 'Please provide all mandatory event fields.' });
  }

  const event = await eventService.createEvent({
    clubId,
    name,
    type,
    description,
    venue,
    startDateTime,
    endDateTime,
    registrationDeadline,
    maxParticipants: maxParticipants || 50,
    maxTeamSize: maxTeamSize || 0
  });

  res.status(201).json({ success: true, event, message: 'Event submitted for Admin review.' });
});

const approveEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const result = await eventService.approveEvent(eventId, req.user.id);
  res.status(200).json({ success: true, result, message: 'Event approved successfully.' });
});

const rejectEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { reason } = req.body;
  const result = await eventService.rejectEvent(eventId, reason);
  res.status(200).json({ success: true, result, message: 'Event rejected.' });
});

const cancelEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const result = await eventService.cancelEvent(eventId);
  res.status(200).json({ success: true, result, message: 'Event cancelled.' });
});

const completeEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const result = await eventService.completeEvent(eventId);
  res.status(200).json({ success: true, result, message: 'Event marked as completed.' });
});

const checkClash = asyncHandler(async (req, res) => {
  const { venue, startDateTime, endDateTime, eventId } = req.query;
  const clashes = await eventService.checkClash(venue, startDateTime, endDateTime, eventId);
  res.status(200).json({
    success: true,
    hasClash: clashes.length > 0,
    clashes
  });
});

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  approveEvent,
  rejectEvent,
  cancelEvent,
  completeEvent,
  checkClash
};
