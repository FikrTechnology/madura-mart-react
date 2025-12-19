# Supabase Migration Guide - Schema & Data Migration

Panduan migrate dari MySQL lokal ke Supabase (PostgreSQL).

---

## 🔄 Migration Overview

**Database System Change:**
- FROM: MySQL (relational)
- TO: PostgreSQL (relational) via Supabase

**Good news:** Struktur tabel hampir sama, hanya beberapa syntax adjustment.

---

## 📝 Step 1: PostgreSQL vs MySQL - Key Differences

| Feature | MySQL | PostgreSQL |
|---------|-------|------------|
| Auto increment | `AUTO_INCREMENT` | `SERIAL` atau `GENERATED ALWAYS AS IDENTITY` |
| Boolean | `TINYINT(1)` | `BOOLEAN` |
| Datetime default | `CURRENT_TIMESTAMP` | `NOW()` atau `CURRENT_TIMESTAMP` |
| JSON support | Parsial | Native JSON type |
| Text collation | Sensitif | Case-insensitive by default |
| Enum | Ada | Ada, berbeda syntax |
| Max length | Bervariasi | Lebih generous |

---

## 🛠️ Step 2: Convert MySQL Schema to PostgreSQL

### 2.1 Import Tool (Easiest Way)

**Option A: pgAdmin (GUI)**
1. Install pgAdmin: https://www.pgadmin.org/download/
2. Connect to Supabase:
   - Hostname: `xxxxx.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - Username: `postgres`
   - Password: (dari Supabase dashboard)
3. Right-click server → Query Tool
4. Copy-paste PostgreSQL schema

**Option B: DBeaver (Recommended)**
1. Setup connection ke Supabase (see SUPABASE_SETUP_GUIDE.md)
2. File → Import
3. Select SQL file
4. Done!

### 2.2 Manual Conversion

Convert MySQL syntax ke PostgreSQL:

**MySQL:**
```sql
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('owner', 'admin', 'cashier') DEFAULT 'cashier',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**PostgreSQL (Supabase):**
```sql
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'cashier', -- atau: role VARCHAR(20) CHECK (role IN ('owner', 'admin', 'cashier')),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jika mau pakai ENUM type (better):
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'cashier');
CREATE TYPE user_status AS ENUM ('active', 'inactive');

CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'cashier',
  status user_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📋 Step 3: Full PostgreSQL Schema (Ready to Copy-Paste)

```sql
-- Enable pgcrypto for UUID generation (optional)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'cashier');
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE payment_type AS ENUM ('cash', 'card', 'ewallet', 'qris');
CREATE TYPE transaction_status AS ENUM ('completed', 'pending', 'cancelled', 'refunded');

-- ===== CORE TABLES =====

CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role user_role DEFAULT 'cashier',
  status user_status DEFAULT 'active',
  phone VARCHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE outlets (
  id VARCHAR(50) PRIMARY KEY,
  owner_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(15),
  email VARCHAR(100),
  city VARCHAR(50),
  province VARCHAR(50),
  status user_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (owner_id, name)
);

CREATE TABLE employees (
  id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  password VARCHAR(255),
  phone VARCHAR(15),
  role user_role,
  status user_status DEFAULT 'active',
  salary DECIMAL(12, 2),
  hire_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employee_outlet_assignment (
  id VARCHAR(50) PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  outlet_id VARCHAR(50) NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (employee_id, outlet_id)
);

-- ===== PRODUCTS =====

CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  sku VARCHAR(50) UNIQUE,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  cost DECIMAL(12, 2),
  category VARCHAR(50),
  image_url TEXT,
  status user_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (outlet_id, sku)
);

CREATE TABLE product_stock (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  outlet_id VARCHAR(50) NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  quantity INT DEFAULT 0,
  reorder_level INT DEFAULT 10,
  last_stock_take TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (product_id, outlet_id)
);

