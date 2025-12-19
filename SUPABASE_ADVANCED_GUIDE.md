# Supabase Advanced Guide - Troubleshooting & Best Practices

Panduan lanjutan untuk production deployment dan optimization.

---

## 🔧 Troubleshooting Guide

### Database Issues

#### Issue 1: "Database Connection Timeout"

**Symptom:**
```
Error: Client request timeout waiting for response
```

**Root Causes:**
- Database connection pool exhausted
- Query terlalu lambat (>5 seconds)
- Network connectivity issue
- Supabase server overload

**Solutions:**

```javascript
// 1. Check connection pool configuration
// config/supabase.js
const pool = createPool({
  // ... settings
  connectionLimit: 10,        // Max connections
  waitForConnections: true,
  queueLimit: 0,              // Unlimited queue
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

// 2. Add query timeout
const result = await supabase
  .from('transactions')
  .select('*')
  .timeout(30000);  // 30 seconds timeout

// 3. Optimize slow query
// ❌ Slow - N+1 query
const transactions = await supabase
  .from('transactions')
  .select('*, user_id')
  .then(async (trans) => {
    for (let t of trans) {
      t.user = await supabase
        .from('users')
        .select('*')
        .eq('id', t.user_id)
        .single();
    }
    return trans;
  });

// ✅ Fast - Single query with join
const transactions = await supabase
  .from('transactions')
  .select(`
    *,
    users (
      id,
      name,
      email
    )
  `);
```

#### Issue 2: "Foreign Key Constraint Error"

**Symptom:**
```
Error: violates foreign key constraint "transactions_outlet_id_fkey"
```

**Root Cause:**
- Referenced record doesn't exist
- Insert order wrong
- Deleting parent before children

**Solution:**

```sql
-- 1. Check foreign key constraints
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'public';

-- 2. Disable FK temporarily (for data fix)
ALTER TABLE transactions DISABLE TRIGGER ALL;
-- ... fix data ...
ALTER TABLE transactions ENABLE TRIGGER ALL;

-- 3. Use CASCADE delete if appropriate
ALTER TABLE transactions
DROP CONSTRAINT transactions_outlet_id_fkey;

ALTER TABLE transactions
ADD CONSTRAINT transactions_outlet_id_fkey
FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE;
```

**Prevention:**

```javascript
// Always insert in correct order
async function insertData() {
  // 1. Insert parent first
  const user = await supabase.from('users').insert({...}).select().single();
  
  // 2. Then insert child referencing parent
  const outlet = await supabase.from('outlets').insert({
    owner_id: user.id,  // Valid reference
    ...
  }).select().single();
}
```

#### Issue 3: "RLS Policy Denied"

**Symptom:**
```
Error: Policy Violation - Row level security
```

**Root Cause:**
- User doesn't have permission per RLS policy
- Auth UID doesn't match expected format
- Policy logic incorrect

**Solution:**

```sql
-- 1. Debug: Check which policy blocking
-- Query with specific user
SELECT * FROM transactions 
WHERE id = 'trans-123';  
-- Returns: [] (blocked by RLS)

-- 2. View current user in Supabase
-- In browser console after login:
const { data: { user } } = await supabase.auth.getUser();
console.log(user);  // Check auth.uid()

-- 3. Fix RLS policy to debug
CREATE POLICY "Debug - View all"
ON transactions FOR SELECT
USING (true);  -- Temporary: allow all

-- Then verify query works without error

-- 4. Fix actual policy
DROP POLICY "Debug - View all" ON transactions;

CREATE POLICY "Users view own transactions"
ON transactions FOR SELECT
USING (
  -- Owner sees all transactions
  EXISTS (
    SELECT 1 FROM outlets
    WHERE outlets.id = transactions.outlet_id
    AND outlets.owner_id = auth.uid()::text
  )
  OR
  -- Cashier sees assigned outlet transactions
  EXISTS (
    SELECT 1 FROM employee_outlet_assignment
    WHERE employee_outlet_assignment.outlet_id = transactions.outlet_id
    AND employee_outlet_assignment.employee_id = auth.uid()::text
  )
);
```

