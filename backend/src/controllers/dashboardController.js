const db = require('../db');

/**
 * GET /api/dashboard/stats
 * Admin: Return real-time attendance statistics
 */
async function getDashboardStats(req, res, next) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Compute stats
    const queryText = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'EMPLOYEE') AS total_employees,
        (SELECT COUNT(*) FROM attendance WHERE attendance_date = $1 AND status = 'PRESENT') AS present_today,
        (SELECT COUNT(*) FROM attendance WHERE attendance_date = $1 AND check_in IS NOT NULL) AS checked_in
    `;

    const result = await db.query(queryText, [todayStr]);
    const row = result.rows[0] || {};

    const totalEmployees = parseInt(row.total_employees || '0', 10);
    const presentToday = parseInt(row.present_today || '0', 10);
    const checkedIn = parseInt(row.checked_in || '0', 10);
    const absentToday = Math.max(0, totalEmployees - presentToday);

    return res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        presentToday,
        absentToday,
        checkedIn
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats
};
