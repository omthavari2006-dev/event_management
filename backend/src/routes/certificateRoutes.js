const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { authenticate } = require('../middleware/auth');
const { requireStudent, requireClubOrganizer } = require('../middleware/roles');

router.post('/event/:eventId/generate', authenticate, requireClubOrganizer, certificateController.generateCertificates);
router.get('/event/:eventId/attendees', authenticate, requireClubOrganizer, certificateController.getEventAttendeesWithCertificates);
router.post('/event/:eventId/student/:studentId/upload', authenticate, requireClubOrganizer, certificateController.uploadStudentCertificate);
router.get('/my', authenticate, requireStudent, certificateController.getMyCertificates);
router.get('/verify', certificateController.verifyCertificate);
router.get('/:certificateId/download', certificateController.downloadCertificatePdf);
router.get('/:certificateId/file', certificateController.downloadCertificateFile);

module.exports = router;