---

### Backend Issues

#### Issue 4: "CORS Error - No Access-Control-Allow-Origin"

**Symptom:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Root Cause:**
- Frontend URL not in CORS whitelist
- Backend not configured correctly
- Preflight request blocked

**Solution:**

```javascript
// backend/src/app.js
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:3000',         // dev
  'https://madura-mart.vercel.app', // production
  'https://yourdomain.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());
```

#### Issue 5: "401 Unauthorized - Invalid Token"

**Symptom:**
```
Error: Invalid token / Unauthorized
```

**Root Cause:**
- Token expired
- Token format wrong
- JWT_SECRET mismatch
- Token not included in request

**Solution:**

```javascript
// 1. Check token in Authorization header
// Frontend axios interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    // Correct format: "Bearer xxxxx"
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('Request headers:', config.headers); // debug
  return config;
});

// 2. Verify JWT_SECRET consistency
// backend/.env
JWT_SECRET=your_jwt_secret_must_be_same_as_when_token_generated

// 3. Check token expiry
const decoded = jwt.decode(token);
console.log('Token expires at:', new Date(decoded.exp * 1000));

// If expired, auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh token
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });
        
        localStorage.setItem('auth_token', data.token);
        // Retry original request
        return api.request(error.config);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

#### Issue 6: "404 Route Not Found"

**Symptom:**
```
Error: Cannot POST /api/products
```

**Root Cause:**
- Route not registered
- Typo in route path
- Wrong HTTP method

**Solution:**

```javascript
// backend/src/app.js

// ❌ Wrong - route defined but request path wrong
app.use('/api/v1/products', productRoutes);  // backend expects /v1
// But frontend calls /api/products - won't match

// ✅ Correct - ensure consistency
// backend
const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);  // Backend: /api/products

// frontend .env.local
REACT_APP_API_URL=http://localhost:3001/api

// frontend call
api.post('/products', {...})  // Full URL: http://localhost:3001/api/products
```

---

### Frontend Issues

#### Issue 7: "Token Lost After Page Refresh"

**Symptom:**
```
User logged out after F5 refresh
```

**Root Cause:**
- Token not persisted
- localStorage cleared
- Session not restored

**Solution:**

```javascript
// src/App.js
import { useEffect, useContext } from 'react';
import { OutletContext } from './context/OutletContext';

function App() {
  const { restoreSession, loading } = useContext(OutletContext);

  useEffect(() => {
    // Restore session on app load
    restoreSession();
  }, [restoreSession]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    // ... your app
  );
}

// src/context/OutletContext.js
export const OutletProvider = ({ children }) => {
  // ... other code

  const restoreSession = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('user');

      if (!token || !user) {
        // No session to restore
        return;
      }

      setUser(JSON.parse(user));

      // Verify token is still valid
      try {
        const response = await api.get('/auth/verify');
        if (response.data.success) {
          // Token valid, restore full session
          const outlet = localStorage.getItem('selectedOutlet');
          if (outlet) {
            setSelectedOutletState(JSON.parse(outlet));
          }
        }
      } catch (error) {
        // Token invalid or expired
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('Restore session error:', error);
    }
  }, []);

  return (
    // ... provider
  );
};
```

#### Issue 8: "Infinite Redirect Loop"

**Symptom:**
```
Redirects to login infinitely
```

**Root Cause:**
- Session restore calls login
- Login calls session restore
- Circular dependency

**Solution:**

```javascript
// ❌ Wrong - circular
useEffect(() => {
  if (!user) {
    login();  // This triggers login
  }
}, [user, login]);  // user changes, triggers effect again

// ✅ Correct - only on mount
useEffect(() => {
  const initializeAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (token && !user) {
      // Try restore session once
      await restoreSession();
    }
  };
  
  initializeAuth();
}, []);  // Empty dependency - runs once on mount
```

---

## 🏆 Best Practices

### 1. Query Optimization

```sql
-- ❌ Slow - No index, N+1 joins
SELECT * FROM transactions WHERE status = 'completed';

-- ✅ Fast - With index
CREATE INDEX idx_transactions_status ON transactions(status);

