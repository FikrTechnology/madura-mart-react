# Database Schema - Madura Mart POS System

Database ini dirancang untuk mendukung sistem POS dengan fitur multi-outlet, manajemen karyawan, dan manajemen inventory.

---

## 📋 Daftar Tabel

1. **users** - Data user (owner, admin, cashier)
2. **outlets** - Data outlet/toko
3. **employees** - Data karyawan
4. **products** - Data produk
5. **product_stock** - Tracking stok produk per outlet
6. **transactions** - Riwayat transaksi penjualan
7. **transaction_items** - Detail item dalam transaksi
8. **payment_methods** - Metode pembayaran
9. **audit_logs** - Log aktivitas sistem

---

## 🗄️ Struktur Tabel

### 1. **users** - Master User Account
Menyimpan akun user untuk login (owner, admin default, cashier default)

```sql
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('owner', 'admin', 'cashier') NOT NULL,
  avatar_url VARCHAR(255) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Demo Data:
INSERT INTO users VALUES
('user_001', 'fikri@madura.com', 'hashed_password_fikri123', 'Fikri (Owner)', 'owner', NULL, TRUE, NOW(), NOW()),
('user_002', 'admin@outlet1.com', 'hashed_password_admin123', 'Admin Outlet 1', 'admin', NULL, TRUE, NOW(), NOW()),
('user_003', 'admin@outlet2.com', 'hashed_password_admin123', 'Admin Outlet 2', 'admin', NULL, TRUE, NOW(), NOW()),
('user_004', 'cashier@outlet1.com', 'hashed_password_cashier123', 'Cashier Outlet 1', 'cashier', NULL, TRUE, NOW(), NOW());
```

---

### 2. **outlets** - Data Outlet/Toko
Menyimpan informasi setiap outlet/cabang toko

```sql
CREATE TABLE outlets (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  owner_id VARCHAR(50) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  manager_name VARCHAR(100) NULL,
  manager_phone VARCHAR(20) NULL,
  city VARCHAR(100) NULL,
  province VARCHAR(100) NULL,
  postal_code VARCHAR(10) NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_owner_id (owner_id),
  INDEX idx_status (status)
);

-- Demo Data:
INSERT INTO outlets VALUES
('outlet_001', 'Toko Madura - Sidoarjo', 'user_001', 'Jl. Madura No. 123, Sidoarjo', '0812-3456-7890', 'Budi', '0812-3456-7890', 'Sidoarjo', 'Jawa Timur', '61200', 'active', NOW(), NOW()),
('outlet_002', 'Toko Madura - Surabaya', 'user_001', 'Jl. Surabaya No. 456, Surabaya', '0813-9876-5432', 'Ahmad', '0813-9876-5432', 'Surabaya', 'Jawa Timur', '60100', 'active', NOW(), NOW()),
('outlet_003', 'Toko Madura - Malang', 'user_001', 'Jl. Malang No. 789, Malang', '0814-1111-2222', 'Siti', '0814-1111-2222', 'Malang', 'Jawa Timur', '65100', 'active', NOW(), NOW());
```

---

### 3. **employees** - Data Karyawan
Menyimpan data karyawan (admin dan cashier yang dinamis/dibuat owner)

```sql
CREATE TABLE employees (
  id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'cashier') NOT NULL,
  phone VARCHAR(20) NULL,
  address VARCHAR(255) NULL,
  id_card_number VARCHAR(20) NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  hire_date DATE NOT NULL,
  salary_type ENUM('fixed', 'hourly', 'commission') DEFAULT 'fixed',
  salary_amount DECIMAL(12, 2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
);

-- Karyawan bisa assign ke multiple outlets dengan junction table
CREATE TABLE employee_outlet_assignment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL,
  outlet_id VARCHAR(50) NOT NULL,
  assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  UNIQUE KEY unique_employee_outlet (employee_id, outlet_id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_outlet_id (outlet_id)
);
```

---

### 4. **products** - Data Produk Master
Menyimpan master data produk (bisa digunakan di semua outlet atau spesifik outlet)

