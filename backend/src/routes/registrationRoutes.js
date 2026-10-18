const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { authenticate } = require('../middleware/auth');
const { requireStudent, requireClubOrganizer } = require('../middleware/roles');

router.post('/:eventId', authenticate, requireStudent, registrationController.register);
router.delete('/:eventId', authenticate, requireStudent, registrationController.cancel);
router.get('/my', authenticate, requireStudent, registrationController.getMyRegistrations);
router.get('/event/:eventId', authenticate, requireClubOrganizer, registrationController.getEventRegistrations);

module.exports = router;