-- ❌ Slow - Complex calculation in WHERE
SELECT * FROM transactions 
WHERE (total_amount - discount) > 1000000;

-- ✅ Fast - Use computed column or application logic
SELECT * FROM transactions WHERE total_amount > 1000000;
```

```javascript
// ❌ Slow - Pagination wrong
const { data } = await supabase
  .from('transactions')
  .select('*')
  .order('id')
  .range(1000, 1100);  // Still returns all, then slices

// ✅ Fast - Cursor pagination
let query = supabase
  .from('transactions')
  .select('*')
  .order('id', { ascending: false })
  .limit(50);

if (lastId) {
  query = query.lt('id', lastId);  // Get records before last
}

const { data } = await query;
```

### 2. Error Handling

```javascript
// ❌ No error handling
const result = await api.post('/transactions', data);

// ✅ Complete error handling
try {
  const result = await api.post('/transactions', data);
  
  if (result.data.success) {
    // Handle success
    showNotification('Transaction created!', 'success');
  } else {
    // Handle API-level error
    showNotification(result.data.error, 'error');
  }
} catch (error) {
  // Handle network/HTTP error
  if (error.response?.status === 400) {
    showNotification('Invalid input: ' + error.response.data.message, 'error');
  } else if (error.response?.status === 401) {
    // Token invalid
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  } else if (error.response?.status === 500) {
    showNotification('Server error. Please try again later.', 'error');
  } else if (error.request) {
    showNotification('No response from server', 'error');
  } else {
    showNotification('Error: ' + error.message, 'error');
  }
}
```

### 3. State Management

```javascript
// ❌ Multiple useState, hard to sync
const [user, setUser] = useState(null);
const [outlets, setOutlets] = useState([]);
const [selectedOutlet, setSelectedOutlet] = useState(null);
const [loading, setLoading] = useState(false);
// States can be out of sync!

// ✅ Use useReducer for complex state
const initialState = {
  user: null,
  outlets: [],
  selectedOutlet: null,
  loading: false,
  error: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        outlets: action.payload.outlets,
        selectedOutlet: action.payload.outlets[0],
        loading: false,
        error: null
      };
    
    case 'LOGIN_ERROR':
      return { ...state, loading: false, error: action.payload };
    
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(authReducer, initialState);
```

### 4. Logging & Monitoring

```javascript
// Production logging setup
const log = {
  error: (message, context) => {
    console.error(`[ERROR] ${message}`, context);
    // Send to error tracking service (Sentry, LogRocket, etc.)
    errorTrackingService.captureException(new Error(message), {
      tags: { type: 'error' },
      contexts: { data: context }
    });
  },
  
  info: (message, context) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, context);
    }
  },
  
  warn: (message, context) => {
    console.warn(`[WARN] ${message}`, context);
  }
};

// Usage
try {
  await api.post('/transactions', data);
} catch (error) {
  log.error('Transaction failed', {
    endpoint: '/transactions',
    status: error.response?.status,
    message: error.response?.data?.error,
    userId: user?.id,
    timestamp: new Date().toISOString()
  });
}
```

### 5. Security Best Practices

```javascript
// ❌ Insecure
const token = localStorage.getItem('auth_token');
// Token visible in DevTools

// ✅ More secure - use httpOnly cookies
// Set by backend (not JavaScript)
Set-Cookie: auth_token=xxxxx; HttpOnly; Secure; SameSite=Strict

// ✅ Prevent XSS
import DOMPurify from 'dompurify';
const cleanHTML = DOMPurify.sanitize(userInput);

// ✅ Validate input
function validateTransaction(data) {
  if (!data.outlet_id || typeof data.outlet_id !== 'string') {
    throw new Error('Invalid outlet_id');
  }
  
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('Invalid items');
  }
  
  for (let item of data.items) {
    if (!item.product_id || item.quantity < 1) {
      throw new Error('Invalid item');
    }
  }
  
  return true;
}
```

---

## 📊 Performance Optimization

### Database Performance

```sql
-- 1. Add strategic indexes
CREATE INDEX idx_transactions_outlet_date 
ON transactions(outlet_id, transaction_date);

