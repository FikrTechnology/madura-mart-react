# Backend API Implementation Guide

Contoh kode lengkap untuk backend API menggunakan Express.js dan MySQL.

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── transactionController.js
│   │   └── reportController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── transactions.js
│   │   └── reports.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── validation.js
│   │   └── helpers.js
│   └── app.js
├── .env
├── .env.example
├── package.json
└── server.js
```

---

## 📦 Package.json

```json
{
  "name": "madura-mart-api",
  "version": "1.0.0",
  "description": "Madura Mart POS System API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.0",
    "joi": "^17.11.0",
    "express-validator": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0"
  }
}
```

---

## 🔧 Configuration Files

### config/database.js

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'madura_mart_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 30000,
  // SSL configuration (optional, untuk production)
  // ssl: 'Amazon RDS' atau lainnya
});

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('✓ Database connected');
    conn.release();
  })
  .catch(err => {
    console.error('✗ Database connection failed:', err);
    process.exit(1);
  });

module.exports = pool;
```

### .env

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=madura_mart_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRY=24h

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### .env.example

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=madura_mart_db

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=24h

PORT=3001
NODE_ENV=development

FRONTEND_URL=http://localhost:3000
```

---

## 🛡️ Middleware

### middleware/auth.js

```javascript
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
    
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }
    next();
  };
};

module.exports = { auth, requireRole };
```

### middleware/errorHandler.js

```javascript
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Validation errors
  if (err.validation) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }
  
  // Database errors
  if (err.sqlState) {
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;
```

---

## 🔐 Controllers

### controllers/authController.js

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi'
      });
    }
    
    const conn = await pool.getConnection();
    
    try {
      // Find user in users table
      let [users] = await conn.execute(
        'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
        [email]
      );
      
      let user = users[0];
      
      // If not found in users, check employees table
      if (!user) {
        [users] = await conn.execute(
          'SELECT * FROM employees WHERE email = ? AND status = "active"',
          [email]
        );
        user = users[0];
      }
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }
      
      // Get outlets for this user
      let outlets = [];
      
      if (user.role === 'owner') {
        // Owner can access all their outlets
        [outlets] = await conn.execute(
          'SELECT * FROM outlets WHERE owner_id = ? AND status = "active"',
          [user.id]
        );
      } else if (user.role === 'admin' || user.role === 'cashier') {
        // Admin/Cashier can access assigned outlets
        [outlets] = await conn.execute(
          `SELECT DISTINCT o.* FROM outlets o
           JOIN employee_outlet_assignment eoa ON o.id = eoa.outlet_id
           WHERE eoa.employee_id = ? AND o.status = "active"`,
          [user.id]
        );
      }
      
      if (outlets.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'User tidak memiliki akses ke outlet aktif'
        });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          outlet_id: outlets[0].id
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '24h' }
      );
      
      // Record login in audit_logs
      await conn.execute(
        `INSERT INTO audit_logs (outlet_id, user_id, action, description, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [outlets[0].id, user.id, 'login', `User ${user.email} logged in`]
      );
      
      res.json({
        success: true,
        message: 'Login berhasil',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        outlets
      });
      
    } finally {
      conn.release();
    }
    
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    // Record logout in audit_logs
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        `INSERT INTO audit_logs (outlet_id, user_id, action, description, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [req.user.outlet_id, req.user.id, 'logout', `User ${req.user.email} logged out`]
      );
    } finally {
      conn.release();
    }
    
    res.json({
      success: true,
      message: 'Logout berhasil'
    });
    
  } catch (error) {
    next(error);
  }
};

exports.verifyToken = (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};
```

### controllers/productController.js