CREATE TABLE stock_movements (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  outlet_id VARCHAR(50) NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  type VARCHAR(20), -- 'in', 'out', 'adjustment', 'return'
  quantity INT NOT NULL,
  reference_id VARCHAR(50), -- transaction_id or note
  reference_type VARCHAR(50), -- 'transaction', 'stock_adjustment', 'purchase'
  notes TEXT,
  created_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== PAYMENT & TRANSACTIONS =====

CREATE TABLE payment_methods (
  id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL, -- 'cash', 'card', 'ewallet', 'qris'
  type payment_type,
  is_active BOOLEAN DEFAULT TRUE,
  fee_percentage DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (outlet_id, name)
);

CREATE TABLE transactions (
  id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  cashier_id VARCHAR(50),
  transaction_number VARCHAR(50) NOT NULL,
  customer_name VARCHAR(100),
  subtotal DECIMAL(12, 2) DEFAULT 0,
  discount DECIMAL(12, 2) DEFAULT 0,
  tax DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50),
  status transaction_status DEFAULT 'completed',
  notes TEXT,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (outlet_id, transaction_number)
);

CREATE TABLE transaction_items (
  id VARCHAR(50) PRIMARY KEY,
  transaction_id VARCHAR(50) NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  discount DECIMAL(12, 2) DEFAULT 0,
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== OPTIONAL TABLES =====

CREATE TABLE shift_records (
  id VARCHAR(50) PRIMARY KEY,
  cashier_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  outlet_id VARCHAR(50) NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  opening_cash DECIMAL(12, 2) DEFAULT 0,
  closing_cash DECIMAL(12, 2),
  difference DECIMAL(12, 2),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
  id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(50) REFERENCES outlets(id) ON DELETE SET NULL,
  user_id VARCHAR(50),
  action VARCHAR(50), -- 'create', 'update', 'delete', 'login', 'logout'
  entity_type VARCHAR(50), -- 'product', 'transaction', 'user'
  entity_id VARCHAR(50),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== INDEXES =====

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_outlets_owner_id ON outlets(owner_id);
CREATE INDEX idx_outlets_status ON outlets(status);

CREATE INDEX idx_employees_outlet_id ON employees(outlet_id);
CREATE INDEX idx_employees_email ON employees(email);

CREATE INDEX idx_products_outlet_id ON products(outlet_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);

CREATE INDEX idx_stock_product_outlet ON product_stock(product_id, outlet_id);
CREATE INDEX idx_stock_quantity ON product_stock(quantity);

CREATE INDEX idx_transactions_outlet_id ON transactions(outlet_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_number ON transactions(transaction_number);

CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product_id ON transaction_items(product_id);

CREATE INDEX idx_shift_outlet_cashier ON shift_records(outlet_id, cashier_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ===== VIEWS =====

CREATE VIEW vw_sales_summary AS
SELECT 
  DATE(t.transaction_date) as sales_date,
  o.id as outlet_id,
  o.name as outlet_name,
  COUNT(t.id) as total_transactions,
  SUM(t.total_amount) as total_sales,
  AVG(t.total_amount) as avg_transaction
FROM transactions t
LEFT JOIN outlets o ON t.outlet_id = o.id
GROUP BY DATE(t.transaction_date), o.id, o.name
ORDER BY sales_date DESC;

CREATE VIEW vw_top_products AS
SELECT 
  p.id,
  p.name,
  p.sku,
  o.name as outlet_name,
  SUM(ti.quantity) as total_sold,
  SUM(ti.subtotal) as total_revenue,
  COUNT(DISTINCT ti.transaction_id) as transaction_count
FROM transaction_items ti
LEFT JOIN products p ON ti.product_id = p.id
LEFT JOIN outlets o ON p.outlet_id = o.id
GROUP BY p.id, p.name, p.sku, o.id, o.name
ORDER BY total_revenue DESC
LIMIT 50;

CREATE VIEW vw_low_stock AS
SELECT 
  ps.id,
  p.name as product_name,
  p.sku,
  o.name as outlet_name,
  ps.quantity,
  ps.reorder_level,
  (ps.reorder_level - ps.quantity) as shortage
FROM product_stock ps
LEFT JOIN products p ON ps.product_id = p.id
LEFT JOIN outlets o ON ps.outlet_id = o.id
WHERE ps.quantity < ps.reorder_level
ORDER BY shortage DESC;

CREATE VIEW vw_cashier_performance AS
SELECT 
  e.id,
  e.name as cashier_name,
  o.name as outlet_name,
  COUNT(t.id) as transaction_count,
  SUM(t.total_amount) as total_sales,
  AVG(t.total_amount) as avg_transaction,
  MAX(t.transaction_date) as last_transaction
FROM transactions t
LEFT JOIN employees e ON t.cashier_id = e.id
LEFT JOIN outlets o ON t.outlet_id = o.id
GROUP BY e.id, e.name, o.id, o.name
ORDER BY total_sales DESC;

-- ===== SAMPLE DATA =====

-- Insert users
INSERT INTO users (id, email, password, name, role, status) VALUES
('user-owner-001', 'owner@madura.com', '$2b$10$example_hash_owner', 'Pemilik Madura Mart', 'owner', 'active'),
('user-admin-001', 'admin@madura.com', '$2b$10$example_hash_admin', 'Admin Utama', 'admin', 'active'),
('user-cashier-001', 'cashier@madura.com', '$2b$10$example_hash_cashier', 'Kasir Utama', 'cashier', 'active');

-- Insert outlets
INSERT INTO outlets (id, owner_id, name, address, city, province, phone, status) VALUES
('outlet-001', 'user-owner-001', 'Madura Mart Surabaya', 'Jl. Diponegoro No.123', 'Surabaya', 'Jawa Timur', '031-1234567', 'active'),
('outlet-002', 'user-owner-001', 'Madura Mart Sidoarjo', 'Jl. Ahmad Yani No.456', 'Sidoarjo', 'Jawa Timur', '031-7654321', 'active');

-- Insert employees
INSERT INTO employees (id, outlet_id, name, email, role, status, hire_date) VALUES
('emp-cashier-001', 'outlet-001', 'Budi Santoso', 'budi@madura.com', 'cashier', 'active', CURRENT_DATE),
('emp-cashier-002', 'outlet-002', 'Siti Nurhaliza', 'siti@madura.com', 'cashier', 'active', CURRENT_DATE);

-- Insert payment methods
INSERT INTO payment_methods (id, outlet_id, name, type, is_active, fee_percentage) VALUES
('pm-001', 'outlet-001', 'Cash', 'cash', TRUE, 0),
('pm-002', 'outlet-001', 'Debit Card', 'card', TRUE, 2.5),
('pm-003', 'outlet-002', 'Cash', 'cash', TRUE, 0);
```

---

## 🔄 Step 4: Data Migration

### 4.1 Export MySQL Data

**Option A: Via MySQL Command Line**

```bash
# Export dari MySQL ke SQL file
mysqldump -u root -p madura_mart_db users > users_export.sql
mysqldump -u root -p madura_mart_db employees >> employees_export.sql
```

**Option B: Via GUI Tools**

DBeaver atau MySQL Workbench:
1. Right-click table → Export Data
2. Format: SQL INSERT
3. Save to file

### 4.2 Convert Data

Beberapa adjustment data:

```sql
-- MySQL (export dari sini)
SELECT * FROM users WHERE status = 'active';

-- PostgreSQL (import ke sini)
-- Ganti AUTO_INCREMENT ID jadi UUID atau string ID
-- Ganti boolean values jika ada (0→false, 1→true)
-- Update datetime format jika perlu
```

**Python Script untuk Convert:**

```python
import csv
import json

# Read MySQL export
with open('users_export.csv', 'r') as f:
    reader = csv.DictReader(f)
    users = list(reader)

# Convert format
for user in users:
    # Convert values
    user['role'] = user['role'].lower()  # ensure lowercase
    user['status'] = user['status'].lower()
    user['created_at'] = user['created_at'].replace(' ', 'T') + 'Z'  # ISO format
    
    # Remove NULL values
    user = {k: v for k, v in user.items() if v}

# Write to JSON
with open('users_converted.json', 'w') as f:
    json.dump(users, f, indent=2)

print(f"Converted {len(users)} records")
```

### 4.3 Import Data ke Supabase

**Option A: Via SQL Copy**

```sql
-- Connect ke Supabase
psql -h xxxxx.supabase.co -U postgres -d postgres < data_import.sql
```

**Option B: Via Node.js Script**

```javascript
// import-data.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role untuk full access
);

async function importData() {
  try {
    // Import users
    const users = JSON.parse(fs.readFileSync('users_converted.json'));
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(users);
    
    if (userError) throw userError;
    console.log(`✓ Imported ${userData.length} users`);

    // Import outlets
    const outlets = JSON.parse(fs.readFileSync('outlets_converted.json'));
    const { data: outletData, error: outletError } = await supabase
      .from('outlets')
      .insert(outlets);
    
    if (outletError) throw outletError;
    console.log(`✓ Imported ${outletData.length} outlets`);

    // ... repeat untuk table lain

  } catch (error) {
    console.error('Import error:', error);
  }
}

importData();
```

**Option C: Supabase Dashboard UI**

1. Buka project Supabase
2. Klik "Table Editor"
3. Klik table yang ingin di-import
4. Klik "Add row" atau upload CSV
5. Done!

---

## ✅ Step 5: Verification

Setelah migration selesai, verify data:

```sql
-- Check record counts
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'outlets', COUNT(*) FROM outlets
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions;

-- Check relationships
SELECT COUNT(*) FROM outlets WHERE owner_id NOT IN (SELECT id FROM users);

-- Check indexes
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';

-- Test views
SELECT * FROM vw_sales_summary LIMIT 5;
```

---

## 🔐 Step 6: Enable Row Level Security (RLS)

```sql
-- Enable RLS pada critical tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Users dapat lihat diri sendiri
CREATE POLICY "Users can view their own data"
ON users FOR SELECT
USING (auth.uid()::text = id);

-- Policy: Admin dapat lihat data outlet mereka
CREATE POLICY "Admins can view outlet transactions"
ON transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM employees
    WHERE employees.id = auth.uid()::text
    AND employees.outlet_id = transactions.outlet_id
  )
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()::text
    AND users.role = 'owner'
  )
);
```

---

## 🚀 Step 7: Complete Migration Checklist

Before moving to production:

- [ ] PostgreSQL schema created di Supabase
- [ ] All tables created dan indexed
- [ ] Data migrated dari MySQL
- [ ] Record counts verified (compare MySQL vs PostgreSQL)
- [ ] Foreign keys working
- [ ] Views tested
- [ ] RLS policies created
- [ ] Backup tested (export/restore works)
- [ ] Connection tested dari backend
- [ ] Connection tested dari frontend
- [ ] Performance tested (query time acceptable)

---

## 🔄 Rollback Plan

Jika ada masalah:

```bash
# 1. Backup current Supabase data
pg_dump postgresql://postgres:...@xxxxx.supabase.co/postgres > backup.sql