CREATE INDEX idx_products_outlet_category 
ON products(outlet_id, category, status);

-- 2. Use EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT COUNT(*) FROM transactions 
WHERE outlet_id = 'outlet-001' 
AND transaction_date >= '2024-01-01';

-- 3. Archive old data
CREATE TABLE transactions_archive AS
SELECT * FROM transactions 
WHERE transaction_date < '2023-01-01';

DELETE FROM transactions 
WHERE transaction_date < '2023-01-01';

-- 4. Use views for complex queries
CREATE VIEW vw_daily_sales AS
SELECT 
  DATE(transaction_date) as sales_date,
  outlet_id,
  COUNT(*) as transaction_count,
  SUM(total_amount) as total_sales
FROM transactions
WHERE transaction_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(transaction_date), outlet_id;
```

### Backend Performance

```javascript
// 1. Add caching
const cache = new Map();

async function getProducts(outletId) {
  const cacheKey = `products-${outletId}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('outlet_id', outletId);
  
  // Cache for 5 minutes
  cache.set(cacheKey, data);
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
  
  return data;
}

// 2. Add compression
const compression = require('compression');
app.use(compression());

// 3. Connection pooling
const pool = createPool({
  connectionLimit: 10,
  enableKeepAlive: true
});

// 4. Request timeout
app.use((req, res, next) => {
  req.setTimeout(30000);  // 30 second timeout
  next();
});
```

### Frontend Performance

```javascript
// 1. Code splitting
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
    </Suspense>
  );
}

// 2. Memoization
import { memo, useMemo } from 'react';

const ProductList = memo(({ products }) => {
  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
});

// 3. Pagination
const [page, setPage] = useState(1);
const { data: products } = await api.get('/products', {
  params: { page, limit: 20 }
});

// 4. Debounce search
import { useCallback } from 'react';

const debouncedSearch = useCallback(
  debounce(async (query) => {
    const results = await api.get('/products', { params: { search: query } });
    setResults(results.data);
  }, 300),
  []
);

function SearchBox() {
  return (
    <input
      type="text"
      onChange={(e) => debouncedSearch(e.target.value)}
      placeholder="Search products..."
    />
  );
}
```

---

## 🔒 Production Security Checklist

- [ ] HTTPS enabled (not HTTP)
- [ ] JWT tokens use secure algorithm (RS256, not HS256)
- [ ] Token expiry set to reasonable duration (24h)
- [ ] Refresh tokens implemented
- [ ] CORS only allows production domains
- [ ] Database backups automated
- [ ] Rate limiting implemented (prevent brute force)
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (sanitize inputs)
- [ ] CSRF tokens for state-changing requests
- [ ] Secrets not hardcoded (.env files)
- [ ] Error messages don't expose system info
- [ ] API versioning (/api/v1/)
- [ ] Request/response logging
- [ ] Vulnerability scanning (npm audit)

---

## 📊 Monitoring & Alerts

```javascript
// Setup monitoring
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.requestHandler());

// Your routes here

app.use(Sentry.Handlers.errorHandler());

// Custom monitoring
setInterval(async () => {
  try {
    const { data: count } = await supabase
      .from('transactions')
      .select('id')
      .gte('created_at', new Date(Date.now() - 60000).toISOString());
    
    console.log(`Transactions in last minute: ${count.length}`);
    
    if (count.length > 100) {
      // Alert high transaction rate
      notifyAdmin('High transaction rate detected');
    }
  } catch (error) {
    Sentry.captureException(error);
  }
}, 60000);  // Every minute
```

---

## 🎯 Performance Targets

Aim for these metrics:

| Metric | Target | Tools |
|--------|--------|-------|
| Page Load | < 3 sec | Lighthouse |
| API Response | < 200 ms | Chrome DevTools |
| Database Query | < 100 ms | EXPLAIN ANALYZE |
| Uptime | > 99.5% | Uptime Robot |
| Error Rate | < 0.1% | Sentry |

---

**Gunakan guide ini untuk optimize dan maintain production system! 🚀**
