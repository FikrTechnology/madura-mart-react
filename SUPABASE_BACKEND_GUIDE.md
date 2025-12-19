# Supabase Backend Guide - Express.js Integration

Panduan implementasi backend Express.js yang terintegrasi dengan Supabase.

---

## 📦 Setup Backend untuk Supabase

### Perbedaan dengan MySQL Backend

| Aspect | MySQL Backend | Supabase Backend |
|--------|---------------|-----------------|
| Database Driver | `mysql2` | `@supabase/supabase-js` |
| Connection Type | TCP Connection | HTTP REST API |
| Authentication | Session/JWT manual | Built-in JWT |
| User Management | Manual tables | Built-in Auth service |
| Setup Complexity | More steps | Simple initialization |
| Query Language | SQL (via raw queries) | ORM-like API |

---

## 🚀 Step 1: Install Dependencies

```bash
# Create backend project
mkdir madura-mart-backend
cd madura-mart-backend

# Initialize Node project
npm init -y

# Install dependencies
npm install express @supabase/supabase-js cors dotenv bcryptjs jsonwebtoken

# Dev dependencies
npm install -D nodemon

# Create package.json scripts
```

**package.json:**

```json
{
  "name": "madura-mart-backend",
  "version": "1.0.0",
  "description": "Madura Mart POS Backend with Supabase",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "@supabase/supabase-js": "^2.38.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 📝 Step 2: Environment Variables

**File: `.env`**

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Backend
PORT=3001
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000

# JWT (optional, Supabase handles this)
JWT_SECRET=your_jwt_secret_minimum_32_characters_long

# Logging
LOG_LEVEL=debug
```

**File: `.env.example`** (untuk Git)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_here
LOG_LEVEL=debug
```

---

## 🔧 Step 3: Setup Supabase Client

**File: `src/config/supabase.js`**

```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client untuk user requests (dengan auth)
const supabase = createClient(supabaseUrl, supabaseKey);

// Client untuk admin operations (full access)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase, supabaseAdmin };
```

---

## 🛡️ Step 4: Middleware - Authentication

**File: `src/middleware/auth.js`**

```javascript
const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    // Extract token dari "Bearer xxxxx"
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    // Option 1: Manual verify dengan JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret');
    req.user = decoded;

    // Option 2: Verify dengan Supabase (recommended)
    // const { data: { user }, error } = await supabase.auth.getUser(token);
    // if (error || !user) {
    //   return res.status(401).json({ error: 'Invalid token' });
    // }
    // req.user = user;

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token', details: error.message });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

