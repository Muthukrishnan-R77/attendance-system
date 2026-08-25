const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Authenticated user check-in / check-out / own attendance
router.post('/check-in', authenticateToken, attendanceController.checkIn);
router.post('/check-out', authenticateToken, attendanceController.checkOut);
router.get('/my', authenticateToken, attendanceController.getMyAttendance);

// Admin-only route to view all employee attendance
router.get('/', authenticateToken, authorizeRole('ADMIN'), attendanceController.getAllAttendance);

module.exports = router;
