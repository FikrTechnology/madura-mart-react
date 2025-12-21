// ==========================================
// Helper Utility Functions
// ==========================================

/**
 * Format currency ke Rupiah
 * @param amount - Nominal amount untuk di-format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date ke format readable (Indonesia)
 * @param date - Date object atau date string
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * Validasi format email
 * @param email - Email string untuk di-validasi
 * @returns true jika email valid
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validasi password (minimal 6 karakter)
 * @param password - Password string untuk di-validasi
 * @returns true jika password valid
 */
export const isValidPassword = (password: string): boolean => {
  return !!(password && password.length >= 6);
};

// Validation rule types
export interface ValidationRule {
  required?: boolean;
  type?: 'email' | 'password' | 'text' | 'number';
  minLength?: number;
  maxLength?: number;
  custom?: (value: any) => string | undefined;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

/**
 * Validate form data dengan rules
 * @param data - Form data object
 * @param rules - Validation rules object
 * @returns Object dengan error messages (empty jika valid)
 */
export const validateForm = (
  data: Record<string, any>,
  rules: ValidationRules
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach((field) => {
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
 * Delay function untuk debouncing/throttling
 * @param ms - Milliseconds untuk delay
 * @returns Promise yang resolve setelah ms
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Truncate text dengan ellipsis
 * @param text - Text string untuk di-truncate
 * @param maxLength - Maksimal panjang text (default: 50)
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text) return '';
  return text.length > maxLength
    ? `${text.substring(0, maxLength)}...`
    : text;
};

/**
 * Check apakah value adalah number
 * @param value - Value untuk di-check
 * @returns true jika value adalah number
 */
export const isNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

/**
 * Check apakah value adalah string kosong
 * @param value - Value untuk di-check
 * @returns true jika value kosong
 */
export const isEmpty = (value: any): boolean => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
};

/**
 * Deep clone object
 * @param obj - Object untuk di-clone
 * @returns Cloned object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};
