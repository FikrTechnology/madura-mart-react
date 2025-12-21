// @ts-nocheck
import React, { useState, useEffect, FC, FormEvent } from 'react';
import { useAuth, useOutlet as useOutletHook } from '../hooks';
import { User } from '../types';
import '../styles/Login.css';

interface DemoAccount {
  label: string;
  email: string;
  password: string;
}

interface LoginPageProps {
  onLoginSuccess: (
    user: Omit<User, 'password'>,
    outlet: any,
    outlets?: any[]
  ) => void;
}

/**
 * Login Page Component - Terintegrasi dengan Backend API
 * Menampilkan form login dengan demo accounts
 */
const LoginPage: FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // API Hooks
  const { login: apiLogin, user: authUser, loading: authLoading, error: authError } = useAuth();
  const { outlets, fetchOutlets } = useOutletHook();
  // State variables
  const [email, setEmail] = useState<string>('owner@madura.com');
  const [password, setPassword] = useState<string>('password123');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shouldFetchOutlets, setShouldFetchOutlets] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([
    { label: '👑 Owner', email: 'owner@madura.com', password: 'password123' },
    {
      label: '🔐 Admin',
      email: 'admin@outlet1.com',
      password: 'admin123',
    },
    {
      label: '💳 Cashier',
      email: 'cashier@outlet1.com',
      password: 'cashier123',
    },
  ]);

  /**
   * Load demo accounts from localStorage
   */
  useEffect(() => {
    const employees: any[] = JSON.parse(
      localStorage.getItem('madura_employees') || '[]'
    );
    if (employees.length > 0) {
      const adminEmployee = employees.find(
        (e: any) => e.role === 'admin' && (e.status || 'active') === 'active'
      );
      const cashierEmployee = employees.find(
        (e: any) =>
          e.role === 'cashier' && (e.status || 'active') === 'active'
      );

      const newDemoAccounts: DemoAccount[] = [
        { label: '👑 Owner', email: 'owner@madura.com', password: 'password123' },
      ];

      if (adminEmployee) {
        newDemoAccounts.push({
          label: `🔐 Admin (${adminEmployee.name})`,
          email: adminEmployee.email,
          password: adminEmployee.password,
        });
      }

      if (cashierEmployee) {
        newDemoAccounts.push({
          label: `💳 Cashier (${cashierEmployee.name})`,
          email: cashierEmployee.email,
          password: cashierEmployee.password,
        });
      }

      setDemoAccounts(newDemoAccounts);
    }
  }, []);

  /**
   * Fetch outlets ketika user berhasil login
   */
  useEffect(() => {
    if (shouldFetchOutlets && authUser) {
      setLoadingStep('Memuat outlet...');
      console.log('Fetching outlets for user:', authUser.email);
      fetchOutlets();
      setShouldFetchOutlets(false);
    }
  }, [shouldFetchOutlets, authUser, fetchOutlets]);

  /**
   * Monitor outlets loading and trigger onLoginSuccess when ready
   * Trigger even if outlets are empty - just use first outlet or null
   */
  useEffect(() => {
    if (authUser && isLoading) {
      // Wait a moment for outlets to load
      const checkTimer = setTimeout(() => {
        // Use first outlet if available, otherwise use null
        const defaultOutlet = outlets && outlets.length > 0 ? outlets[0] : null;
        
        if (defaultOutlet) {
          console.log('Outlets loaded, triggering onLoginSuccess');
          console.log('  User:', authUser.email);
          console.log('  Default Outlet:', defaultOutlet.name);
          console.log('  Total Outlets:', outlets.length);
        } else {
          console.log('No outlets found, but proceeding with login');
          console.log('  User:', authUser.email);
          setLoadingStep('Menyelesaikan login...');
        }
        
        // Delay slightly to ensure state is fully settled
        const timer = setTimeout(() => {
          onLoginSuccess(authUser, defaultOutlet, outlets || []);
          setIsLoading(false);
          setLoadingStep('');
        }, 300);
        
        return () => clearTimeout(timer);
      }, 500);
      
      return () => clearTimeout(checkTimer);
    }
  }, [authUser, isLoading, outlets, onLoginSuccess]);

  /**
   * Handle login form submission - Integasi API
   */
  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setLoadingStep('Verifikasi data login...');
    setShouldFetchOutlets(true);

    try {
      console.log('Attempting login with email:', email);
      const response = await apiLogin(email, password);

      if (response.success && response.data) {
        console.log('Login successful, response:', response.data);
        setLoadingStep('Login berhasil! Memuat data...');
        // User state akan di-load oleh useEffect hooks
        // outlets akan di-fetch oleh hook berikutnya
      } else {
        setError(response.error || 'Login failed');
        setIsLoading(false);
        setLoadingStep('');
        setShouldFetchOutlets(false);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
      setIsLoading(false);
      setLoadingStep('');
      setShouldFetchOutlets(false);
      console.error('Login error:', err);
    }
  };

  /**
   * Handle outlet selection (fallback untuk mode offline/local)
   */
  const handleOutletSelect = (outletId: string): void => {
    console.log('Outlet selected:', outletId);
    // This is not used when connected to API
  };

  const displayError = error || authError;

  return (
    <div className="login-container">
      {/* Bagian Kiri - Form Login */}
      <div className="login-form-section">
        <div className="login-form-wrapper">
          {/* Logo */}
          <div className="login-logo">
            <div className="logo-placeholder">MM</div>
          </div>

          {/* Label Login */}
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Masukkan kredensial Anda untuk login</p>

          {/* Form */}
          <form onSubmit={handleLogin} className="login-form" autoComplete="off">
            {/* Error Message */}
            {displayError && <div className="error-message">{displayError}</div>}

            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || authLoading}
                autoComplete="username"
              />
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || authLoading}
                autoComplete="new-password"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="login-button"
              disabled={isLoading || authLoading}
            >
              {isLoading || authLoading ? 'Masuk...' : 'Masuk'}
            </button>

            {/* API Status Info */}
            {(isLoading || authLoading) && (
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#333', marginBottom: '5px', fontWeight: '500' }}>
                  ⏳ {loadingStep || 'Memproses login...'}
                </p>
                <p style={{ fontSize: '12px', color: '#999', margin: '5px 0' }}>
                  {authLoading ? 'Verifikasi kredensial...' : 'Memuat data...'}
                </p>
              </div>
            )}
          </form>

          {/* Demo Users */}
          <div
            className="demo-users"
            style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #eee',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '10px',
              }}
            >
              👤 Demo Accounts:
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}
            >
              {demoAccounts.map((account, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                  disabled={isLoading || authLoading}
                  style={{
                    padding: '8px',
                    fontSize: '11px',
                    cursor: isLoading || authLoading ? 'not-allowed' : 'pointer',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: '#f5f5f5',
                    opacity: isLoading || authLoading ? 0.5 : 1,
                    gridColumn:
                      account.label.includes('Admin') &&
                      demoAccounts.length === 3
                        ? undefined
                        : account.label.includes('Cashier')
                          ? '1 / -1'
                          : undefined,
                  }}
                >
                  {account.label}
                </button>
              ))}
            </div>
          </div>

          {/* API Info - Show only in development */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee', fontSize: '11px', color: '#999' }}>
              <p>API URL: {process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}</p>
              <p>Auth Status: {authUser ? '✅ Authenticated' : '⚪ Not Authenticated'}</p>
              <p>Outlets: {outlets.length > 0 ? `✅ ${outlets.length} outlet(s)` : '⚪ No outlets loaded'}</p>
              <button
                onClick={() => {
                  localStorage.removeItem('madura_user');
                  localStorage.removeItem('madura_token');
                  window.location.reload();
                }}
                style={{
                  marginTop: '10px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  background: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                🧹 Clear Session (Dev)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bagian Kanan - Image */}
      <div className="login-image-section">
        <div className="login-image-wrapper">
          <img
            src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=600&h=700&fit=crop"
            alt="Shopping illustration"
            className="login-image"
          />
          <div className="image-overlay">
            <h2>Madura Mart</h2>
            <p>Sistem POS Multi-Outlet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
