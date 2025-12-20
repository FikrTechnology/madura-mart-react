// ==========================================
// Authentication Service
// Business logic untuk auth
// ==========================================
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../constants/api';
import { handleApiError } from '../api/handleApiError';

/**
 * Login dengan email dan password
 * @param {string} email
 * @param {string} password
 * @returns {Promise} - { user, token }
 */
export const authService = {
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password
      });
      
      // Save token & user ke localStorage
      if (response.data.token) {
        localStorage.setItem('madura_token', response.data.token);
        localStorage.setItem('madura_user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Logout - hapus token dari localStorage
   */
  logout: () => {
    localStorage.removeItem('madura_token');
    localStorage.removeItem('madura_user');
  },

  /**
   * Register user baru
   * @param {Object} userData - { email, password, name }
   */
  register: async (userData) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get current user dari localStorage
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('madura_user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get current token
   */
  getToken: () => {
    return localStorage.getItem('madura_token');
  },

  /**
   * Check apakah user sudah login
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('madura_token');
  }
};
