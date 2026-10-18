const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { authenticate } = require('../middleware/auth');
const { requireStudent, requireClubOrganizer } = require('../middleware/roles');

router.post('/event/:eventId/generate', authenticate, requireClubOrganizer, certificateController.generateCertificates);
router.get('/my', authenticate, requireStudent, certificateController.getMyCertificates);
router.get('/verify', certificateController.verifyCertificate);
router.get('/:certificateId/download', certificateController.downloadCertificatePdf);

module.exports = router;
