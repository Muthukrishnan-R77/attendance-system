const db = require('../db');

/**
 * Helper to get current YYYY-MM-DD string in local time
 */
function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Store timestamps in local wall clock time so displayed values match the user's real-time clock.
 */
function formatLocalDateTimeForStorage(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Helper to format attendance_date reliably to YYYY-MM-DD string
 */
function formatAttendanceRow(row) {
  if (!row) return row;
  let dateStr = row.attendance_date;
  if (dateStr instanceof Date) {
    const y = dateStr.getFullYear();
    const m = String(dateStr.getMonth() + 1).padStart(2, '0');
    const d = String(dateStr.getDate()).padStart(2, '0');
    dateStr = `${y}-${m}-${d}`;
  } else if (dateStr) {
    dateStr = String(dateStr).slice(0, 10);
  }
  return {
    ...row,
    attendance_date: dateStr
  };
}

/**
 * POST /api/attendance/check-in
 * Employee checks in for today
 */
async function checkIn(req, res, next) {
  try {
    const userId = req.user.id;
    const todayStr = getTodayDateString();
    const now = new Date();
    const nowLocal = formatLocalDateTimeForStorage(now);

    // Check if already checked in today
    const existingCheck = await db.query(
      `SELECT * FROM attendance WHERE user_id = $1 AND attendance_date = $2`,
      [userId, todayStr]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today.'
      });
    }

    // Insert new attendance record
    const insertResult = await db.query(
      `INSERT INTO attendance (user_id, attendance_date, check_in, check_out, status)
       VALUES ($1, $2, $3, NULL, 'PRESENT')
       RETURNING id, user_id, attendance_date, check_in, check_out, status`,
      [userId, todayStr, nowLocal]
    );

    return res.status(201).json({
      success: true,
      message: 'Check-in recorded successfully.',
      attendance: formatAttendanceRow(insertResult.rows[0])
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today.'
      });
    }
    next(error);
  }
}

/**
 * POST /api/attendance/check-out
 * Employee checks out for today
 */
async function checkOut(req, res, next) {
  try {
    const userId = req.user.id;
    const todayStr = getTodayDateString();
    const now = new Date();
    const nowLocal = formatLocalDateTimeForStorage(now);

    // Find today's check-in record
    const existingCheck = await db.query(
      `SELECT * FROM attendance WHERE user_id = $1 AND attendance_date = $2`,
      [userId, todayStr]
    );

    if (existingCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot check out before checking in. Please check in first.'
      });
    }

    const attendanceRecord = existingCheck.rows[0];

    if (attendanceRecord.check_out) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today.'
      });
    }

    // Update checkout time
    const updateResult = await db.query(
      `UPDATE attendance 
       SET check_out = $1
       WHERE id = $2
       RETURNING id, user_id, attendance_date, check_in, check_out, status`,
      [nowLocal, attendanceRecord.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Check-out recorded successfully.',
      attendance: formatAttendanceRow(updateResult.rows[0])
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/attendance
 * Admin: Get attendance history of all employees with filters
 */
async function getAllAttendance(req, res, next) {
  try {
    const { employee_id, date, status } = req.query;

    let queryText = `
      SELECT 
        a.id, 
        a.user_id, 
        u.name as employee_name, 
        u.email as employee_email, 
        u.department, 
        a.attendance_date::text as attendance_date, 
        a.check_in, 
        a.check_out, 
        a.status
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (employee_id && employee_id.trim() !== '') {
      params.push(parseInt(employee_id.trim(), 10));
      queryText += ` AND a.user_id = $${params.length}`;
    }

    if (date && date.trim() !== '') {
      params.push(date.trim());
      queryText += ` AND a.attendance_date = $${params.length}`;
    }

    if (status && status.trim() !== '') {
      params.push(status.trim());
      queryText += ` AND a.status = $${params.length}`;
    }

    queryText += ` ORDER BY a.attendance_date DESC, a.id DESC`;

    const result = await db.query(queryText, params);
    const rows = result.rows.map(formatAttendanceRow);

    return res.status(200).json({
      success: true,
      count: rows.length,
      attendance: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/attendance/my
 * Employee: Get own attendance history
 */
async function getMyAttendance(req, res, next) {
  try {
    const userId = req.user.id;
    const { date, status } = req.query;

    let queryText = `
      SELECT 
        a.id, 
        a.user_id, 
        u.name as employee_name, 
        a.attendance_date::text as attendance_date, 
        a.check_in, 
        a.check_out, 
        a.status
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id = $1
    `;
    const params = [userId];

    if (date && date.trim() !== '') {
      params.push(date.trim());
      queryText += ` AND a.attendance_date = $${params.length}`;
    }

    if (status && status.trim() !== '') {
      params.push(status.trim());
      queryText += ` AND a.status = $${params.length}`;
    }

    queryText += ` ORDER BY a.attendance_date DESC, a.id DESC`;

    const result = await db.query(queryText, params);
    const rows = result.rows.map(formatAttendanceRow);

    return res.status(200).json({
      success: true,
      count: rows.length,
      attendance: rows
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  checkIn,
  checkOut,
  getAllAttendance,
  getMyAttendance
};
