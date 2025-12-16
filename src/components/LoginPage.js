import React, { useState } from 'react';
import '../styles/Login.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Validasi input
    if (!username || !password) {
      setError('Username dan password harus diisi!');
      return;
    }
    
    // Reset error
    setError('');
    
    // Simulasi login
    console.log('Login dengan:', { username, password });
    alert(`Selamat datang, ${username}!`);
    
    // Reset form
    setUsername('');
    setPassword('');
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

            {/* Username Input */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="form-input"
                placeholder="Masukkan username Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
              />
            </div>

            {/* Login Button */}
            <button type="submit" className="login-button">
              Login
            </button>
          </form>

          {/* Footer Text */}
          <p className="login-footer">
            Belum memiliki akun? <a href="#signup">Daftar di sini</a>
          </p>
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
            <p>Belanja mudah, harga terjangkau, kualitas terjamin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