```javascript
const pool = require('../config/database');

exports.getProducts = async (req, res, next) => {
  try {
    const { outlet_id, category, search } = req.query;
    
    let query = 'SELECT * FROM products WHERE is_active = TRUE';
    const params = [];
    
    if (outlet_id) {
      query += ' AND outlet_id = ?';
      params.push(outlet_id);
    }
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY name';
    
    const conn = await pool.getConnection();
    try {
      const [products] = await conn.execute(query, params);
      
      // Get stock info for each product
      const productsWithStock = await Promise.all(
        products.map(async (product) => {
          const [stock] = await conn.execute(
            'SELECT quantity_in_stock FROM product_stock WHERE product_id = ? AND outlet_id = ?',
            [product.id, product.outlet_id]
          );
          return {
            ...product,
            stock: stock[0]?.quantity_in_stock || 0
          };
        })
      );
      
      res.json({
        success: true,
        data: productsWithStock
      });
      
    } finally {
      conn.release();
    }
    
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { outlet_id, name, category, price, sku, description } = req.body;
    
    // Validate input
    if (!outlet_id || !name || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Field yang diperlukan belum lengkap'
      });
    }
    
    const conn = await pool.getConnection();
    
    try {
      const productId = `prod_${Date.now()}`;
      
      await conn.execute(
        `INSERT INTO products (id, outlet_id, name, category, price, sku, description, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [productId, outlet_id, name, category, price, sku, description]
      );
      
      // Create stock entry
      await conn.execute(
        `INSERT INTO product_stock (product_id, outlet_id, quantity_in_stock)
         VALUES (?, ?, 0)`,
        [productId, outlet_id]
      );
      
      // Log to audit
      await conn.execute(
        `INSERT INTO audit_logs (outlet_id, user_id, action, entity_type, entity_id, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [outlet_id, req.user.id, 'create_product', 'product', productId, `Created product: ${name}`]
      );
      
      res.status(201).json({
        success: true,
        message: 'Product berhasil dibuat',
        data: { id: productId, name, category, price }
      });
      
    } finally {
      conn.release();
    }
    
  } catch (error) {
    next(error);
  }
};

exports.updateStock = async (req, res, next) => {
  try {
    const { product_id, outlet_id, quantity, movement_type, notes } = req.body;
    
    const conn = await pool.getConnection();
    
    try {
      // Update stock
      await conn.execute(
        `UPDATE product_stock SET quantity_in_stock = ?
         WHERE product_id = ? AND outlet_id = ?`,
        [quantity, product_id, outlet_id]
      );
      
      // Log movement
      await conn.execute(
        `INSERT INTO stock_movements (product_id, outlet_id, movement_type, quantity, reference_type, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [product_id, outlet_id, movement_type, quantity, 'manual_adjustment', notes, req.user.id]
      );
      
      res.json({
        success: true,
        message: 'Stock berhasil diupdate'
      });
      
    } finally {
      conn.release();
    }
    
  } catch (error) {
    next(error);
  }
};
```

### controllers/transactionController.js

```javascript
const pool = require('../config/database');

