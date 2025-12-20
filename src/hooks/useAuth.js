// ==========================================
// Custom Hook: useAuth
// Handle semua auth logic
// ==========================================
import { useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { SUCCESS_MESSAGES } from '../constants/api';

export const useAuth = () => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Login handler
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Login gagal';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout handler
   */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  /**
   * Register handler
   */
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(userData);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Register gagal';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    register
  };
};
