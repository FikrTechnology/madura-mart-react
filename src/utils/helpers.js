// ==========================================
// Helper Utility Functions
// ==========================================

/**
 * Format currency ke Rupiah
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Format date ke format readable
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

/**
 * Validasi email
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validasi password (minimal 6 karakter)
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate form data dengan rules
 * @param {Object} data - Form data
 * @param {Object} rules - Validation rules
 * @returns {Object} - Error messages
 */
export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];

    // Required validation
    if (rule.required && !value) {
      errors[field] = `${field} harus diisi`;
    }

    // Email validation
    if (rule.type === 'email' && value && !isValidEmail(value)) {
      errors[field] = 'Email tidak valid';
    }

    // Min length validation
    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `${field} minimal ${rule.minLength} karakter`;
    }

    // Max length validation
    if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = `${field} maksimal ${rule.maxLength} karakter`;
    }

    // Custom validation
    if (rule.custom && value) {
      const customError = rule.custom(value);
      if (customError) {
        errors[field] = customError;
      }
    }
  });

  return errors;
};

/**
 * Delay function untuk debouncing
 */
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};