```sql
CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT NULL,
  sku VARCHAR(50) UNIQUE NULL,
  price DECIMAL(12, 2) NOT NULL,
  cost_price DECIMAL(12, 2) NULL,
  image_url VARCHAR(500) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_category (category),
  INDEX idx_name (name),
  INDEX idx_sku (sku),
  INDEX idx_is_active (is_active)
);
```

---

### 5. **product_stock** - Tracking Stok Per Outlet
Menyimpan jumlah stok produk per outlet

```sql
CREATE TABLE product_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  outlet_id VARCHAR(50) NOT NULL,
  quantity_in_stock INT DEFAULT 0,
  reorder_level INT DEFAULT 5,
  reorder_quantity INT DEFAULT 10,
  last_restock_date TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  UNIQUE KEY unique_product_outlet (product_id, outlet_id),
  INDEX idx_product_id (product_id),
  INDEX idx_outlet_id (outlet_id)
);
```

---

### 6. **stock_movements** - Riwayat Pergerakan Stok
Menyimpan log setiap perubahan stok (untuk audit trail)

```sql
CREATE TABLE stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  outlet_id VARCHAR(50) NOT NULL,
  movement_type ENUM('in', 'out', 'adjustment', 'damage') NOT NULL,
  quantity INT NOT NULL,
  reference_type VARCHAR(50) NULL, -- 'transaction', 'restock', 'manual_adjustment'
  reference_id VARCHAR(50) NULL,
  notes TEXT NULL,
  created_by VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_product_id (product_id),
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_created_at (created_at)
);
```

---

### 7. **transactions** - Riwayat Transaksi Penjualan
Menyimpan header/ringkasan transaksi penjualan

```sql
CREATE TABLE transactions (
  id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL,
  cashier_id VARCHAR(50) NULL,
  transaction_date DATETIME NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  amount_paid DECIMAL(12, 2) NOT NULL DEFAULT 0,
  change_amount DECIMAL(12, 2) DEFAULT 0,
  notes TEXT NULL,
  status ENUM('completed', 'cancelled', 'pending') DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  FOREIGN KEY (cashier_id) REFERENCES employees(id) ON DELETE SET NULL,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_cashier_id (cashier_id),
  INDEX idx_transaction_date (transaction_date),
  INDEX idx_status (status)
);
```

---

### 8. **transaction_items** - Detail Item Transaksi
Menyimpan detail setiap item yang dibeli dalam transaksi

```sql
CREATE TABLE transaction_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id VARCHAR(50) NOT NULL,
  product_id VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_product_id (product_id)
);
```

---

### 9. **payment_methods** - Metode Pembayaran
Menyimpan tipe metode pembayaran yang tersedia

```sql
CREATE TABLE payment_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('cash', 'card', 'digital_wallet', 'bank_transfer', 'check') NOT NULL,
  description TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_code (code)
);

-- Demo Data:
INSERT INTO payment_methods VALUES
(NULL, 'outlet_001', 'Tunai', 'cash', 'cash', 'Pembayaran Tunai', TRUE, 1, NOW(), NOW()),
(NULL, 'outlet_001', 'Debit Card', 'debit', 'card', 'Kartu Debit (ATM)', TRUE, 2, NOW(), NOW()),
(NULL, 'outlet_001', 'Kredit Card', 'credit', 'card', 'Kartu Kredit', TRUE, 3, NOW(), NOW()),
(NULL, 'outlet_001', 'E-Wallet', 'ewallet', 'digital_wallet', 'E-Wallet (OVO, GoPay, etc)', TRUE, 4, NOW(), NOW()),
(NULL, 'outlet_001', 'Transfer Bank', 'transfer', 'bank_transfer', 'Transfer Bank', TRUE, 5, NOW(), NOW());
```

---

### 10. **audit_logs** - Log Aktivitas Sistem
Menyimpan log semua aktivitas penting untuk audit trail

```sql
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL, -- 'login', 'create_product', 'update_stock', 'create_transaction', etc
  entity_type VARCHAR(50) NULL, -- 'product', 'employee', 'transaction', 'outlet'
  entity_id VARCHAR(50) NULL,
  old_values JSON NULL,
  new_values JSON NULL,
  description TEXT NULL,
  ip_address VARCHAR(50) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);
```

