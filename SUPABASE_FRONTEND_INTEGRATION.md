# Supabase Frontend Integration - React Update Guide

Panduan update React Madura Mart untuk menggunakan Supabase backend.

---

## 📦 Step 1: Install Supabase Client

```bash
# Install Supabase JS client
npm install @supabase/supabase-js

# Atau jika sudah ada backend, gunakan Axios
npm install axios
```

---

## 🔧 Step 2: Setup API Client

### Option A: Direct Supabase Client (No Backend Needed)

Jika ingin langsung query Supabase tanpa backend middleware.

**File: `src/utils/supabaseClient.js`**

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**File: `.env.local`**

```env
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
```

### Option B: Via Backend API (Recommended for Production)

Komunikasi dengan backend yang sudah di-setup.

**File: `src/utils/api.js`**

```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authorization token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**File: `.env.local`**

```env
REACT_APP_API_URL=http://localhost:3001/api
```

---

## 🔑 Step 3: Update OutletContext

**File: `src/context/OutletContext.js`**

```javascript
import React, { createContext, useState, useCallback } from 'react';
import api from '../utils/api';

export const OutletContext = createContext();

export const OutletProvider = ({ children }) => {
  const [userOutlets, setUserOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutletState] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Login
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/auth/login', { email, password });

      const { token, user: userData, outlets } = response.data;

      // Save token
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Set context state
      setUser(userData);
      setUserOutlets(outlets);

      // Auto-select first outlet
      if (outlets.length > 0) {
        selectOutlet(outlets[0].id, outlets);
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login gagal';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      // Call backend logout endpoint (optional)
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedOutlet');
      setUser(null);
      setUserOutlets([]);
      setSelectedOutletState(null);
    }
  }, []);

  // Select outlet
  const selectOutlet = useCallback((outletId, outletsList) => {
    const outlets = outletsList || userOutlets;
    const outlet = outlets.find(o => o.id === outletId);
    
    if (outlet) {
      setSelectedOutletState(outlet);
      localStorage.setItem('selectedOutlet', JSON.stringify(outlet));
    }
  }, [userOutlets]);

  // Restore session
  const restoreSession = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user');
      const savedOutlet = localStorage.getItem('selectedOutlet');

      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
        
        // Verify token is still valid
        const response = await api.get('/auth/verify');
        if (response.data.success) {
          setUser(response.data.user);
          if (savedOutlet) {
            setSelectedOutletState(JSON.parse(savedOutlet));
          }
        }
      }
    } catch (err) {
      console.error('Session restore error:', err);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }, []);

  const value = {
    userOutlets,
    selectedOutlet,
    user,
    loading,
    error,
    login,
    logout,
    selectOutlet,
    restoreSession
  };

  return (
    <OutletContext.Provider value={value}>
      {children}
    </OutletContext.Provider>
  );
};
```

---

## 🔐 Step 4: Update LoginPage

**File: `src/pages/LoginPage.js`** (simplified example)

```javascript
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { OutletContext } from '../context/OutletContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useContext(OutletContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Email dan password diperlukan');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate('/home');
    } else {
      setLocalError(result.error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h1>Madura Mart POS</h1>
        
        {(error || localError) && (
          <div className="error-message">{error || localError}</div>
        )}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Demo credentials */}
      <div className="demo-info">
        <p>Demo Credentials:</p>
        <p>Email: owner@madura.com</p>
        <p>Password: (sesuai database)</p>
      </div>
    </div>
  );
}

export default LoginPage;
```

---

## 🏠 Step 5: Update HomePage

**File: `src/pages/HomePage.js`** (checkout section)

```javascript
import React, { useContext, useState, useEffect } from 'react';
import { OutletContext } from '../context/OutletContext';
import api from '../utils/api';