# 2. Drop all tables
psql -h xxxxx.supabase.co -U postgres -d postgres -c "
DROP TABLE IF EXISTS transaction_items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS product_stock CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS shift_records CASCADE;
DROP TABLE IF EXISTS employee_outlet_assignment CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS outlets CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS payment_type CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;
"

# 3. Re-run schema creation
psql -h xxxxx.supabase.co -U postgres -d postgres < schema.sql

# 4. Restore data
psql -h xxxxx.supabase.co -U postgres -d postgres < data.sql
```

---

## 📊 Migration Timeline

**Estimated Duration:**
- Schema creation: 10-15 min
- Data export: 5-10 min
- Data import: 10-15 min
- Verification: 10-15 min
- **Total: 35-55 minutes**

**Best Practice:**
- Migrate saat traffic rendah (off-peak hours)
- Jangan migrate di tengah transaction
- Backup MySQL sebelum migration
- Test di staging environment dulu

---

## 🎯 Next Steps

1. ✅ Review schema differences (MySQL → PostgreSQL)
2. ✅ Export data dari MySQL
3. ✅ Import schema ke Supabase
4. ✅ Import data ke Supabase
5. ✅ Verify data integrity
6. ➡️ **Update backend code** (see [SUPABASE_BACKEND_GUIDE.md](SUPABASE_BACKEND_GUIDE.md))
7. ➡️ **Update frontend** (see [SUPABASE_FRONTEND_INTEGRATION.md](SUPABASE_FRONTEND_INTEGRATION.md))

---

**Ready untuk migration? Mari mulai! 🚀**