---

### 11. **shift_records** (Optional) - Catatan Shift Kasir
Untuk tracking shift kasir dan rekonsiliasi kas

```sql
CREATE TABLE shift_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL,
  cashier_id VARCHAR(50) NOT NULL,
  shift_start DATETIME NOT NULL,
  shift_end DATETIME NULL,
  opening_cash DECIMAL(12, 2) NOT NULL,
  closing_cash DECIMAL(12, 2) NULL,
  expected_cash DECIMAL(12, 2) NULL,
  difference DECIMAL(12, 2) NULL,
  notes TEXT NULL,
  status ENUM('open', 'closed', 'reconciled') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  FOREIGN KEY (cashier_id) REFERENCES employees(id) ON DELETE RESTRICT,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_cashier_id (cashier_id),
  INDEX idx_shift_start (shift_start)
);
```

---

### 12. **reports_cache** (Optional) - Cache Report
Untuk menyimpan report yang sudah digenerate (untuk performa)

```sql
CREATE TABLE reports_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL,
  report_type VARCHAR(50) NOT NULL, -- 'daily_sales', 'inventory', 'employee_performance'
  report_date DATE NOT NULL,
  report_data JSON NOT NULL,
  generated_by VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_report (outlet_id, report_type, report_date),
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_report_type (report_type),
  INDEX idx_expires_at (expires_at)
);
```

---

## 🔗 Relasi Antar Tabel

```
users (owner)
  ↓
outlets
  ↓
  ├─→ products
  │    ├─→ product_stock
  │    ├─→ stock_movements
  │    └─→ transaction_items
  │
  ├─→ employees
  │    ├─→ employee_outlet_assignment
  │    ├─→ shift_records
  │    └─→ audit_logs (created_by)
  │
  ├─→ transactions
  │    └─→ transaction_items
  │
  ├─→ payment_methods
  │
  └─→ audit_logs
```

---

## 📊 Diagram ER (Entity Relationship)

```
┌─────────────┐
│   users     │
├─────────────┤
│ id (PK)     │
│ email       │
│ password    │
│ name        │
│ role        │
└─────┬───────┘
      │ 1:N
      │
┌─────▼───────────┐
│   outlets       │
├─────────────────┤
│ id (PK)         │
│ owner_id (FK)   │
│ name            │
│ address         │
│ phone           │
│ status          │
└──┬──┬───┬───┬───┘
   │  │   │   │
   │  │   │   └─→ ┌──────────────────┐
   │  │   │       │ payment_methods  │
   │  │   │       └──────────────────┘
   │  │   │
   │  │   └─→ ┌──────────────────┐
   │  │       │  employees       │
   │  │       └──────────────────┘
   │  │           │
   │  │           └─→ ┌──────────────────────┐
   │  │               │ employee_outlet_     │
   │  │               │ assignment          │
   │  │               └──────────────────────┘
   │  │
   │  └─→ ┌──────────────────┐
   │      │   products       │
   │      └──────────────────┘
   │           │
   │           ├─→ ┌──────────────────┐
   │           │   │ product_stock    │
   │           │   └──────────────────┘
   │           │
   │           ├─→ ┌──────────────────┐
   │           │   │ stock_movements  │
   │           │   └──────────────────┘
   │           │
   │           └─→ ┌────────────────────┐
   │               │ transaction_items  │
   │               └────────────────────┘
   │                      ↑
   │                      │
   └─→ ┌──────────────────────────┐
       │   transactions           │
       └──────────────────────────┘
```

---

## 🔐 Indeks Penting untuk Performa

```sql
-- Untuk query transaksi per outlet per tanggal (Report)
CREATE INDEX idx_transaction_outlet_date ON transactions(outlet_id, transaction_date);

-- Untuk query stok produk
CREATE INDEX idx_stock_product_outlet ON product_stock(product_id, outlet_id);

-- Untuk query employee per outlet
CREATE INDEX idx_employee_outlet ON employees(outlet_id, role);

-- Untuk query audit log
CREATE INDEX idx_audit_outlet_date ON audit_logs(outlet_id, created_at);
```

