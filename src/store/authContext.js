// ==========================================
// Auth Context (Global State)
// Untuk manage authentication state globally
// ==========================================
import React, { createContext, useContext, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthContext = createContext();

/**
 * AuthProvider Component
 * Wrap app dengan ini untuk provide auth context
 */
export const AuthProvider = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook untuk access auth context
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext harus digunakan dalam AuthProvider');
  }
  return context;
};
