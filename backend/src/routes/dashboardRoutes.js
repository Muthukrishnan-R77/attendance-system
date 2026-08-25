const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// GET /api/dashboard/stats (Admin only)
router.get('/stats', authenticateToken, authorizeRole('ADMIN'), dashboardController.getDashboardStats);

module.exports = router;
