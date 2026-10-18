const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin, requireStudent, requireClubOrganizer } = require('../middleware/roles');

router.get('/', clubController.getClubs);
router.get('/:clubId', clubController.getClub);
router.post('/request', authenticate, requireStudent, clubController.requestClub);
router.put('/:clubId/approve', authenticate, requireAdmin, clubController.approveClub);
router.post('/:clubId/members', authenticate, requireClubOrganizer, clubController.addMember);

module.exports = router;
