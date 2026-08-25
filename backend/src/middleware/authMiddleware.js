const { verifyToken } = require('../utils/jwt');

// Middleware to verify JWT Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authorization token required.'
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Attach user payload to request
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
}

// Middleware to authorize specific role(s) (e.g. ADMIN)
function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access this resource.'
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRole
};
