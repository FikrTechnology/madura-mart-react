# Panduan Migrasi localStorage ke Database & API Integration

Dokumentasi lengkap untuk migrasi dari local storage ke database MySQL dan integrasi dengan backend API.

---

## 📚 Daftar Isi

1. [Setup Database](#setup-database)
2. [Migrasi Data](#migrasi-data)
3. [Backend Setup](#backend-setup)
4. [API Endpoints](#api-endpoints)
5. [Frontend Integration](#frontend-integration)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Setup Database

### Prerequisite
- MySQL Server 5.7+ atau 8.0+
- Database Management Tool (MySQL Workbench, phpMyAdmin, atau DBeaver)
- Node.js Backend Server

### Step 1: Create Database

```sql
CREATE DATABASE madura_mart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE madura_mart_db;
```

### Step 2: Run SQL Schema

1. Buka file `database_setup.sql` di project root
2. Copy seluruh isi file
3. Jalankan di MySQL client / terminal:

```bash
mysql -u root -p madura_mart_db < database_setup.sql
```

Atau via MySQL Workbench:
- File → Open SQL Script
- Pilih `database_setup.sql`
- Execute All (Ctrl + Shift + Enter)

### Step 3: Verify Tables

```sql
USE madura_mart_db;
SHOW TABLES;

-- Should show 13 tables:
-- users, outlets, employees, employee_outlet_assignment, products, product_stock,
-- stock_movements, payment_methods, transactions, transaction_items, shift_records,
-- audit_logs, reports_cache
```

---

## 📤 Migrasi Data

### Data Flow: localStorage → CSV/JSON → Database

#### Option 1: Export dari Browser Console

Di browser console, jalankan:

```javascript
// Export semua data dari localStorage
const data = {
  users: JSON.parse(localStorage.getItem('madura_users') || '[]'),
  outlets: JSON.parse(localStorage.getItem('madura_outlets') || '[]'),
  employees: JSON.parse(localStorage.getItem('madura_employees') || '[]'),
  products: JSON.parse(localStorage.getItem('madura_products') || '[]'),
  transactions: JSON.parse(localStorage.getItem('madura_transactions') || '[]'),
  payment_methods: JSON.parse(localStorage.getItem('madura_payment_methods') || '[]'),
};

// Download as JSON
const dataStr = JSON.stringify(data, null, 2);
const dataBlob = new Blob([dataStr], { type: 'application/json' });
const url = URL.createObjectURL(dataBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'madura_mart_backup.json';
link.click();
```

#### Option 2: Create Migration Script (Node.js)

Buat file `migrate.js` di backend:

```javascript
const mysql = require('mysql2/promise');
const fs = require('fs');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'madura_mart_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function migrateData() {
  const conn = await pool.getConnection();
  
  try {
    // Read backup file
    const backupData = JSON.parse(fs.readFileSync('./madura_mart_backup.json', 'utf8'));
    
    console.log('Starting migration...');
    
    // 1. Migrate Users
    for (const user of backupData.users) {
      await conn.execute(
        'INSERT INTO users (id, email, password, name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        [user.id, user.email, user.password, user.name, user.role, true]
      );
    }
    console.log('✓ Users migrated');
    
    // 2. Migrate Outlets
    for (const outlet of backupData.outlets) {
      await conn.execute(
        'INSERT INTO outlets (id, name, owner_id, address, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
        [outlet.id, outlet.name, outlet.owner_id || 'user_001', outlet.address, outlet.phone, outlet.status || 'active']
      );
    }
    console.log('✓ Outlets migrated');
    
    // 3. Migrate Employees
    for (const emp of backupData.employees) {
      await conn.execute(
        `INSERT INTO employees (id, outlet_id, name, email, password, role, status, hire_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [emp.id, emp.outlet_id, emp.name, emp.email, emp.password, emp.role, emp.status || 'active', new Date().toISOString().split('T')[0]]
      );
    }
    console.log('✓ Employees migrated');
    
    // 4. Migrate Products
    for (const product of backupData.products) {
      await conn.execute(
        `INSERT INTO products (id, outlet_id, name, category, price, stock, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [product.id, product.outlet_id, product.name, product.category, product.price, 0, true]
      );
      
      // Create stock entry
      await conn.execute(
        `INSERT INTO product_stock (product_id, outlet_id, quantity_in_stock)
         VALUES (?, ?, ?)`,
        [product.id, product.outlet_id, product.stock || 0]
      );
    }
    console.log('✓ Products migrated');
    
    // 5. Migrate Transactions
    for (const tx of backupData.transactions) {
      await conn.execute(
        `INSERT INTO transactions (id, outlet_id, transaction_date, total_amount, payment_method, amount_paid, change_amount, status)
         VALUES (?, ?, FROM_UNIXTIME(?), ?, ?, ?, ?, ?)`,
        [
          tx.id,
          tx.outlet_id,
          Math.floor((tx.timestamp || Date.now()) / 1000),
          tx.total,
          tx.paymentMethod || 'cash',
          tx.amountPaid || tx.total,
          tx.change || 0,
          'completed'
        ]
      );
      
      // Add transaction items
      for (const item of (tx.items || [])) {
        await conn.execute(
          `INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?)`,
          [tx.id, item.id, item.quantity, item.price, item.quantity * item.price]
        );
      }
    }
    console.log('✓ Transactions migrated');
    
    // 6. Migrate Payment Methods
    for (const pm of backupData.payment_methods) {
      await conn.execute(
        `INSERT INTO payment_methods (outlet_id, name, code, type, is_active)
         VALUES (?, ?, ?, ?, ?)`,
        [pm.outlet_id, pm.name, pm.code || pm.name.toLowerCase(), pm.type || 'cash', true]
      );
    }
    console.log('✓ Payment Methods migrated');
    
    console.log('\n✓ Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    await conn.rollback();
  } finally {
    await conn.end();
  }
}

migrateData();
```

**Jalankan:**
```bash
node migrate.js
```

---

## 🖥️ Backend Setup (Node.js + Express)

### Requirement

```bash
npm install express mysql2 cors dotenv bcryptjs jsonwebtoken
```

### File Structure

```
backend/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── transactionController.js
│   └── reportController.js
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── transactions.js
│   └── reports.js
├── middleware/
│   └── auth.js
├── .env
└── server.js
```

### 1. config/database.js

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
});

module.exports = pool;
```

### 2. .env

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=madura_mart_db
JWT_SECRET=your_jwt_secret_key_here_should_be_long_and_random
PORT=3001
NODE_ENV=development
```

### 3. server.js

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/reports', require('./routes/reports'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

## 🔌 API Endpoints

### Authentication

#### POST /api/auth/login
```json
Request:
{
  "email": "fikri@madura.com",
  "password": "fikri123"
}

Response:
{
  "success": true,
  "user": {
    "id": "user_001",
    "email": "fikri@madura.com",
    "name": "Fikri (Owner)",
    "role": "owner"
  },
  "outlets": [
    { "id": "outlet_001", "name": "Toko Madura - Sidoarjo", ... },
    { "id": "outlet_002", "name": "Toko Madura - Surabaya", ... }
  ],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/auth/logout
```json
Response:
{
  "success": true,
  "message": "Logout successful"
}
```

### Products

#### GET /api/products?outlet_id=outlet_001
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Beras Premium 5kg",
      "price": 75000,
      "category": "Kebutuhan Dapur",
      "stock": 25
    },
    ...
  ]
}
```

#### POST /api/products
```json
Request:
{
  "outlet_id": "outlet_001",
  "name": "Beras Premium 5kg",
  "category": "Kebutuhan Dapur",
  "price": 75000,
  "stock": 25
}

Response:
{
  "success": true,
  "message": "Product created",
  "data": { "id": 1, ... }
}
```

### Transactions

#### POST /api/transactions/checkout
```json
Request:
{
  "outlet_id": "outlet_001",
  "cashier_id": "emp_002",
  "items": [
    { "product_id": 1, "quantity": 2, "unit_price": 75000 }
  ],
  "payment_method": "cash",
  "total_amount": 150000,
  "amount_paid": 150000
}

Response:
{
  "success": true,
  "message": "Transaction completed",
  "transaction_id": "tx_1234567890"
}
```

#### GET /api/transactions?outlet_id=outlet_001&date=2024-01-20
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "tx_001",
      "total_amount": 150000,
      "payment_method": "cash",
      "transaction_date": "2024-01-20 10:30:00",
      "items": [...]
    }
  ]
}
```

### Reports

#### GET /api/reports/sales?outlet_id=outlet_001&start_date=2024-01-01&end_date=2024-01-31
```json
Response:
{
  "success": true,
  "data": {
    "total_sales": 5000000,
    "total_transactions": 150,
    "avg_transaction": 33333,
    "top_products": [...],
    "daily_sales": [...]
  }
}
```

---

## 🔗 Frontend Integration

### Setup API Client (Axios)

Buat file `src/utils/api.js`:

```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use((response) => {
  return response.data;
}, (error) => {
  if (error.response?.status === 401) {
    // Redirect to login
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }
  return Promise.reject(error.response?.data || error);
});

