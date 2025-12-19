# Database & Backend Setup - Complete Documentation

Dokumentasi lengkap untuk membuat Database MySQL dan Backend API untuk Madura Mart POS System.

---

## 📚 Dokumen yang Telah Dibuat

### 1. **DATABASE_SCHEMA.md** 
Dokumentasi struktur database lengkap dengan:
- Deskripsi 13 tabel utama
- Struktur field dan tipe data
- Relasi antar tabel
- ER Diagram
- Query umum untuk reporting
- Catatan implementasi

**File:** `DATABASE_SCHEMA.md`

### 2. **database_setup.sql**
SQL script siap jalankan yang mencakup:
- Pembuatan database dan tabel
- Sample data (demo users, outlets, payment methods)
- Views untuk reporting
- Indexes untuk performa
- Foreign key constraints

**File:** `database_setup.sql`
**Cara jalankan:**
```bash
mysql -u root -p madura_mart_db < database_setup.sql
```

### 3. **DATABASE_MIGRATION_GUIDE.md**
Panduan lengkap migrasi dari localStorage ke database:
- Setup database step-by-step
- Cara export data dari browser
- Migration script (Node.js)
- Backend setup dengan Express.js
- API endpoints documentation
- Frontend integration dengan Axios
- Troubleshooting common issues

**File:** `DATABASE_MIGRATION_GUIDE.md`

### 4. **BACKEND_API_GUIDE.md**
Contoh implementasi backend lengkap:
- Project structure
- Configuration files (.env, database.js)
- Middleware (auth, error handler)
- Controllers (auth, product, transaction, report)
- Routes setup
- Complete code examples
- Testing dengan Postman

**File:** `BACKEND_API_GUIDE.md`

---

## 🎯 Quick Start Guide

### Step 1: Setup Database (5-10 menit)

```bash
# 1. Login ke MySQL
mysql -u root -p

# 2. Create database
CREATE DATABASE madura_mart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE madura_mart_db;

# 3. Run script (copy-paste dari database_setup.sql)
# Atau jalankan dari terminal:
mysql -u root -p madura_mart_db < database_setup.sql
```

**Verifikasi:**
```sql
SHOW TABLES; -- Should show 13 tables
SELECT COUNT(*) FROM users; -- Should show 4 users
```

### Step 2: Migrasi Data dari localStorage (10-15 menit)

**Option A: Via Browser Console**
```javascript
// Jalankan di browser console saat aplikasi React berjalan
const data = {
  outlets: JSON.parse(localStorage.getItem('madura_outlets') || '[]'),
  employees: JSON.parse(localStorage.getItem('madura_employees') || '[]'),
  products: JSON.parse(localStorage.getItem('madura_products') || '[]'),
  transactions: JSON.parse(localStorage.getItem('madura_transactions') || '[]'),
};

// Download backup
const dataStr = JSON.stringify(data, null, 2);
const dataBlob = new Blob([dataStr], { type: 'application/json' });
const url = URL.createObjectURL(dataBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'madura_mart_backup.json';
link.click();
```

**Option B: Manual via SQL INSERT**
```sql
-- Insert dari file backup atau manual insert
INSERT INTO employees VALUES (...)
INSERT INTO products VALUES (...)
INSERT INTO transactions VALUES (...)
```

### Step 3: Setup Backend (15-20 menit)

```bash
# 1. Create backend directory
mkdir madura-mart-backend
cd madura-mart-backend

# 2. Initialize Node project
npm init -y

# 3. Install dependencies
npm install express mysql2 cors dotenv bcryptjs jsonwebtoken

# 4. Create .env file (copy dari BACKEND_API_GUIDE.md)
cat > .env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=madura_mart_db
JWT_SECRET=your_super_secret_key_here_minimum_32_chars
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF

# 5. Create server structure (lihat BACKEND_API_GUIDE.md)
# - src/config/database.js
# - src/controllers/*.js
# - src/routes/*.js
# - src/middleware/*.js
# - src/app.js
# - server.js

# 6. Start server
npm install -g nodemon
npm run dev
# or: node server.js
```

