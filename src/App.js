// @ts-nocheck
import { useState, useEffect } from 'react';
import './App.css';
import { useAuth, useOutlet as useOutletHook, useProduct } from './hooks';
import LoginPage from './components/LoginPage.tsx';
import HomePage from './components/HomePage.tsx';
import OwnerDashboard from './components/OwnerDashboard.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';

/**
 * Main App Component - Terintegrasi dengan Backend API (REAL)
 * ✅ PENTING: Backend server HARUS running untuk login!
 * 
 * Menghapus OutletContext/localStorage context
 * Menggunakan API hooks untuk semua data
 */
function App() {
  // ===== API Hooks - Real backend integration =====
  const { user: authUser, token, loading: authLoading, logout: apiLogout } = useAuth();
  const { outlets, fetchOutlets } = useOutletHook();
  const { products, fetchProducts } = useProduct();

  // ===== Local State =====
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentOutlet, setCurrentOutlet] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userOutlets, setUserOutlets] = useState([]);
  const [transactions, setTransactions] = useState([]);

  /**
   * Sync API auth state dengan local state
   */
  useEffect(() => {
    if (authUser && token) {
      setIsLoggedIn(true);
      setCurrentUser(authUser);
      setUserRole(authUser.role);
      console.log('[App] User authenticated:', authUser);
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setUserRole(null);
    }
  }, [authUser, token]);

  /**
   * Fetch outlets dan products setelah user login
   */
  useEffect(() => {
    if (isLoggedIn && authUser) {
      console.log('[App] Fetching outlets and products for:', authUser.email);
      fetchOutlets();
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  /**
   * Set outlets dari API
   */
  useEffect(() => {
    if (outlets && outlets.length > 0) {
      setUserOutlets(outlets);
      if (!currentOutlet) {
        setCurrentOutlet(outlets[0]);
      }
      console.log('[App] Outlets loaded from API:', outlets);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outlets, currentOutlet]);

  /**
   * Load transactions dari localStorage
   * TODO: Migrate to API transactionAPI.getByOutlet()
   */
  useEffect(() => {
    const stored = localStorage.getItem('madura_transactions');
    if (stored) {
      try {
        setTransactions(JSON.parse(stored));
      } catch (err) {
        console.error('[App] Failed to parse transactions:', err);
      }
    }
  }, []);

  /**
   * Handle successful login
   */
  const handleLoginSuccess = (user, outlet, outletsList) => {
    console.log('[App] handleLoginSuccess:', { user, outlet, outletsList });
    setIsLoggedIn(true);
    setCurrentUser(user);
    setCurrentOutlet(outlet);
    setUserOutlets(outletsList || outlets || []);
    setUserRole(user.role);
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await apiLogout();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setCurrentOutlet(null);
      setUserOutlets([]);
      setUserRole(null);
      console.log('[App] User logged out');
    } catch (err) {
      console.error('[App] Logout error:', err);
    }
  };

  /**
   * Handle outlet switch
   */
  const handleSwitchOutlet = (outletId) => {
    const selected = userOutlets.find(o => o.id === outletId);
    if (selected) {
      setCurrentOutlet(selected);
      console.log('[App] Switched to outlet:', selected.name);
    }
  };

  /**
   * Save transaction
   */
  const handleSaveTransaction = (transaction) => {
    const newTransactions = [...transactions, { ...transaction, id: Date.now() }];
    setTransactions(newTransactions);
    localStorage.setItem('madura_transactions', JSON.stringify(newTransactions));
  };

  /**
   * Show loading screen jika auth sedang loading
   */
  if (authLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f5f5f5',
        flexDirection: 'column'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading...</h2>
          <p>Checking authentication status...</p>
          <p style={{ fontSize: '12px', color: '#999' }}>
            🔍 Connecting to: {process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}
          </p>
        </div>
      </div>
    );
  }

  /**
   * Show login page jika belum login
   */
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  /**
   * Render based on user role
   */
  return (
    <div className="App">
      {userRole === 'owner' && (
        <OwnerDashboard
          onLogout={handleLogout}
          currentOutlet={currentOutlet}
          products={products}
          transactions={transactions}
          userOutlets={userOutlets}
          onSwitchOutlet={handleSwitchOutlet}
        />
      )}
      {userRole === 'admin' && (
        <AdminDashboard
          onLogout={handleLogout}
          currentOutlet={currentOutlet}
          products={products}
          userOutlets={userOutlets}
          onSwitchOutlet={handleSwitchOutlet}
        />
      )}
      {userRole === 'cashier' && (
        <HomePage
          onLogout={handleLogout}
          currentOutlet={currentOutlet}
          products={products}
          transactions={transactions}
          userOutlets={userOutlets}
          onSwitchOutlet={handleSwitchOutlet}
          onSaveTransaction={handleSaveTransaction}
          currentUser={currentUser}
        />
      )}

      {/* Development Info - Backend Connection Status */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          padding: '12px',
          borderRadius: '4px',
          fontSize: '11px',
          maxWidth: '220px',
          zIndex: 9999,
          fontFamily: 'monospace',
          lineHeight: '1.6'
        }}>
          <div style={{ marginBottom: '8px', borderBottom: '1px solid #444', paddingBottom: '8px' }}>
            <strong>🔗 API Status</strong>
          </div>
          <div>
            👤 User: {authUser?.email || 'N/A'}<br/>
            🎭 Role: {userRole || 'N/A'}<br/>
            🏪 Outlets: {userOutlets.length || 0}<br/>
            📍 Current: {currentOutlet?.name || 'N/A'}<br/>
            ✅ Backend: REQUIRED
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