---

## 💾 Migrasi dari localStorage ke Database

Sebelum aplikasi menghubung ke database, jalankan script berikut untuk:
1. Backup data localStorage ke file JSON
2. Import ke database

```javascript
// Contoh struktur data yang akan di-backup:
{
  "users": [...],
  "outlets": [...],
  "employees": [...],
  "products": [...],
  "transactions": [...],
  "payment_methods": [...]
}
```

---

## 🛠️ Query Umum

### 1. Total Sales per Outlet per Hari
```sql
SELECT 
  o.name as outlet_name,
  DATE(t.transaction_date) as sale_date,
  COUNT(t.id) as total_transactions,
  SUM(t.total_amount) as total_sales,
  COUNT(DISTINCT t.cashier_id) as cashiers
FROM transactions t
JOIN outlets o ON t.outlet_id = o.id
WHERE t.status = 'completed'
GROUP BY t.outlet_id, DATE(t.transaction_date)
ORDER BY DATE(t.transaction_date) DESC;
```

### 2. Top 10 Produk Terlaris
```sql
SELECT 
  p.name,
  c.category,
  SUM(ti.quantity) as total_qty,
  SUM(ti.total_price) as total_revenue,
  COUNT(DISTINCT t.id) as transaction_count
FROM transaction_items ti
JOIN products p ON ti.product_id = p.id
JOIN transactions t ON ti.transaction_id = t.id
WHERE t.status = 'completed' 
  AND DATE(t.transaction_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY ti.product_id
ORDER BY total_qty DESC
LIMIT 10;
```

### 3. Stok Produk yang Menipis (Low Stock)
```sql
SELECT 
  p.name,
  ps.quantity_in_stock,
  ps.reorder_level,
  o.name as outlet_name
FROM product_stock ps
JOIN products p ON ps.product_id = p.id
JOIN outlets o ON ps.outlet_id = o.id
WHERE ps.quantity_in_stock <= ps.reorder_level
ORDER BY ps.quantity_in_stock ASC;
```

### 4. Performa Kasir (Transactions by Cashier)
```sql
SELECT 
  CONCAT(e.name, ' (', e.id, ')') as cashier,
  COUNT(t.id) as total_transactions,
  SUM(t.total_amount) as total_sales,
  AVG(t.total_amount) as avg_transaction,
  DATE(t.transaction_date) as date
FROM transactions t
LEFT JOIN employees e ON t.cashier_id = e.id
WHERE t.status = 'completed'
  AND DATE(t.transaction_date) = CURDATE()
GROUP BY t.cashier_id, DATE(t.transaction_date)
ORDER BY total_sales DESC;
```

### 5. Audit Trail - Aktivitas User
```sql
SELECT 
  al.action,
  CONCAT(u.name, ' (', u.role, ')') as user,
  al.entity_type,
  al.description,
  al.created_at
FROM audit_logs al
JOIN users u ON al.user_id = u.id
WHERE al.outlet_id = 'outlet_001'
ORDER BY al.created_at DESC
LIMIT 100;
```

---

## 📝 Catatan Implementasi

### Login Flow dengan Multiple Roles:
1. **Owner** → Login dengan `users` table → Akses semua outlets
2. **Admin** → Login dengan `users` atau `employees` table → Akses spesifik outlet(s) (via `employee_outlet_assignment`)
3. **Cashier** → Login dengan `employees` table → Akses spesifik outlet(s)

### Password Security:
- Gunakan hashing (bcrypt, argon2) sebelum menyimpan ke database
- Jangan pernah simpan password plain text

### Transaction Management:
- Setiap transaksi harus atomik (all or nothing)
- Gunakan database transactions untuk memastikan konsistensi data

### Stock Movement:
- Setiap perubahan stok harus di-log di `stock_movements`
- Audit trail penting untuk tracking inventory accuracy

---

Dokumentasi ini siap untuk di-gunakan dalam membuat database di MySQL, PostgreSQL, atau SQL Server. Mari saya buatkan juga file SQL untuk implementasi yang mudah!
