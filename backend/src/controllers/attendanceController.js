const attendanceService = require('../services/attendanceService');
const asyncHandler = require('../utils/asyncHandler');

const markAttendance = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { studentIds } = req.body;
  if (!studentIds) {
    return res.status(400).json({ success: false, message: 'studentIds array is required.' });
  }
  const result = await attendanceService.markAttendance(eventId, studentIds);
  res.status(200).json({ success: true, count: result.length, result, message: 'Attendance marked successfully.' });
});

const getAttendees = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const attendees = await attendanceService.getAttendees(eventId);
  res.status(200).json({ success: true, count: attendees.length, attendees });
});

module.exports = {
  markAttendance,
  getAttendees
};
