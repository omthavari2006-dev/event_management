const registrationService = require('../services/registrationService');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const result = await registrationService.register(req.user.id, eventId);
  res.status(200).json({ success: true, ...result });
});

const cancel = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const result = await registrationService.cancel(req.user.id, eventId);
  res.status(200).json({ success: true, ...result });
});

const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await registrationService.getMyRegistrations(req.user.id);
  res.status(200).json({ success: true, count: registrations.length, registrations });
});

const getEventRegistrations = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const registrations = await registrationService.getEventRegistrations(eventId);
  res.status(200).json({ success: true, count: registrations.length, registrations });
});

module.exports = {
  register,
  cancel,
  getMyRegistrations,
  getEventRegistrations
};
