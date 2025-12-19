-- ============================================================================
-- MADURA MART POS SYSTEM - DATABASE SCHEMA
-- Database initialization script untuk MySQL
-- ============================================================================

-- Set charset dan collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================================
-- 1. USERS TABLE - Master User Account
-- ============================================================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('owner', 'admin', 'cashier') NOT NULL,
  avatar_url VARCHAR(255) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. OUTLETS TABLE - Data Outlet/Toko
-- ============================================================================
DROP TABLE IF EXISTS outlets;
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
  INDEX idx_status (status),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. EMPLOYEES TABLE - Data Karyawan (Admin & Cashier)
-- ============================================================================
DROP TABLE IF EXISTS employees;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. EMPLOYEE_OUTLET_ASSIGNMENT TABLE - Karyawan ke Multiple Outlets
-- ============================================================================
DROP TABLE IF EXISTS employee_outlet_assignment;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. PRODUCTS TABLE - Master Data Produk
-- ============================================================================
DROP TABLE IF EXISTS products;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. PRODUCT_STOCK TABLE - Tracking Stok Per Outlet
-- ============================================================================
DROP TABLE IF EXISTS product_stock;
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
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_quantity (quantity_in_stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. STOCK_MOVEMENTS TABLE - Riwayat Pergerakan Stok (Audit Trail)
-- ============================================================================
DROP TABLE IF EXISTS stock_movements;
CREATE TABLE stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  outlet_id VARCHAR(50) NOT NULL,
  movement_type ENUM('in', 'out', 'adjustment', 'damage') NOT NULL,
  quantity INT NOT NULL,
  reference_type VARCHAR(50) NULL,
  reference_id VARCHAR(50) NULL,
  notes TEXT NULL,
  created_by VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_product_id (product_id),
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_created_at (created_at),
  INDEX idx_movement_type (movement_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. PAYMENT_METHODS TABLE - Metode Pembayaran
-- ============================================================================
DROP TABLE IF EXISTS payment_methods;
CREATE TABLE payment_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('cash', 'card', 'digital_wallet', 'bank_transfer', 'check', 'qris') NOT NULL,
  description TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_code (code),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. TRANSACTIONS TABLE - Riwayat Transaksi Penjualan
-- ============================================================================
DROP TABLE IF EXISTS transactions;
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
  INDEX idx_status (status),
  INDEX idx_outlet_date (outlet_id, transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. TRANSACTION_ITEMS TABLE - Detail Item Transaksi
-- ============================================================================
DROP TABLE IF EXISTS transaction_items;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. SHIFT_RECORDS TABLE - Catatan Shift Kasir (Optional)
-- ============================================================================
DROP TABLE IF EXISTS shift_records;
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
  INDEX idx_shift_start (shift_start),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. AUDIT_LOGS TABLE - Log Aktivitas Sistem
-- ============================================================================
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NULL,
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
  INDEX idx_created_at (created_at),
  INDEX idx_outlet_date (outlet_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 13. REPORTS_CACHE TABLE - Cache Report (Optional)
-- ============================================================================
DROP TABLE IF EXISTS reports_cache;
CREATE TABLE reports_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  outlet_id VARCHAR(50) NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  report_date DATE NOT NULL,
  report_data LONGTEXT NOT NULL,
  generated_by VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_report (outlet_id, report_type, report_date),
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_report_type (report_type),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SAMPLE DATA - Demo Data untuk Testing
-- ============================================================================

-- Insert Users
INSERT INTO users VALUES
('user_001', 'fikri@madura.com', '$2y$10$YOUR_HASHED_PASSWORD_HERE', 'Fikri (Owner)', 'owner', NULL, TRUE, NULL, NOW(), NOW()),
('user_002', 'admin@outlet1.com', '$2y$10$YOUR_HASHED_PASSWORD_HERE', 'Admin Outlet 1', 'admin', NULL, TRUE, NULL, NOW(), NOW()),
('user_003', 'admin@outlet2.com', '$2y$10$YOUR_HASHED_PASSWORD_HERE', 'Admin Outlet 2', 'admin', NULL, TRUE, NULL, NOW(), NOW()),
('user_004', 'cashier@outlet1.com', '$2y$10$YOUR_HASHED_PASSWORD_HERE', 'Cashier Outlet 1', 'cashier', NULL, TRUE, NULL, NOW(), NOW());

-- Insert Outlets
INSERT INTO outlets VALUES
('outlet_001', 'Toko Madura - Sidoarjo', 'user_001', 'Jl. Madura No. 123, Sidoarjo', '0812-3456-7890', 'Budi', '0812-3456-7890', 'Sidoarjo', 'Jawa Timur', '61200', 'active', NOW(), NOW()),
('outlet_002', 'Toko Madura - Surabaya', 'user_001', 'Jl. Surabaya No. 456, Surabaya', '0813-9876-5432', 'Ahmad', '0813-9876-5432', 'Surabaya', 'Jawa Timur', '60100', 'active', NOW(), NOW()),
('outlet_003', 'Toko Madura - Malang', 'user_001', 'Jl. Malang No. 789, Malang', '0814-1111-2222', 'Siti', '0814-1111-2222', 'Malang', 'Jawa Timur', '65100', 'active', NOW(), NOW());

-- Insert Employees
INSERT INTO employees VALUES
('emp_001', 'outlet_001', 'Budi Admin', 'budi.admin@outlet1.com', '$2y$10$YOUR_HASHED_PASSWORD_HERE', 'admin', '0812-3333-4444', 'Sidoarjo', NULL, 'active', DATE_SUB(CURDATE(), INTERVAL 6 MONTH), 'fixed', 3000000, NOW(), NOW()),
('emp_002', 'outlet_001', 'Toni Kasir', 'toni@outlet1.com', '$2y$10$YOUR_HASHED_PASSWORD_HERE', 'cashier', '0812-5555-6666', 'Sidoarjo', NULL, 'active', DATE_SUB(CURDATE(), INTERVAL 3 MONTH), 'fixed', 2000000, NOW(), NOW()),
('emp_003', 'outlet_002', 'Ahmad Admin', 'ahmad.admin@outlet2.com', '$2y$10$YOUR_HASHED_PASSWORD_HERE', 'admin', '0813-3333-4444', 'Surabaya', NULL, 'active', DATE_SUB(CURDATE(), INTERVAL 6 MONTH), 'fixed', 3000000, NOW(), NOW());

-- Insert Payment Methods
INSERT INTO payment_methods VALUES
(NULL, 'outlet_001', 'Tunai', 'cash', 'cash', 'Pembayaran Tunai', TRUE, 1, NOW(), NOW()),
(NULL, 'outlet_001', 'Debit Card', 'debit', 'card', 'Kartu Debit (ATM)', TRUE, 2, NOW(), NOW()),
(NULL, 'outlet_001', 'Kredit Card', 'credit', 'card', 'Kartu Kredit', TRUE, 3, NOW(), NOW()),
(NULL, 'outlet_001', 'E-Wallet', 'ewallet', 'digital_wallet', 'E-Wallet (OVO, GoPay, etc)', TRUE, 4, NOW(), NOW()),
(NULL, 'outlet_001', 'QRIS', 'qris', 'qris', 'QRIS Payment', TRUE, 5, NOW(), NOW()),
(NULL, 'outlet_002', 'Tunai', 'cash', 'cash', 'Pembayaran Tunai', TRUE, 1, NOW(), NOW()),
(NULL, 'outlet_002', 'Debit Card', 'debit', 'card', 'Kartu Debit (ATM)', TRUE, 2, NOW(), NOW()),
(NULL, 'outlet_002', 'E-Wallet', 'ewallet', 'digital_wallet', 'E-Wallet (OVO, GoPay, etc)', TRUE, 3, NOW(), NOW());

-- ============================================================================
-- VIEWS - Untuk memudahkan query reporting
-- ============================================================================

-- View: Sales Summary by Outlet and Date
DROP VIEW IF EXISTS vw_sales_summary;
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
GROUP BY t.outlet_id, DATE(t.transaction_date);

-- View: Top Selling Products
DROP VIEW IF EXISTS vw_top_products;
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
GROUP BY ti.product_id, p.outlet_id;

-- View: Low Stock Products
DROP VIEW IF EXISTS vw_low_stock;
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
DROP VIEW IF EXISTS vw_cashier_performance;
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
GROUP BY t.cashier_id, t.outlet_id, DATE(t.transaction_date);

-- ============================================================================
-- USEFUL INDEXES FOR PERFORMANCE
-- ============================================================================

-- For transaction queries by outlet and date (commonly used in reports)
CREATE INDEX idx_transaction_outlet_date ON transactions(outlet_id, transaction_date);

-- For stock queries
CREATE INDEX idx_stock_product_outlet ON product_stock(product_id, outlet_id);

-- For employee queries by outlet and role
CREATE INDEX idx_employee_outlet_role ON employees(outlet_id, role);

-- For audit log queries
CREATE INDEX idx_audit_outlet_date ON audit_logs(outlet_id, created_at);

-- ============================================================================
-- END OF DATABASE SCHEMA
-- ============================================================================
