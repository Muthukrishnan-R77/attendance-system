const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateToken } = require('../utils/jwt');
const { isValidEmail } = require('../utils/validator');

/**
 * POST /api/auth/login
 * Public endpoint for user authentication
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Basic Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format.'
      });
    }

    // Fetch user from database
    const result = await db.query(
      `SELECT * FROM users WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = result.rows[0];

    // Verify password match using bcrypt
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = generateToken(tokenPayload);

    // Return response without sensitive password field
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || '',
        role: user.role
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Protected endpoint returning logged-in user profile
 */
async function getMe(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT id, name, email, phone, department, position, role, created_at FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  getMe
};
