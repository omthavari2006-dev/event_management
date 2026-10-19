const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireAdmin, requireClubOrganizer } = require('../middleware/roles');

router.get('/', optionalAuth, eventController.getEvents);
router.get('/clash-check', eventController.checkClash);
router.get('/:eventId', optionalAuth, eventController.getEvent);
router.post('/', authenticate, requireClubOrganizer, eventController.createEvent);
router.put('/:eventId/approve', authenticate, requireAdmin, eventController.approveEvent);
router.put('/:eventId/reject', authenticate, requireAdmin, eventController.rejectEvent);
router.put('/:eventId/cancel', authenticate, requireClubOrganizer, eventController.cancelEvent);
router.put('/:eventId/complete', authenticate, requireClubOrganizer, eventController.completeEvent);

module.exports = router;
