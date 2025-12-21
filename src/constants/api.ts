/**
 * API Configuration & Constants
 */

interface ApiEndpoints {
  AUTH: {
    LOGIN: string;
    LOGOUT: string;
    REGISTER: string;
    REFRESH_TOKEN: string;
  };
  PRODUCTS: {
    LIST: string;
    CREATE: string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
    BY_OUTLET: (outletId: string) => string;
  };
  OUTLETS: {
    LIST: string;
    GET: (id: string) => string;
    CREATE: string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
  };
  TRANSACTIONS: {
    LIST: string;
    CREATE: string;
    GET: (id: string) => string;
    BY_OUTLET: (outletId: string) => string;
  };
  USERS: {
    LIST: string;
    CREATE: string;
    GET: (id: string) => string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
  };
}

interface ApiConfig {
  BASE_URL: string;
  TIMEOUT: number;
  RETRY_ATTEMPTS: number;
}

interface ErrorMessagesMap {
  NETWORK_ERROR: string;
  SERVER_ERROR: string;
  VALIDATION_ERROR: string;
  UNAUTHORIZED: string;
  FORBIDDEN: string;
  NOT_FOUND: string;
  TIMEOUT: string;
  UNKNOWN: string;
}

interface SuccessMessagesMap {
  LOGIN_SUCCESS: string;
  LOGOUT_SUCCESS: string;
  CREATE_SUCCESS: string;
  UPDATE_SUCCESS: string;
  DELETE_SUCCESS: string;
  SAVE_SUCCESS: string;
}

interface HttpStatusCodes {
  OK: number;
  CREATED: number;
  BAD_REQUEST: number;
  UNAUTHORIZED: number;
  FORBIDDEN: number;
  NOT_FOUND: number;
  CONFLICT: number;
  SERVER_ERROR: number;
  SERVICE_UNAVAILABLE: number;
}

export const API_CONFIG: ApiConfig = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

export const API_ENDPOINTS: ApiEndpoints = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token'
  },

  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    BY_OUTLET: (outletId: string) => `/products/outlet/${outletId}`
  },

  OUTLETS: {
    LIST: '/outlets',
    GET: (id: string) => `/outlets/${id}`,
    CREATE: '/outlets',
    UPDATE: (id: string) => `/outlets/${id}`,
    DELETE: (id: string) => `/outlets/${id}`
  },

  TRANSACTIONS: {
    LIST: '/transactions',
    CREATE: '/transactions',
    GET: (id: string) => `/transactions/${id}`,
    BY_OUTLET: (outletId: string) => `/transactions/outlet/${outletId}`
  },

  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`
  }
};

export const ERROR_MESSAGES: ErrorMessagesMap = {
  NETWORK_ERROR: 'Terjadi kesalahan jaringan. Periksa koneksi internet Anda.',
  SERVER_ERROR: 'Terjadi kesalahan server. Silakan coba lagi nanti.',
  VALIDATION_ERROR: 'Data tidak valid. Periksa kembali inputan Anda.',
  UNAUTHORIZED: 'Email atau password salah.',
  FORBIDDEN: 'Anda tidak memiliki akses ke resource ini.',
  NOT_FOUND: 'Data tidak ditemukan.',
  TIMEOUT: 'Request timeout. Silakan coba lagi.',
  UNKNOWN: 'Terjadi kesalahan yang tidak diketahui.'
};

export const SUCCESS_MESSAGES: SuccessMessagesMap = {
  LOGIN_SUCCESS: 'Login berhasil!',
  LOGOUT_SUCCESS: 'Logout berhasil!',
  CREATE_SUCCESS: 'Data berhasil dibuat!',
  UPDATE_SUCCESS: 'Data berhasil diupdate!',
  DELETE_SUCCESS: 'Data berhasil dihapus!',
  SAVE_SUCCESS: 'Data berhasil disimpan!'
};

export const HTTP_STATUS: HttpStatusCodes = {
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
