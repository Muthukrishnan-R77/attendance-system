// Email validation regex
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Phone validation (basic digit check)
function isValidPhone(phone) {
  if (!phone) return true; // Optional or basic validation
  const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
  return phoneRegex.test(phone.trim());
}

// Validate creation of employee
function validateEmployeeInput(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required');
    }
  }

  if (!isUpdate || data.email !== undefined) {
    if (!data.email || !isValidEmail(data.email)) {
      errors.push('A valid email address is required');
    }
  }

  if (!isUpdate) {
    if (!data.password || data.password.length < 6) {
      errors.push('Password is required and must be at least 6 characters long');
    }
  } else if (data.password && data.password.length < 6) {
    errors.push('Password must be at least 6 characters long if provided');
  }

  if (!isUpdate || data.phone !== undefined) {
    if (data.phone && !isValidPhone(data.phone)) {
      errors.push('Phone number format is invalid');
    }
  }

  if (!isUpdate || data.department !== undefined) {
    if (!data.department || data.department.trim().length === 0) {
      errors.push('Department is required');
    }
  }

  if (!isUpdate || data.position !== undefined) {
    if (!data.position || data.position.trim().length === 0) {
      errors.push('Position is required');
    }
  }

  return errors;
}

module.exports = {
  isValidEmail,
  isValidPhone,
  validateEmployeeInput
};
