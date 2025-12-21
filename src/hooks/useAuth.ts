// ==========================================
// Custom Hook: useAuth
// Handle semua auth logic
// ==========================================
import { useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';
import { User, AuthResponse } from '../types';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<AuthResponse>;
  clearSession: () => void;
}

/**
 * Custom hook untuk handle semua authentication logic
 * @returns Object dengan auth state dan functions
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize: Coba restore session dari localStorage
   * Hanya restore jika session valid
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { user: restoredUser, isValid } = await authService.restoreSession();
        if (isValid && restoredUser) {
          setUser(restoredUser);
        } else {
          // Session tidak valid, clear localStorage
          authService.clearSession();
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        authService.clearSession();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login handler
   * @param email - User email
   * @param password - User password
   * @returns Promise dengan auth response
   */
  const login = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      setLoading(true);
      setError(null);
      try {
        const data = await authService.login(email, password);
        if (data.data?.user) {
          setUser(data.data.user);
        }
        return data;
      } catch (err) {
        const errorMessage = (err as Error).message || 'Login gagal';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Logout handler
   */
  const logout = useCallback((): void => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  /**
   * Register handler
   * @param userData - User data untuk registration
   * @returns Promise dengan auth response
   */
  const register = useCallback(
    async (userData: Partial<User>): Promise<AuthResponse> => {
      setLoading(true);
      setError(null);
      try {
        const data = await authService.register(userData);
        return data;
      } catch (err) {
        const errorMessage = (err as Error).message || 'Register gagal';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Clear session explicitly (untuk development/testing)
   */
  const clearSession = useCallback((): void => {
    authService.clearSession();
    setUser(null);
    setError(null);
  }, []);

  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    register,
    clearSession,
  };
};
