-- ============================================================================
-- MADURA MART POS SYSTEM - DATABASE SCHEMA (PostgreSQL for Supabase)
-- Database initialization script untuk Supabase (PostgreSQL)
-- ============================================================================

-- Set encoding
SET client_encoding = 'UTF8';

-- ============================================================================
-- CREATE ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('owner', 'admin', 'cashier');
CREATE TYPE employee_role AS ENUM ('admin', 'cashier');
CREATE TYPE status_type AS ENUM ('active', 'inactive');
CREATE TYPE payment_type AS ENUM ('cash', 'card', 'digital_wallet', 'bank_transfer', 'check', 'qris');
CREATE TYPE salary_type AS ENUM ('fixed', 'hourly', 'commission');
CREATE TYPE stock_movement_type AS ENUM ('in', 'out', 'adjustment', 'damage');
CREATE TYPE transaction_status_type AS ENUM ('completed', 'cancelled', 'pending');
CREATE TYPE shift_status_type AS ENUM ('open', 'closed', 'reconciled');

-- ============================================================================
-- 1. USERS TABLE - Master User Account
-- ============================================================================
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role user_role NOT NULL,
  avatar_url VARCHAR(255) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================================================
-- 2. OUTLETS TABLE - Data Outlet/Toko
-- ============================================================================
DROP TABLE IF EXISTS outlets CASCADE;
CREATE TABLE outlets (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  owner_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  manager_name VARCHAR(100) NULL,
  manager_phone VARCHAR(20) NULL,
  city VARCHAR(100) NULL,
  province VARCHAR(100) NULL,
  postal_code VARCHAR(10) NULL,
  status status_type DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_outlets_owner_id ON outlets(owner_id);
CREATE INDEX idx_outlets_status ON outlets(status);
CREATE INDEX idx_outlets_name ON outlets(name);

-- ============================================================================
-- 3. EMPLOYEES TABLE - Data Karyawan (Admin & Cashier)
-- ============================================================================
DROP TABLE IF EXISTS employees CASCADE;
CREATE TABLE employees (
  id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role employee_role NOT NULL,
  phone VARCHAR(20) NULL,
  address VARCHAR(255) NULL,
  id_card_number VARCHAR(20) NULL,
  status status_type DEFAULT 'active',
  hire_date DATE NOT NULL,
  salary_type salary_type DEFAULT 'fixed',
  salary_amount DECIMAL(12, 2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employees_outlet_id ON employees(outlet_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_status ON employees(status);

-- ============================================================================
-- 4. EMPLOYEE_OUTLET_ASSIGNMENT TABLE - Karyawan ke Multiple Outlets
-- ============================================================================
DROP TABLE IF EXISTS employee_outlet_assignment CASCADE;
CREATE TABLE employee_outlet_assignment (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  outlet_id VARCHAR(50) NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, outlet_id)
);

CREATE INDEX idx_eoa_employee_id ON employee_outlet_assignment(employee_id);
CREATE INDEX idx_eoa_outlet_id ON employee_outlet_assignment(outlet_id);

-- ============================================================================
-- 5. PRODUCTS TABLE - Master Data Produk
-- ============================================================================
DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT NULL,
  sku VARCHAR(50) UNIQUE NULL,
  price DECIMAL(12, 2) NOT NULL,
  cost_price DECIMAL(12, 2) NULL,
  image_url VARCHAR(500) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_outlet_id ON products(outlet_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_is_active ON products(is_active);

-- ============================================================================
-- 6. PRODUCT_STOCK TABLE - Tracking Stok Per Outlet
-- ============================================================================
DROP TABLE IF EXISTS product_stock CASCADE;
CREATE TABLE product_stock (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  outlet_id VARCHAR(50) NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  quantity_in_stock INT DEFAULT 0,
  reorder_level INT DEFAULT 5,
  reorder_quantity INT DEFAULT 10,
  last_restock_date TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, outlet_id)
);

CREATE INDEX idx_ps_product_id ON product_stock(product_id);
CREATE INDEX idx_ps_outlet_id ON product_stock(outlet_id);
CREATE INDEX idx_ps_quantity ON product_stock(quantity_in_stock);

-- ============================================================================
-- 7. STOCK_MOVEMENTS TABLE - Riwayat Pergerakan Stok (Audit Trail)
-- ============================================================================
DROP TABLE IF EXISTS stock_movements CASCADE;
CREATE TABLE stock_movements (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  outlet_id VARCHAR(50) NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  movement_type stock_movement_type NOT NULL,
  quantity INT NOT NULL,
  reference_type VARCHAR(50) NULL,
  reference_id VARCHAR(50) NULL,
  notes TEXT NULL,
  created_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sm_product_id ON stock_movements(product_id);
CREATE INDEX idx_sm_outlet_id ON stock_movements(outlet_id);
CREATE INDEX idx_sm_created_at ON stock_movements(created_at);
CREATE INDEX idx_sm_movement_type ON stock_movements(movement_type);

-- ============================================================================
-- 8. PAYMENT_METHODS TABLE - Metode Pembayaran
-- ============================================================================
DROP TABLE IF EXISTS payment_methods CASCADE;
CREATE TABLE payment_methods (
  id SERIAL PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  type payment_type NOT NULL,
  description TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(outlet_id, code)
);

CREATE INDEX idx_pm_outlet_id ON payment_methods(outlet_id);
CREATE INDEX idx_pm_code ON payment_methods(code);
CREATE INDEX idx_pm_type ON payment_methods(type);

-- ============================================================================
-- 9. TRANSACTIONS TABLE - Riwayat Transaksi Penjualan
-- ============================================================================
DROP TABLE IF EXISTS transactions CASCADE;
CREATE TABLE transactions (
  id VARCHAR(50) PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  cashier_id VARCHAR(50) REFERENCES employees(id) ON DELETE SET NULL,
  transaction_date TIMESTAMP NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  amount_paid DECIMAL(12, 2) DEFAULT 0,
  change_amount DECIMAL(12, 2) DEFAULT 0,
  notes TEXT NULL,
  status transaction_status_type DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trans_outlet_id ON transactions(outlet_id);
CREATE INDEX idx_trans_cashier_id ON transactions(cashier_id);
CREATE INDEX idx_trans_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_trans_status ON transactions(status);
CREATE INDEX idx_trans_outlet_date ON transactions(outlet_id, transaction_date);

-- ============================================================================
-- 10. TRANSACTION_ITEMS TABLE - Detail Item Transaksi
-- ============================================================================
DROP TABLE IF EXISTS transaction_items CASCADE;
CREATE TABLE transaction_items (
  id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(50) NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ti_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_ti_product_id ON transaction_items(product_id);

-- ============================================================================
-- 11. SHIFT_RECORDS TABLE - Catatan Shift Kasir (Optional)
-- ============================================================================
DROP TABLE IF EXISTS shift_records CASCADE;
CREATE TABLE shift_records (
  id SERIAL PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  cashier_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  shift_start TIMESTAMP NOT NULL,
  shift_end TIMESTAMP NULL,
  opening_cash DECIMAL(12, 2) NOT NULL,
  closing_cash DECIMAL(12, 2) NULL,
  expected_cash DECIMAL(12, 2) NULL,
  difference DECIMAL(12, 2) NULL,
  notes TEXT NULL,
  status shift_status_type DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sr_outlet_id ON shift_records(outlet_id);
CREATE INDEX idx_sr_cashier_id ON shift_records(cashier_id);
CREATE INDEX idx_sr_shift_start ON shift_records(shift_start);
CREATE INDEX idx_sr_status ON shift_records(status);

-- ============================================================================
-- 12. AUDIT_LOGS TABLE - Log Aktivitas Sistem
-- ============================================================================
DROP TABLE IF EXISTS audit_logs CASCADE;
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NULL,
  entity_id VARCHAR(50) NULL,
  old_values JSONB NULL,
  new_values JSONB NULL,
  description TEXT NULL,
  ip_address VARCHAR(50) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_al_outlet_id ON audit_logs(outlet_id);
CREATE INDEX idx_al_user_id ON audit_logs(user_id);
CREATE INDEX idx_al_action ON audit_logs(action);
CREATE INDEX idx_al_created_at ON audit_logs(created_at);
CREATE INDEX idx_al_outlet_date ON audit_logs(outlet_id, created_at);

-- ============================================================================
-- 13. REPORTS_CACHE TABLE - Cache Report (Optional)
-- ============================================================================
DROP TABLE IF EXISTS reports_cache CASCADE;
CREATE TABLE reports_cache (
  id SERIAL PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL,
  report_date DATE NOT NULL,
  report_data TEXT NOT NULL,
  generated_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  UNIQUE(outlet_id, report_type, report_date)
);

CREATE INDEX idx_rc_outlet_id ON reports_cache(outlet_id);
CREATE INDEX idx_rc_report_type ON reports_cache(report_type);
CREATE INDEX idx_rc_expires_at ON reports_cache(expires_at);

-- ============================================================================
-- SAMPLE DATA - Demo Data untuk Testing
-- ============================================================================

-- Insert Users
INSERT INTO users (id, email, password, name, role, is_active, created_at, updated_at) VALUES
('user_001', 'fikri@madura.com', '$2a$10$YOUR_HASHED_PASSWORD_HERE', 'Fikri (Owner)', 'owner', true, NOW(), NOW()),
('user_002', 'admin@outlet1.com', '$2a$10$YOUR_HASHED_PASSWORD_HERE', 'Admin Outlet 1', 'admin', true, NOW(), NOW()),
('user_003', 'admin@outlet2.com', '$2a$10$YOUR_HASHED_PASSWORD_HERE', 'Admin Outlet 2', 'admin', true, NOW(), NOW()),
('user_004', 'cashier@outlet1.com', '$2a$10$YOUR_HASHED_PASSWORD_HERE', 'Cashier Outlet 1', 'cashier', true, NOW(), NOW());

-- Insert Outlets
INSERT INTO outlets (id, name, owner_id, address, phone, manager_name, city, province, postal_code, status, created_at, updated_at) VALUES
('outlet_001', 'Toko Madura - Sidoarjo', 'user_001', 'Jl. Madura No. 123, Sidoarjo', '0812-3456-7890', 'Budi', 'Sidoarjo', 'Jawa Timur', '61200', 'active', NOW(), NOW()),
('outlet_002', 'Toko Madura - Surabaya', 'user_001', 'Jl. Surabaya No. 456, Surabaya', '0813-9876-5432', 'Ahmad', 'Surabaya', 'Jawa Timur', '60100', 'active', NOW(), NOW()),
('outlet_003', 'Toko Madura - Malang', 'user_001', 'Jl. Malang No. 789, Malang', '0814-1111-2222', 'Siti', 'Malang', 'Jawa Timur', '65100', 'active', NOW(), NOW());

-- Insert Employees
INSERT INTO employees (id, outlet_id, name, email, password, role, phone, address, status, hire_date, salary_type, salary_amount, created_at, updated_at) VALUES
('emp_001', 'outlet_001', 'Budi Admin', 'budi.admin@outlet1.com', '$2a$10$YOUR_HASHED_PASSWORD_HERE', 'admin', '0812-3333-4444', 'Sidoarjo', 'active', CURRENT_DATE - INTERVAL '6 months', 'fixed', 3000000, NOW(), NOW()),
('emp_002', 'outlet_001', 'Toni Kasir', 'toni@outlet1.com', '$2a$10$YOUR_HASHED_PASSWORD_HERE', 'cashier', '0812-5555-6666', 'Sidoarjo', 'active', CURRENT_DATE - INTERVAL '3 months', 'fixed', 2000000, NOW(), NOW()),
('emp_003', 'outlet_002', 'Ahmad Admin', 'ahmad.admin@outlet2.com', '$2a$10$YOUR_HASHED_PASSWORD_HERE', 'admin', '0813-3333-4444', 'Surabaya', 'active', CURRENT_DATE - INTERVAL '6 months', 'fixed', 3000000, NOW(), NOW());

-- Insert Payment Methods
INSERT INTO payment_methods (outlet_id, name, code, type, description, is_active, display_order, created_at, updated_at) VALUES
('outlet_001', 'Tunai', 'cash', 'cash', 'Pembayaran Tunai', true, 1, NOW(), NOW()),
('outlet_001', 'Debit Card', 'debit', 'card', 'Kartu Debit (ATM)', true, 2, NOW(), NOW()),
('outlet_001', 'Kredit Card', 'credit', 'card', 'Kartu Kredit', true, 3, NOW(), NOW()),
('outlet_001', 'E-Wallet', 'ewallet', 'digital_wallet', 'E-Wallet (OVO, GoPay, etc)', true, 4, NOW(), NOW()),
('outlet_001', 'QRIS', 'qris', 'qris', 'QRIS Payment', true, 5, NOW(), NOW()),
('outlet_002', 'Tunai', 'cash', 'cash', 'Pembayaran Tunai', true, 1, NOW(), NOW()),
('outlet_002', 'Debit Card', 'debit', 'card', 'Kartu Debit (ATM)', true, 2, NOW(), NOW()),
('outlet_002', 'E-Wallet', 'ewallet', 'digital_wallet', 'E-Wallet (OVO, GoPay, etc)', true, 3, NOW(), NOW());

-- ============================================================================
-- VIEWS - Untuk memudahkan query reporting
-- ============================================================================

-- View: Sales Summary by Outlet and Date
DROP VIEW IF EXISTS vw_sales_summary CASCADE;
CREATE VIEW vw_sales_summary AS
SELECT 
  o.id as outlet_id,
  o.name as outlet_name,
  DATE(t.transaction_date) as sale_date,
  COUNT(t.id) as total_transactions,
  SUM(t.total_amount) as total_sales,
  AVG(t.total_amount) as avg_transaction,
  COUNT(DISTINCT t.cashier_id) as cashiers
FROM transactions t
JOIN outlets o ON t.outlet_id = o.id
WHERE t.status = 'completed'
GROUP BY t.outlet_id, o.id, o.name, DATE(t.transaction_date);

-- View: Top Selling Products
DROP VIEW IF EXISTS vw_top_products CASCADE;
CREATE VIEW vw_top_products AS
SELECT 
  p.id,
  p.name,
  p.category,
  SUM(ti.quantity) as total_qty,
  SUM(ti.total_price) as total_revenue,
  COUNT(DISTINCT t.id) as transaction_count,
  p.outlet_id
FROM transaction_items ti
JOIN products p ON ti.product_id = p.id
JOIN transactions t ON ti.transaction_id = t.id
WHERE t.status = 'completed'
GROUP BY ti.product_id, p.id, p.outlet_id;

-- View: Low Stock Products
DROP VIEW IF EXISTS vw_low_stock CASCADE;
CREATE VIEW vw_low_stock AS
SELECT 
  p.id,
  p.name,
  ps.quantity_in_stock,
  ps.reorder_level,
  o.id as outlet_id,
  o.name as outlet_name
FROM product_stock ps
JOIN products p ON ps.product_id = p.id
JOIN outlets o ON ps.outlet_id = o.id
WHERE ps.quantity_in_stock <= ps.reorder_level;

-- View: Cashier Performance
DROP VIEW IF EXISTS vw_cashier_performance CASCADE;
CREATE VIEW vw_cashier_performance AS
SELECT 
  e.id as cashier_id,
  e.name as cashier_name,
  e.outlet_id,
  o.name as outlet_name,
  DATE(t.transaction_date) as date,
  COUNT(t.id) as total_transactions,
  SUM(t.total_amount) as total_sales,
  AVG(t.total_amount) as avg_transaction
FROM transactions t
LEFT JOIN employees e ON t.cashier_id = e.id
LEFT JOIN outlets o ON t.outlet_id = o.id
WHERE t.status = 'completed'
GROUP BY t.cashier_id, e.id, e.name, t.outlet_id, o.id, o.name, DATE(t.transaction_date);

-- ============================================================================
-- TRIGGERS - Untuk auto-update updated_at column
-- ============================================================================

-- Function untuk update updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger ke semua tables yang punya updated_at
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_outlets_timestamp BEFORE UPDATE ON outlets
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_employees_timestamp BEFORE UPDATE ON employees
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_products_timestamp BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_product_stock_timestamp BEFORE UPDATE ON product_stock
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_payment_methods_timestamp BEFORE UPDATE ON payment_methods
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_transactions_timestamp BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_shift_records_timestamp BEFORE UPDATE ON shift_records
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_reports_cache_timestamp BEFORE UPDATE ON reports_cache
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- END OF DATABASE SCHEMA (PostgreSQL)
-- ============================================================================