function HomePage() {
  const { selectedOutlet, user } = useContext(OutletContext);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedOutlet) return;

      try {
        setLoading(true);
        const response = await api.get('/products', {
          params: { outlet_id: selectedOutlet.id }
        });
        setProducts(response.data.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedOutlet]);

  // Calculate cart total
  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);
  };

  // Handle checkout
  const handleCheckout = async (paymentMethod) => {
    if (!selectedOutlet || cart.length === 0) {
      alert('Keranjang kosong atau outlet tidak terpilih');
      return;
    }

    try {
      setLoading(true);

      // Format items untuk API
      const items = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount || 0
      }));

      // Call checkout API
      const response = await api.post('/transactions', {
        outlet_id: selectedOutlet.id,
        cashier_id: user?.id,
        customer_name: 'Customer',
        items,
        payment_method: paymentMethod,
        discount: 0,
        tax: 0
      });

      if (response.data.success) {
        alert('Transaksi berhasil!');
        // Reset cart
        setCart([]);
        // Refresh products (restock)
        // ...
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Checkout gagal: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <h1>Home - {selectedOutlet?.name}</h1>

      {/* Products section */}
      <div className="products-section">
        <h2>Produk</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <h3>{product.name}</h3>
                <p>SKU: {product.sku}</p>
                <p className="price">Rp {product.price.toLocaleString()}</p>
                <p className="stock">Stok: {product.product_stock?.[0]?.quantity || 0}</p>
                <button
                  onClick={() => {
                    // Add to cart
                    const existingItem = cart.find(i => i.product_id === product.id);
                    if (existingItem) {
                      setCart(cart.map(i =>
                        i.product_id === product.id
                          ? { ...i, quantity: i.quantity + 1 }
                          : i
                      ));
                    } else {
                      setCart([...cart, {
                        product_id: product.id,
                        name: product.name,
                        quantity: 1,
                        unit_price: product.price
                      }]);
                    }
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart section */}
      <div className="cart-section">
        <h2>Keranjang</h2>
        {cart.length === 0 ? (
          <p>Keranjang kosong</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Qty</th>
                  <th>Harga</th>
                  <th>Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const newCart = [...cart];
                          newCart[idx].quantity = parseInt(e.target.value) || 1;
                          setCart(newCart);
                        }}
                      />
                    </td>
                    <td>Rp {item.unit_price.toLocaleString()}</td>
                    <td>Rp {(item.quantity * item.unit_price).toLocaleString()}</td>
                    <td>
                      <button
                        onClick={() => {
                          setCart(cart.filter((_, i) => i !== idx));
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="cart-summary">
              <h3>Total: Rp {calculateTotal().toLocaleString()}</h3>
              
              <div className="payment-methods">
                <button onClick={() => handleCheckout('cash')} disabled={loading}>
                  💵 Bayar Tunai
                </button>
                <button onClick={() => handleCheckout('card')} disabled={loading}>
                  💳 Bayar Kartu
                </button>
                <button onClick={() => handleCheckout('ewallet')} disabled={loading}>
                  📱 E-Wallet
                </button>
                <button onClick={() => handleCheckout('qris')} disabled={loading}>
                  📲 QRIS
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HomePage;
```

---

## 📱 Step 6: Update App Component

**File: `src/App.js`**

```javascript
import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { OutletContext, OutletProvider } from './context/OutletContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ReportPage from './pages/ReportPage';

function AppRoutes() {
  const { user, restoreSession, selectedOutlet } = useContext(OutletContext);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/home" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/reports" element={<ReportPage />} />
      <Route path="/" element={<Navigate to="/home" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <OutletProvider>
        <AppRoutes />
      </OutletProvider>
    </Router>
  );
}

export default App;
```

---

## 🛒 Step 7: Update Sidebar (Logout)

**File: `src/components/Sidebar.js`** (logout button update)

```javascript
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { OutletContext } from '../context/OutletContext';

function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useContext(OutletContext);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <h2>Madura Mart</h2>
      <p>User: {user?.name}</p>
      <p>Role: {user?.role}</p>

      {/* Menu items */}
      <nav>
        <a href="/home">🏠 Home</a>
        <a href="/admin">⚙️ Admin</a>
        <a href="/reports">📊 Reports</a>
      </nav>

      {/* Logout button */}
      <button onClick={handleLogout} className="logout-btn">
        🚪 Logout
      </button>
    </div>
  );
}

export default Sidebar;
```

---

## 📋 Step 8: Environment Variables

**File: `.env.local`** (untuk development)

```env
# Supabase (untuk direct access)
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...

# Backend API (recommended)
REACT_APP_API_URL=http://localhost:3001/api

# Optional
REACT_APP_LOG_LEVEL=debug
```

**File: `.env.production`** (untuk production)

```env
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
REACT_APP_API_URL=https://api.yourdomain.com/api
```

---

## 🧪 Step 9: Testing

### Test Login
1. Start React app: `npm start`
2. Navigate to http://localhost:3000
3. Enter credentials: 
   - Email: `owner@madura.com`
   - Password: (from database)
4. Should redirect to home page
5. Verify outlet selected

### Test Products
1. Products should load from API
2. Check console for API calls
3. Add to cart and verify UI updates

### Test Checkout
1. Add items to cart
2. Click payment method button
3. Check network tab for POST to `/transactions`
4. Verify response success
5. Cart should clear after success

### Test Logout
1. Click logout button
2. Should redirect to login
3. Token should be cleared from localStorage

---

## 🔍 Debugging

### API Calls Not Working

Check in browser DevTools:
```javascript
// Console
localStorage.getItem('auth_token') // Should have JWT token
// Network tab - check API requests
// Look for CORS errors, 401 responses, etc.
```

### Token Expired

```javascript
// Manually clear and re-login
localStorage.removeItem('auth_token');
localStorage.removeItem('user');
window.location.reload();
```

### CORS Error

Backend `.env`:
```env
FRONTEND_URL=http://localhost:3000  # untuk dev
FRONTEND_URL=https://yourdomain.com # untuk prod
```

---

## 📊 Project Structure After Update

```
src/
├── components/
│   ├── Sidebar.js        (updated)
│   └── ...
├── context/
│   └── OutletContext.js  (updated)
├── pages/
│   ├── LoginPage.js      (updated)
│   ├── HomePage.js       (updated)
│   ├── AdminPage.js
│   └── ReportPage.js
├── utils/
│   ├── api.js            (new)
│   └── supabaseClient.js (new, optional)
├── App.js                (updated)
├── App.css
├── index.js
└── index.css

.env.local               (new)
.env.production          (new)
```

---

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

```bash
# Build for production
npm run build

# Deploy ke Vercel
npm install -g vercel
vercel

# Or Netlify
# netlify deploy --prod --dir=build
```

**Environment Variables pada Vercel:**
1. Project Settings → Environment Variables
2. Add:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_API_URL` (production backend URL)

### Backend Deployment

Lihat SUPABASE_BACKEND_GUIDE.md untuk deployment options:
- Heroku
- Railway
- Render
- AWS
- DigitalOcean

---

## ✅ Migration Checklist

- [ ] Install @supabase/supabase-js dan axios
- [ ] Create api.js client
- [ ] Update OutletContext.js untuk API calls
- [ ] Update LoginPage component
- [ ] Update HomePage checkout function
- [ ] Update Sidebar logout function
- [ ] Add .env.local variables
- [ ] Test login flow
- [ ] Test product loading
- [ ] Test checkout
- [ ] Test logout
- [ ] Clear browser storage dan re-test
- [ ] Test in incognito/private mode

---

## 🎯 Next Steps

1. ✅ Update frontend React components
2. ✅ Test dengan backend API
3. ➡️ **Deploy frontend** (Vercel/Netlify)
4. ➡️ **Deploy backend** (Railway/Heroku)
5. ➡️ **Configure production environment**

---

## 📚 Useful Links

- **React Docs:** https://react.dev
- **Axios Docs:** https://axios-http.com
- **React Router:** https://reactrouter.com
- **Vercel Deployment:** https://vercel.com/docs

---

**Frontend integration selesai! 🎉 Aplikasi sudah siap full production! 🚀**