**Verifikasi:**
```bash
curl http://localhost:3001/health
# Response: {"status":"OK"}
```

### Step 4: Update Frontend (10-15 menit)

```bash
# 1. Install Axios (jika belum)
npm install axios

# 2. Create API client (src/utils/api.js)
# Copy dari BACKEND_API_GUIDE.md atau DATABASE_MIGRATION_GUIDE.md

# 3. Update OutletContext.js
# Ganti localStorage calls dengan API calls

# 4. Create .env.local
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env.local

# 5. Test dengan npm start
npm start
```

---

## 📊 Database Architecture

### 13 Main Tables:

```
Core:
├── users                    // Master user account (owner, admin, cashier)
├── outlets                  // Toko/cabang
├── employees                // Karyawan (admin, cashier yang dibuat owner)
└── employee_outlet_assignment  // Relasi employee ke multiple outlets

Products:
├── products                 // Master produk
├── product_stock            // Stok per outlet
└── stock_movements          // Audit trail stok

Transactions:
├── transactions             // Header transaksi penjualan
├── transaction_items        // Detail item per transaksi
└── payment_methods          // Metode pembayaran

Others:
├── shift_records            // Shift kasir (optional)
├── audit_logs               // Log aktivitas sistem
└── reports_cache            // Cache report (optional)
```

### Key Relations:

```
users (owner)
  ↓ 1:N
outlets
  ↓ 1:N
  ├─ products
  │  ├─ product_stock
  │  ├─ stock_movements
  │  └─ transaction_items
  ├─ employees
  │  ├─ employee_outlet_assignment
  │  └─ shift_records
  ├─ transactions
  │  └─ transaction_items
  └─ payment_methods
```

---

## 🔑 User Roles & Access

### Owner (Role: 'owner')
- Login dengan email dari `users` table
- Akses semua outlets
- Manage employees
- View all reports
- Manage outlets
- Manage products

### Admin (Role: 'admin')
- Login dari `users` atau `employees` table
- Akses assigned outlets (via `employee_outlet_assignment`)
- Manage products
- View transactions
- Manage employees (dalam outlet)
- Create shift records

### Cashier (Role: 'cashier')
- Login dari `employees` table
- Akses assigned outlets
- Create transactions (checkout)
- View stock
- View own shift records

---

## 🛠️ Configuration Files

### database.js
```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // ... connection options
});
```

### .env (Backend)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=madura_mart_db
JWT_SECRET=your_jwt_secret_minimum_32_chars
JWT_EXPIRY=24h
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### .env.local (Frontend)
```env
REACT_APP_API_URL=http://localhost:3001/api
```

---

## 📡 Main API Endpoints

### Authentication
- `POST /api/auth/login` - Login dengan email & password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify token

### Products
- `GET /api/products` - List produk
- `POST /api/products` - Create produk
- `PATCH /api/products/stock` - Update stok

### Transactions
- `POST /api/transactions` - Checkout (create transaction)
- `GET /api/transactions` - List transactions

### Reports
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/inventory` - Inventory report

---

## ⚙️ Database Performance Tips

### Indexes Created:
```sql
-- Transaction queries
CREATE INDEX idx_transaction_outlet_date ON transactions(outlet_id, transaction_date);

-- Stock queries
CREATE INDEX idx_stock_product_outlet ON product_stock(product_id, outlet_id);

-- Employee queries
CREATE INDEX idx_employee_outlet_role ON employees(outlet_id, role);

-- Audit queries
CREATE INDEX idx_audit_outlet_date ON audit_logs(outlet_id, created_at);
```

### Query Optimization:
- Gunakan `EXPLAIN` untuk analyze query
- Selalu join dengan produk yang tepat
- Use `LIMIT` untuk pagination
- Cache frequently accessed data

---

## 🔒 Security Considerations

### Password Security
```javascript
// Server-side (Backend)
const bcrypt = require('bcryptjs');