exports.createTransaction = async (req, res, next) => {
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();
    
    const {
      outlet_id,
      items,
      payment_method,
      amount_paid,
      total_amount,
      notes
    } = req.body;
    
    // Validate items exist and have sufficient stock
    for (const item of items) {
      const [stock] = await conn.execute(
        'SELECT quantity_in_stock FROM product_stock WHERE product_id = ? AND outlet_id = ?',
        [item.product_id, outlet_id]
      );
      
      if (!stock[0] || stock[0].quantity_in_stock < item.quantity) {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          message: `Stok produk ${item.product_id} tidak cukup`
        });
      }
    }
    
    // Create transaction
    const transactionId = `tx_${Date.now()}`;
    
    await conn.execute(
      `INSERT INTO transactions 
       (id, outlet_id, cashier_id, transaction_date, total_amount, payment_method, amount_paid, change_amount, notes, status)
       VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, 'completed')`,
      [
        transactionId,
        outlet_id,
        req.user.id,
        total_amount,
        payment_method,
        amount_paid,
        amount_paid - total_amount,
        notes
      ]
    );
    
    // Add transaction items and reduce stock
    for (const item of items) {
      // Add item to transaction
      await conn.execute(
        `INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?)`,
        [transactionId, item.product_id, item.quantity, item.price, item.quantity * item.price]
      );
      
      // Reduce stock
      await conn.execute(
        `UPDATE product_stock SET quantity_in_stock = quantity_in_stock - ?
         WHERE product_id = ? AND outlet_id = ?`,
        [item.quantity, item.product_id, outlet_id]
      );
      
      // Log stock movement
      await conn.execute(
        `INSERT INTO stock_movements (product_id, outlet_id, movement_type, quantity, reference_type, reference_id, created_by)
         VALUES (?, ?, 'out', ?, 'transaction', ?, ?)`,
        [item.product_id, outlet_id, item.quantity, transactionId, req.user.id]
      );
    }
    
    await conn.commit();
    
    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil dibuat',
      transaction_id: transactionId
    });
    
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const { outlet_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT t.*, 
             JSON_ARRAYAGG(
               JSON_OBJECT(
                 'product_id', ti.product_id,
                 'quantity', ti.quantity,
                 'unit_price', ti.unit_price,
                 'total_price', ti.total_price
               )
             ) as items
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE 1=1
    `;
    const params = [];
    
    if (outlet_id) {
      query += ' AND t.outlet_id = ?';
      params.push(outlet_id);
    }
    
    if (start_date && end_date) {
      query += ' AND DATE(t.transaction_date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    query += ' GROUP BY t.id ORDER BY t.transaction_date DESC LIMIT 100';
    
    const conn = await pool.getConnection();
    try {
      const [transactions] = await conn.execute(query, params);
      
      res.json({
        success: true,
        data: transactions
      });
      
    } finally {
      conn.release();
    }
    
  } catch (error) {
    next(error);
  }
};
```

### controllers/reportController.js

```javascript
const pool = require('../config/database');

exports.getSalesReport = async (req, res, next) => {
  try {
    const { outlet_id, start_date, end_date } = req.query;
    
    const conn = await pool.getConnection();
    
    try {
      // Total Sales
      let query = 'SELECT SUM(total_amount) as total FROM transactions WHERE status = "completed"';
      const params = [];
      
      if (outlet_id) {
        query += ' AND outlet_id = ?';
        params.push(outlet_id);
      }
      
      if (start_date && end_date) {
        query += ' AND DATE(transaction_date) BETWEEN ? AND ?';
        params.push(start_date, end_date);
      }
      
      const [salesResult] = await conn.execute(query, params);
      
      // Top Products
      let topQuery = `
        SELECT p.name, SUM(ti.quantity) as qty_sold, SUM(ti.total_price) as revenue
        FROM transaction_items ti
        JOIN products p ON ti.product_id = p.id
        JOIN transactions t ON ti.transaction_id = t.id
        WHERE t.status = 'completed'
      `;
      const topParams = [];
      
      if (outlet_id) {
        topQuery += ' AND t.outlet_id = ?';
        topParams.push(outlet_id);
      }
      
      if (start_date && end_date) {
        topQuery += ' AND DATE(t.transaction_date) BETWEEN ? AND ?';
        topParams.push(start_date, end_date);
      }
      
      topQuery += ' GROUP BY p.id ORDER BY revenue DESC LIMIT 10';
      
      const [topProducts] = await conn.execute(topQuery, topParams);
      
      res.json({
        success: true,
        data: {
          total_sales: salesResult[0]?.total || 0,
          top_products: topProducts
        }
      });
      
    } finally {
      conn.release();
    }
    
  } catch (error) {
    next(error);
  }
};
```

---

## 📍 Routes

### routes/auth.js

```javascript
const express = require('express');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', authController.login);
router.post('/logout', auth, authController.logout);
router.get('/verify', auth, authController.verifyToken);

module.exports = router;
```

### routes/products.js

```javascript
const express = require('express');
const productController = require('../controllers/productController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, productController.getProducts);
router.post('/', auth, requireRole('admin', 'owner'), productController.createProduct);
router.patch('/stock', auth, requireRole('admin', 'owner'), productController.updateStock);

module.exports = router;
```

### routes/transactions.js

```javascript
const express = require('express');
const transactionController = require('../controllers/transactionController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, requireRole('cashier', 'admin'), transactionController.createTransaction);
router.get('/', auth, transactionController.getTransactions);

module.exports = router;
```

### routes/reports.js

```javascript
const express = require('express');
const reportController = require('../controllers/reportController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/sales', auth, requireRole('owner', 'admin'), reportController.getSalesReport);

module.exports = router;
```

---

## 🚀 Main Application Files

### app.js

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(require('./middleware/errorHandler'));

module.exports = app;
```

### server.js

```javascript
const app = require('./src/app');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`
    ╔═════════════════════════════════════╗
    ║  Madura Mart API Server             ║
    ║  Running on port ${PORT}               ║
    ║  Environment: ${process.env.NODE_ENV}      ║
    ╚═════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
```

---

## 🧪 Testing dengan Postman

### 1. Login
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "fikri@madura.com",
  "password": "fikri123"
}
```

### 2. Get Products
```
GET http://localhost:3001/api/products?outlet_id=outlet_001
Authorization: Bearer <token_dari_login>
```

### 3. Create Transaction
```
POST http://localhost:3001/api/transactions
Authorization: Bearer <token_dari_login>
Content-Type: application/json

{
  "outlet_id": "outlet_001",
  "items": [
    { "product_id": 1, "quantity": 2, "price": 75000 }
  ],
  "payment_method": "cash",
  "total_amount": 150000,
  "amount_paid": 150000
}
```

---

## 📝 Tips

- Selalu gunakan connection pooling untuk production
- Implement proper error handling dan validation
- Gunakan HTTPS untuk production
- Backup database secara regular
- Monitor performance dengan query analysis
- Implement rate limiting untuk API endpoints
- Secure sensitive data dengan encryption

---

Happy coding! 🎉
