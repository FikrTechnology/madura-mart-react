// ==========================================
// API Configuration & Constants
// ==========================================

export const API_CONFIG = {
  // Ubah sesuai backend URL yang digunakan
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token'
  },

  // Products
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
    BY_OUTLET: (outletId) => `/outlets/${outletId}/products`
  },

  // Outlets
  OUTLETS: {
    LIST: '/outlets',
    GET: (id) => `/outlets/${id}`,
    CREATE: '/outlets',
    UPDATE: (id) => `/outlets/${id}`
  },

  // Transactions/Orders
  TRANSACTIONS: {
    LIST: '/transactions',
    CREATE: '/transactions',
    GET: (id) => `/transactions/${id}`,
    BY_OUTLET: (outletId) => `/outlets/${outletId}/transactions`
  },

  // Users/Employees
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Terjadi kesalahan jaringan. Periksa koneksi internet Anda.',
  SERVER_ERROR: 'Terjadi kesalahan server. Silakan coba lagi nanti.',
  VALIDATION_ERROR: 'Data tidak valid. Periksa kembali inputan Anda.',
  UNAUTHORIZED: 'Email atau password salah.',
  FORBIDDEN: 'Anda tidak memiliki akses ke resource ini.',
  NOT_FOUND: 'Data tidak ditemukan.',
  TIMEOUT: 'Request timeout. Silakan coba lagi.',
  UNKNOWN: 'Terjadi kesalahan yang tidak diketahui.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login berhasil!',
  LOGOUT_SUCCESS: 'Logout berhasil!',
  CREATE_SUCCESS: 'Data berhasil dibuat!',
  UPDATE_SUCCESS: 'Data berhasil diupdate!',
  DELETE_SUCCESS: 'Data berhasil dihapus!',
  SAVE_SUCCESS: 'Data berhasil disimpan!'
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};
