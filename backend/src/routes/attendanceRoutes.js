const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate } = require('../middleware/auth');
const { requireClubOrganizer } = require('../middleware/roles');

router.post('/event/:eventId', authenticate, requireClubOrganizer, attendanceController.markAttendance);
router.get('/event/:eventId', authenticate, requireClubOrganizer, attendanceController.getAttendees);
router.delete('/event/:eventId/student/:studentId', authenticate, requireClubOrganizer, attendanceController.unmarkAttendance);

module.exports = router;