export default api;
```

### Update OutletContext.js

```javascript
import api from '../utils/api';

const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    // Save token
    localStorage.setItem('auth_token', response.token);
    
    setCurrentUser(response.user);
    setUserOutlets(response.outlets);
    
    return response;
  } catch (error) {
    throw error;
  }
};

const selectOutlet = async (outletId) => {
  try {
    // Fetch outlet details from API if needed
    const outlet = userOutlets.find(o => o.id === outletId);
    if (!outlet) {
      throw new Error('Outlet tidak ditemukan');
    }
    setCurrentOutlet(outlet);
  } catch (error) {
    throw error;
  }
};
```

### Update HomePage.js

```javascript
import api from '../utils/api';

const handleCheckout = async () => {
  try {
    const response = await api.post('/transactions/checkout', {
      outlet_id: outletId,
      cashier_id: currentUser.id,
      items: cartItems,
      payment_method: paymentMethod,
      total_amount: total,
      amount_paid: amountPaid,
    });
    
    setTransactions([...transactions, response.data]);
    setCartItems([]);
    setActiveMenu('history');
  } catch (error) {
    setError(error.message);
  }
};
```

### .env.local (Frontend)

```env
REACT_APP_API_URL=http://localhost:3001/api
```

---

## 📋 Migration Checklist

- [ ] Database created dan schema sudah di-run
- [ ] Demo data sudah ter-insert
- [ ] Backend server berjalan di port 3001
- [ ] API endpoints di-test dengan Postman
- [ ] Frontend API client dikonfigurasi
- [ ] Auth token di-simpan dan di-send dengan requests
- [ ] Error handling di-implement
- [ ] CORS di-configure dengan benar

---

## 🔧 Troubleshooting

### Error: "Connection refused"
```
Database tidak berjalan atau port salah
- Cek: mysql -u root -p
- Cek port di .env (default 3306)
```

### Error: "ER_BAD_FIELD_ERROR"
```
Table atau column tidak sesuai
- Verify: SHOW TABLES; SHOW COLUMNS FROM users;
- Re-run: database_setup.sql
```

### Error: "JWT token invalid"
```
Token expired atau corrupted
- Clear localStorage dan login ulang
- Extend token expiry di backend (default 24 jam)
```

### CORS Error
```
Backend dan frontend di port berbeda
- Tambah CORS di Express: app.use(cors({
    origin: 'http://localhost:3000'
  }));
```

---

## 📚 Additional Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Express.js Guide](https://expressjs.com/)
- [JWT Authentication](https://jwt.io/)
- [Axios Documentation](https://axios-http.com/)

---

Good luck dengan implementasi database! 🚀
