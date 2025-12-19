import React, { useState, useEffect } from 'react';
import { useOutlet } from '../context/OutletContext';
import '../styles/Login.css';

const LoginPage = ({ onLoginSuccess }) => {
  const { login, selectOutlet, userOutlets } = useOutlet();
  const [email, setEmail] = useState('fikri@madura.com');
  const [password, setPassword] = useState('fikri123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState([
    { label: '👑 Owner', email: 'fikri@madura.com', password: 'fikri123' },
    { label: '🔐 Admin', email: 'admin@outlet1.com', password: 'admin123' },
    { label: '💳 Cashier', email: 'cashier@outlet1.com', password: 'cashier123' }
  ]);

  // Load dynamic demo accounts from localStorage
  useEffect(() => {
    const employees = JSON.parse(localStorage.getItem('madura_employees') || '[]');
    if (employees.length > 0) {
      // Get first admin if exists
      const adminEmployee = employees.find(e => e.role === 'admin' && (e.status || 'active') === 'active');
      // Get first cashier if exists
      const cashierEmployee = employees.find(e => e.role === 'cashier' && (e.status || 'active') === 'active');
      
      const newDemoAccounts = [
        { label: '👑 Owner', email: 'fikri@madura.com', password: 'fikri123' }
      ];
      
      if (adminEmployee) {
        newDemoAccounts.push({ 
          label: `🔐 Admin (${adminEmployee.name})`, 
          email: adminEmployee.email, 
          password: adminEmployee.password 
        });
      }
      
      if (cashierEmployee) {
        newDemoAccounts.push({ 
          label: `💳 Cashier (${cashierEmployee.name})`, 
          email: cashierEmployee.email, 
          password: cashierEmployee.password 
        });
      }
      
      setDemoAccounts(newDemoAccounts);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = login(email, password);
      
      // Pass outlets list ke selectOutlet untuk avoid race condition dari setState
      selectOutlet(result.outlets[0].id, result.outlets);
      onLoginSuccess(result.user, result.outlets[0], result.outlets);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutletSelect = (outletId) => {
    try {
      selectOutlet(outletId);
      const selectedOutlet = userOutlets.find(o => o.id === outletId);
      onLoginSuccess({ email, name: email.split('@')[0] }, selectedOutlet, userOutlets);
    } catch (err) {
      setError(err.message);
    }
  };

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
          <form onSubmit={handleLogin} className="login-form">
            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

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
              />
            </div>

            {/* Login Button */}
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          {/* Demo Users */}
          <div className="demo-users" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>👤 Demo Accounts:</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {demoAccounts.map((account, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setEmail(account.email); setPassword(account.password); }}
                  style={{ 
                    padding: '8px', 
                    fontSize: '11px', 
                    cursor: 'pointer', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px', 
                    background: '#f5f5f5',
                    gridColumn: account.label.includes('Admin') && demoAccounts.length === 3 ? undefined : (account.label.includes('Cashier') ? '1 / -1' : undefined)
                  }}
                >
                  {account.label}
                </button>
              ))}
            </div>
          </div>
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
