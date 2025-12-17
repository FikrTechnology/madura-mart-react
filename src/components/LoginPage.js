import React, { useState } from 'react';
import { useOutlet } from '../context/OutletContext';
import '../styles/Login.css';

const LoginPage = ({ onLoginSuccess }) => {
  const { login, selectOutlet, userOutlets } = useOutlet();
  const [email, setEmail] = useState('fikri@madura.com');
  const [password, setPassword] = useState('fikri123');
  const [error, setError] = useState('');
  const [step, setStep] = useState('login'); // 'login' atau 'outlet-selection'
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = login(email, password);
      
      if (result.outlets.length === 1) {
        // Langsung select outlet jika hanya 1
        selectOutlet(result.outlets[0].id);
        onLoginSuccess(result.user, result.outlets[0], result.outlets);
      } else {
        // Tampilkan pilihan outlet
        setStep('outlet-selection');
      }
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

  if (step === 'outlet-selection') {
    return (
      <div className="outlet-selection-page">
        {/* Header */}
        <div className="outlet-header">
          <div className="outlet-header-content">
            <h1 className="outlet-page-title">🏪 Pilih Outlet</h1>
            <p className="outlet-page-subtitle">Anda memiliki akses ke {userOutlets.length} outlet</p>
          </div>
          <button
            type="button"
            className="back-btn-header"
            onClick={() => {
              setStep('login');
              setError('');
            }}
          >
            ← Kembali
          </button>
        </div>

        {/* Main Content */}
        <div className="outlet-selection-content">
          <div className="outlets-container">
            {userOutlets.length === 0 ? (
              <div className="no-outlets">
                <p>Anda tidak memiliki akses ke outlet apapun</p>
              </div>
            ) : (
              <div className="outlets-grid-dashboard">
                {userOutlets.map((outlet) => (
                  <div
                    key={outlet.id}
                    className="outlet-card-dashboard"
                    onClick={() => handleOutletSelect(outlet.id)}
                  >
                    <div className="outlet-card-top">
                      <div className="outlet-icon-large">🏪</div>
                      <div className="outlet-status-badge">Aktif</div>
                    </div>

                    <div className="outlet-card-info">
                      <h2>{outlet.name}</h2>
                      <p className="outlet-address-dashboard">📍 {outlet.address}</p>
                      <div className="outlet-id-badge">ID: {outlet.id}</div>
                    </div>

                    <div className="outlet-card-footer">
                      <button type="button" className="select-outlet-btn">
                        Masuk Outlet →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
              <button
                type="button"
                onClick={() => { setEmail('fikri@madura.com'); setPassword('fikri123'); }}
                style={{ padding: '8px', fontSize: '11px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', background: '#f5f5f5' }}
              >
                👑 Owner
              </button>
              <button
                type="button"
                onClick={() => { setEmail('admin@outlet1.com'); setPassword('admin123'); }}
                style={{ padding: '8px', fontSize: '11px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', background: '#f5f5f5' }}
              >
                🔐 Admin
              </button>
              <button
                type="button"
                onClick={() => { setEmail('cashier@outlet1.com'); setPassword('cashier123'); }}
                style={{ padding: '8px', fontSize: '11px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', background: '#f5f5f5', gridColumn: '1 / -1' }}
              >
                💳 Cashier
              </button>
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