module.exports = { verifyToken, requireRole };
```

---

## 🎮 Step 5: Controllers

### 5.1 Authentication Controller

**File: `src/controllers/authController.js`**

```javascript
const { supabase, supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password diperlukan' });
    }

    // Search user dari tabel users
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    // Jika tidak ditemukan di users, search di employees
    if (!user) {
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .single();

      user = employee;
    }

    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    // Get outlets untuk user
    let outlets = [];

    if (user.role === 'owner') {
      // Owner dapat akses semua outlets
      const { data: ownerOutlets } = await supabase
        .from('outlets')
        .select('*')
        .eq('owner_id', user.id);

      outlets = ownerOutlets || [];
    } else if (user.role === 'admin' || user.role === 'cashier') {
      // Admin/cashier dapat akses assigned outlets
      const { data: assignments } = await supabase
        .from('employee_outlet_assignment')
        .select('outlet_id, outlets(*)')
        .eq('employee_id', user.id);

      outlets = assignments?.map(a => a.outlets) || [];
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      process.env.JWT_SECRET || 'super-secret',
      { expiresIn: '24h' }
    );

    // Log login ke audit_logs
    await supabase
      .from('audit_logs')
      .insert({
        id: `log-${Date.now()}`,
        user_id: user.id,
        action: 'login',
        entity_type: 'auth',
        created_at: new Date().toISOString()
      });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      outlets: outlets.map(o => ({
        id: o.id,
        name: o.name,
        address: o.address
      }))
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    // Log logout
    if (req.user) {
      await supabase
        .from('audit_logs')
        .insert({
          id: `log-${Date.now()}`,
          user_id: req.user.id,
          action: 'logout',
          entity_type: 'auth',
          created_at: new Date().toISOString()
        });
    }

    res.json({ success: true, message: 'Logout berhasil' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
};
```

### 5.2 Products Controller

**File: `src/controllers/productController.js`**

```javascript
const { supabase } = require('../config/supabase');

exports.getProducts = async (req, res) => {
  try {
    const { outlet_id, category, search } = req.query;

    if (!outlet_id) {
      return res.status(400).json({ error: 'outlet_id diperlukan' });
    }

    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        sku,
        price,
        category,
        status,
        product_stock(quantity)
      `)
      .eq('outlet_id', outlet_id)
      .eq('status', 'active');

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    const { data: products, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { outlet_id, name, sku, price, cost, category } = req.body;

    if (!outlet_id || !name || !sku || !price) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const productId = `prod-${Date.now()}`;

    // Create product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        id: productId,
        outlet_id,
        name,
        sku,
        price: parseFloat(price),
        cost: parseFloat(cost) || 0,
        category,
        status: 'active'
      })
      .select();

    if (productError) throw productError;

    // Create product_stock entry
    const { error: stockError } = await supabase
      .from('product_stock')
      .insert({
        id: `stock-${Date.now()}`,
        product_id: productId,
        outlet_id,
        quantity: 0,
        reorder_level: 10
      });

    if (stockError) throw stockError;

    // Log to audit
    await supabase.from('audit_logs').insert({
      id: `log-${Date.now()}`,
      outlet_id,
      user_id: req.user?.id,
      action: 'create',
      entity_type: 'product',
      entity_id: productId,
      new_values: product[0],
      created_at: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      data: product[0]
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { product_id, outlet_id, quantity, type, reference_id } = req.body;

    if (!product_id || !outlet_id || quantity === undefined) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Get current stock
    const { data: currentStock } = await supabase
      .from('product_stock')
      .select('quantity')
      .eq('product_id', product_id)
      .eq('outlet_id', outlet_id)
      .single();

    const newQuantity = currentStock.quantity + quantity;

    // Update stock
    const { error: updateError } = await supabase
      .from('product_stock')
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq('product_id', product_id)
      .eq('outlet_id', outlet_id);

    if (updateError) throw updateError;

    // Log stock movement
    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        id: `mov-${Date.now()}`,
        product_id,
        outlet_id,
        type: type || (quantity > 0 ? 'in' : 'out'),
        quantity: Math.abs(quantity),
        reference_id,
        reference_type: 'stock_adjustment',
        created_by: req.user?.id,
        created_at: new Date().toISOString()
      });

    if (movementError) throw movementError;

    res.json({
      success: true,
      message: 'Stock updated',
      newQuantity
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
};
```

### 5.3 Transactions Controller

**File: `src/controllers/transactionController.js`**

```javascript
const { supabase } = require('../config/supabase');

exports.createTransaction = async (req, res) => {
  try {
    const {
      outlet_id,
      cashier_id,
      customer_name,
      items,
      payment_method,
      discount = 0,
      tax = 0
    } = req.body;

    if (!outlet_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'Invalid transaction data' });
    }

    // Generate transaction number
    const transactionNumber = `TRX-${Date.now()}`;
    const transactionId = `trans-${Date.now()}`;

    // Calculate totals
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.quantity * item.unit_price;
    });

    const totalAmount = subtotal - discount + tax;

    // Create transaction
    const { data: transaction, error: transError } = await supabase
      .from('transactions')
      .insert({
        id: transactionId,
        outlet_id,
        cashier_id,
        transaction_number: transactionNumber,
        customer_name,
        subtotal,
        discount,
        tax,
        total_amount: totalAmount,
        payment_method,
        status: 'completed',
        transaction_date: new Date().toISOString()
      })
      .select();

    if (transError) throw transError;

    // Insert transaction items and reduce stock
    for (const item of items) {
      // Add transaction item
      const { error: itemError } = await supabase
        .from('transaction_items')
        .insert({
          id: `item-${Date.now()}-${Math.random()}`,
          transaction_id: transactionId,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount || 0,
          subtotal: (item.quantity * item.unit_price) - (item.discount || 0)
        });

      if (itemError) throw itemError;

      // Reduce stock
      const { data: currentStock } = await supabase
        .from('product_stock')
        .select('quantity')
        .eq('product_id', item.product_id)
        .eq('outlet_id', outlet_id)
        .single();

      const newQuantity = currentStock.quantity - item.quantity;

      await supabase
        .from('product_stock')
        .update({ quantity: newQuantity })
        .eq('product_id', item.product_id)
        .eq('outlet_id', outlet_id);

      // Log stock movement
      await supabase
        .from('stock_movements')
        .insert({
          id: `mov-${Date.now()}-${Math.random()}`,
          product_id: item.product_id,
          outlet_id,
          type: 'out',
          quantity: item.quantity,
          reference_id: transactionId,
          reference_type: 'transaction',
          created_by: cashier_id,
          created_at: new Date().toISOString()
        });
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      id: `log-${Date.now()}`,
      outlet_id,
      user_id: cashier_id,
      action: 'create',
      entity_type: 'transaction',
      entity_id: transactionId,
      new_values: { total_amount: totalAmount },
      created_at: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      data: transaction[0]
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { outlet_id, limit = 100, offset = 0 } = req.query;

    if (!outlet_id) {
      return res.status(400).json({ error: 'outlet_id diperlukan' });
    }

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        id,
        transaction_number,
        customer_name,
        total_amount,
        payment_method,
        status,
        transaction_date,
        transaction_items(*)
      `)
      .eq('outlet_id', outlet_id)
      .order('transaction_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};
```

### 5.4 Reports Controller

**File: `src/controllers/reportController.js`**

```javascript
const { supabase } = require('../config/supabase');

exports.getSalesReport = async (req, res) => {
  try {
    const { outlet_id, start_date, end_date } = req.query;

    if (!outlet_id) {
      return res.status(400).json({ error: 'outlet_id diperlukan' });
    }

    // Get sales summary
    let query = supabase
      .from('transactions')
      .select('total_amount, transaction_date')
      .eq('outlet_id', outlet_id)
      .eq('status', 'completed');

    if (start_date) {
      query = query.gte('transaction_date', start_date);
    }

    if (end_date) {
      query = query.lte('transaction_date', end_date);
    }

    const { data: transactions } = await query;

    // Calculate metrics
    const totalSales = transactions.reduce((sum, t) => sum + t.total_amount, 0);
    const transactionCount = transactions.length;
    const avgTransaction = transactionCount > 0 ? totalSales / transactionCount : 0;

    // Get top products
    const { data: topProducts } = await supabase
      .from('transaction_items')
      .select(`
        product_id,
        products(name, sku),
        quantity,
        subtotal
      `)
      .eq('transactions.outlet_id', outlet_id);

    res.json({
      success: true,
      data: {
        summary: {
          total_sales: totalSales,
          transaction_count: transactionCount,
          avg_transaction: avgTransaction,
          period: {
            start: start_date,
            end: end_date
          }
        },
        top_products: topProducts?.slice(0, 10) || []
      }
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};
```

---

## 🛣️ Step 6: Routes

**File: `src/routes/auth.js`**

```javascript
const express = require('express');
const { login, logout, verifyToken } = require('../controllers/authController');
const { verifyToken: verifyAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/logout', verifyAuth, logout);
router.get('/verify', verifyAuth, verifyToken);

module.exports = router;
```

**File: `src/routes/products.js`**

```javascript
const express = require('express');
const { 
  getProducts, 
  createProduct, 
  updateStock 
} = require('../controllers/productController');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, getProducts);
router.post('/', verifyToken, requireRole('owner', 'admin'), createProduct);
router.patch('/stock', verifyToken, requireRole('owner', 'admin', 'cashier'), updateStock);

module.exports = router;
```

**File: `src/routes/transactions.js`**

```javascript
const express = require('express');
const {
  createTransaction,
  getTransactions
} = require('../controllers/transactionController');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, requireRole('cashier', 'admin'), createTransaction);
router.get('/', verifyToken, getTransactions);

module.exports = router;
```

**File: `src/routes/reports.js`**

```javascript
const express = require('express');
const { getSalesReport } = require('../controllers/reportController');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/sales', verifyToken, requireRole('owner', 'admin'), getSalesReport);

module.exports = router;
```

---

## 🏗️ Step 7: Main App File

**File: `src/app.js`**

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');
const reportRoutes = require('./routes/reports');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
```

**File: `server.js`**

```javascript
const app = require('./src/app');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Supabase: ${process.env.SUPABASE_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
```

---

## 🧪 Step 8: Testing dengan Postman

### Login
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "owner@madura.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "user-owner-001",
    "email": "owner@madura.com",
    "role": "owner"
  },
  "outlets": [...]
}
```

### Get Products
```
GET http://localhost:3001/api/products?outlet_id=outlet-001
Authorization: Bearer eyJhbGc...

Response:
{
  "success": true,
  "data": [...]
}
```

### Create Transaction
```
POST http://localhost:3001/api/transactions
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "outlet_id": "outlet-001",
  "cashier_id": "emp-cashier-001",
  "customer_name": "John Doe",
  "items": [
    {
      "product_id": "prod-001",
      "quantity": 2,
      "unit_price": 50000,
      "discount": 0
    }
  ],
  "payment_method": "cash",
  "discount": 0,
  "tax": 0
}

Response:
{
  "success": true,
  "data": {...}
}
```

---

## 🚀 Step 9: Run Backend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Output:
# 🚀 Server running on port 3001
# Environment: development
# Supabase: https://xxxxx.supabase.co
```

---

## 🔒 Security Considerations

- ✅ Always use `SUPABASE_SERVICE_ROLE_KEY` hanya di backend
- ✅ Validate input di semua endpoints
- ✅ Use role-based access control
- ✅ Hash passwords dengan bcryptjs
- ✅ JWT expiry set ke 24 jam
- ✅ Log semua aksi penting
- ✅ Use HTTPS di production

---

## 📋 Deployment Checklist

- [ ] `.env` file configured dengan Supabase credentials
- [ ] `.env` tidak di-commit ke Git
- [ ] All routes tested dengan Postman
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] CORS configured untuk production URL
- [ ] JWT_SECRET set ke strong value
- [ ] Rate limiting implemented (optional)
- [ ] Database backups tested

---

## 🎯 Next Steps

1. ✅ Backend setup dengan Supabase
2. ✅ Controllers & routes implemented
3. ✅ Testing dengan Postman
4. ➡️ **Update frontend** (see [SUPABASE_FRONTEND_INTEGRATION.md](SUPABASE_FRONTEND_INTEGRATION.md))

---

**Backend setup selesai! Mari ke frontend integration 🚀**
