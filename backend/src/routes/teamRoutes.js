const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticate } = require('../middleware/auth');
const { requireStudent } = require('../middleware/roles');

router.post('/event/:eventId', authenticate, requireStudent, teamController.createTeam);
router.post('/:teamId/members', authenticate, requireStudent, teamController.addMember);
router.get('/event/:eventId', teamController.getTeams);

module.exports = router;
