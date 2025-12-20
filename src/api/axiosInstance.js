// ==========================================
// Axios HTTP Client Instance
// ==========================================
import axios from 'axios';
import { API_CONFIG } from '../constants/api';

/**
 * Create Axios instance dengan konfigurasi default
 * Includes: timeout, interceptors untuk token, error handling
 */
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request Interceptor
 * Tambahkan token ke header untuk setiap request
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('madura_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle error response dan refresh token jika expired
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear dan redirect ke login
      localStorage.removeItem('madura_token');
      localStorage.removeItem('madura_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