// Hash sebelum simpan
const hashedPassword = await bcrypt.hash(password, 10);

// Verify saat login
const isValid = await bcrypt.compare(password, hashedPassword);
```

### JWT Token
```javascript
// Generate token
const token = jwt.sign(
  { id, email, role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Verify token di middleware
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### Best Practices
- ✅ Hash passwords dengan bcrypt
- ✅ Use HTTPS di production
- ✅ Validate input di backend
- ✅ Use prepared statements (parameterized queries)
- ✅ Implement rate limiting
- ✅ Log sensitive operations di audit_logs
- ✅ Regular backup database
- ✅ Use environment variables untuk secrets

---

## 📋 Checklist Before Going Live

### Database:
- [ ] Database created dan schema sudah di-run
- [ ] Sample data sesuai dengan real data
- [ ] Backup strategy sudah di-setup
- [ ] Indexes sudah created
- [ ] Character set UTF8MB4 sudah set

### Backend:
- [ ] All API endpoints tested dengan Postman
- [ ] Error handling implemented
- [ ] JWT authentication working
- [ ] CORS configured correctly
- [ ] Environment variables di .env
- [ ] Logging implemented
- [ ] Rate limiting implemented
- [ ] Input validation di semua endpoints

### Frontend:
- [ ] API client (Axios) dikonfigurasi
- [ ] Token handled correctly
- [ ] Logout clears token
- [ ] Redirect to login saat token expired
- [ ] Error handling di UI
- [ ] Loading states implemented

### Testing:
- [ ] Login flow tested
- [ ] Checkout/transaction flow tested
- [ ] Product management tested
- [ ] Report generation tested
- [ ] Multi-outlet switching tested
- [ ] Permission/role-based access tested

---

## 🔗 Documentation References

1. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database structure & design
2. **[database_setup.sql](./database_setup.sql)** - SQL setup script
3. **[DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md)** - Step-by-step migration
4. **[BACKEND_API_GUIDE.md](./BACKEND_API_GUIDE.md)** - Backend implementation

---

## 🤝 Support & Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
→ Check if MySQL is running
→ Verify DB_HOST, DB_USER, DB_PASSWORD in .env
```

### JWT Token Error
```
Error: Invalid token
→ Clear localStorage dan login ulang
→ Check JWT_SECRET consistency between .env
```

### CORS Error
```
Error: CORS policy blocked
→ Add FRONTEND_URL ke CORS config di Express
→ Ensure frontend URL matches CORS origin
```

### Query Timeout
```
Error: Connection timeout
→ Increase connection timeout
→ Check query performance with EXPLAIN
→ Add indexes if needed
```

---

## 📚 Next Steps

1. **Setup Database** - Jalankan `database_setup.sql`
2. **Create Backend** - Follow `BACKEND_API_GUIDE.md`
3. **Migrate Data** - Follow `DATABASE_MIGRATION_GUIDE.md`
4. **Update Frontend** - Connect dengan API endpoints
5. **Test Everything** - Manual testing dengan Postman
6. **Deploy** - Setup production environment

---

## 📞 Useful Commands

### MySQL
```bash
# Connect to database
mysql -u root -p madura_mart_db

# Backup database
mysqldump -u root -p madura_mart_db > backup.sql

# Restore database
mysql -u root -p madura_mart_db < backup.sql
```

### Node.js
```bash
# Install dependencies
npm install

# Development mode (with auto-restart)
npm run dev

# Production mode
npm start

# Test API
curl http://localhost:3001/health
```

---

**Dokumentasi dibuat untuk Madura Mart POS System**
**Version:** 1.0.0
**Last Updated:** December 2024

Good luck dengan implementasi! 🚀
