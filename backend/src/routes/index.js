const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const clubRoutes = require('./clubRoutes');
const eventRoutes = require('./eventRoutes');
const registrationRoutes = require('./registrationRoutes');
const teamRoutes = require('./teamRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const winnerRoutes = require('./winnerRoutes');
const certificateRoutes = require('./certificateRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const notificationRoutes = require('./notificationRoutes');
const recommendationRoutes = require('./recommendationRoutes');
const analyticsRoutes = require('./analyticsRoutes');

router.use('/auth', authRoutes);
router.use('/clubs', clubRoutes);
router.use('/events', eventRoutes);
router.use('/registrations', registrationRoutes);
router.use('/teams', teamRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/winners', winnerRoutes);
router.use('/certificates', certificateRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/notifications', notificationRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/analytics', analyticsRoutes);

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Campus Event Management Backend (Neo4j)'
  });
});

module.exports = router;
