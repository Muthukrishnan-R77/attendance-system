const bcrypt = require('bcryptjs');
const db = require('../db');
const { validateEmployeeInput } = require('../utils/validator');

/**
 * GET /api/employees
 * Admin: Retrieve all employees with optional search and filtering
 */
async function getAllEmployees(req, res, next) {
  try {
    const { search, department, role } = req.query;

    let queryText = `
      SELECT id, name, email, phone, department, position, role, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      queryText += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }

    if (department && department.trim() !== '') {
      params.push(department.trim());
      queryText += ` AND department = $${params.length}`;
    }

    if (role && role.trim() !== '') {
      params.push(role.trim());
      queryText += ` AND role = $${params.length}`;
    }

    queryText += ` ORDER BY id DESC`;

    const result = await db.query(queryText, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      employees: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/employees/:id
 * Admin: Get single employee by ID
 */
async function getEmployeeById(req, res, next) {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT id, name, email, phone, department, position, role, created_at FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    return res.status(200).json({
      success: true,
      employee: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/employees
 * Admin: Create a new employee
 */
async function createEmployee(req, res, next) {
  try {
    const { name, email, password, phone, department, position, role } = req.body;

    // Validate inputs
    const errors = validateEmployeeInput(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Check if email already exists
    const existingUser = await db.query(
      `SELECT id FROM users WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Employee with this email already exists.'
      });
    }

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = (role && (role === 'ADMIN' || role === 'EMPLOYEE')) ? role : 'EMPLOYEE';

    const insertResult = await db.query(
      `INSERT INTO users (name, email, password, phone, department, position, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, phone, department, position, role, created_at`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        phone ? phone.trim() : '',
        department ? department.trim() : '',
        position ? position.trim() : '',
        assignedRole
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully.',
      employee: insertResult.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Employee with this email already exists.'
      });
    }
    next(error);
  }
}

/**
 * PUT /api/employees/:id
 * Admin: Update existing employee details
 */
async function updateEmployee(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, password, phone, department, position, role } = req.body;

    // Validate employee existence
    const checkResult = await db.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    // Validate inputs
    const errors = validateEmployeeInput(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Check duplicate email if changed
    if (email && email.toLowerCase() !== checkResult.rows[0].email.toLowerCase()) {
      const duplicateCheck = await db.query(
        `SELECT id FROM users WHERE email = $1 AND id != $2`,
        [email.trim().toLowerCase(), id]
      );
      if (duplicateCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Another employee is already registered with this email address.'
        });
      }
    }

    // Update query construction
    let updateResult;
    if (password && password.trim().length >= 6) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateResult = await db.query(
        `UPDATE users 
         SET name = $1, email = $2, password = $3, phone = $4, department = $5, position = $6, role = $7, updated_at = NOW()
         WHERE id = $8
         RETURNING id, name, email, phone, department, position, role, updated_at`,
        [
          name ? name.trim() : checkResult.rows[0].name,
          email ? email.trim().toLowerCase() : checkResult.rows[0].email,
          hashedPassword,
          phone !== undefined ? phone.trim() : checkResult.rows[0].phone,
          department ? department.trim() : checkResult.rows[0].department,
          position ? position.trim() : checkResult.rows[0].position,
          role ? role : checkResult.rows[0].role,
          id
        ]
      );
    } else {
      updateResult = await db.query(
        `UPDATE users 
         SET name = $1, email = $2, phone = $3, department = $4, position = $5, role = $6, updated_at = NOW()
         WHERE id = $7
         RETURNING id, name, email, phone, department, position, role, updated_at`,
        [
          name ? name.trim() : checkResult.rows[0].name,
          email ? email.trim().toLowerCase() : checkResult.rows[0].email,
          phone !== undefined ? phone.trim() : checkResult.rows[0].phone,
          department ? department.trim() : checkResult.rows[0].department,
          position ? position.trim() : checkResult.rows[0].position,
          role ? role : checkResult.rows[0].role,
          id
        ]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully.',
      employee: updateResult.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/employees/:id
 * Admin: Delete an employee record
 */
async function deleteEmployee(req, res, next) {
  try {
    const { id } = req.params;

    // Disallow self-deletion if logged-in admin
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.'
      });
    }

    const deleteResult = await db.query(
      `DELETE FROM users WHERE id = $1 RETURNING id, name, email`,
      [id]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found or already deleted.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Employee "${deleteResult.rows[0].name}" deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
