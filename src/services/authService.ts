/**
 * Authentication Service
 * Business logic untuk authentication dan authorization
 */

import { AxiosError } from 'axios';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../constants/api';
import { handleApiError } from '../api/handleApiError';
import { User, LoginCredentials, AuthResponse, ApiError } from '../types';

interface AuthServiceType {
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<AuthResponse>;
  getCurrentUser: () => User | null;
  getToken: () => string | null;
  isAuthenticated: () => boolean;
  restoreSession: () => Promise<{ user: User | null; isValid: boolean }>;
  clearSession: () => void;
}

export const authService: AuthServiceType = {
  /**
   * Login dengan email dan password
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        { email, password }
      );

      // Save token & user ke localStorage
      if (response.data.data?.token && response.data.data?.user) {
        localStorage.setItem('madura_token', response.data.data.token);
        localStorage.setItem('madura_user', JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error) {
      const apiError = handleApiError(error as AxiosError);
      throw apiError;
    }
  },

  /**
   * Logout - hapus token dari localStorage
   */
  logout: (): void => {
    localStorage.removeItem('madura_token');
    localStorage.removeItem('madura_user');
  },

  /**
   * Register user baru
   */
  register: async (userData: Partial<User>): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      );
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error as AxiosError);
      throw apiError;
    }
  },

  /**
   * Get current user dari localStorage (tanpa validasi)
   * Gunakan restoreSession() untuk validasi penuh
   */
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('madura_user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get current token
   */
  getToken: (): string | null => {
    return localStorage.getItem('madura_token');
  },

  /**
   * Check apakah user sudah login
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('madura_token');
  },

  /**
   * Restore session dengan validasi token
   * Cek apakah token masih valid sebelum restore user
   */
  restoreSession: async (): Promise<{ user: User | null; isValid: boolean }> => {
    const token = localStorage.getItem('madura_token');
    const storedUser = localStorage.getItem('madura_user');

    // Jika tidak ada token atau user di localStorage, session tidak valid
    if (!token || !storedUser) {
      return { user: null, isValid: false };
    }

    try {
      // Coba validate token dengan API
      // Jika backend memiliki endpoint untuk validate token, gunakan itu
      // Untuk sekarang, kita asumsikan token valid jika ada dan not corrupted
      const user = JSON.parse(storedUser);
      
      // Optional: Bisa menambahkan API call ke /auth/validate atau /auth/me
      // const response = await axiosInstance.get('/auth/me');
      // if (response.data.data?.user) {
      //   return { user: response.data.data.user, isValid: true };
      // }

      return { user, isValid: true };
    } catch (error) {
      // Jika ada error parsing atau API call, clear session
      authService.clearSession();
      return { user: null, isValid: false };
    }
  },

  /**
   * Clear session (manual, untuk development atau explicit logout)
   */
  clearSession: (): void => {
    localStorage.removeItem('madura_token');
    localStorage.removeItem('madura_user');
  }
};
