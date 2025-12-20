-- ==========================================
-- Madura Mart Database Schema - MySQL
-- Compatible dengan Supabase PostgreSQL
-- ==========================================

-- Drop existing tables if exists (untuk development)
DROP TABLE IF EXISTS transaction_items;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS outlets;

-- ==========================================
-- 1. OUTLETS TABLE
-- ==========================================
CREATE TABLE outlets (
  id VARCHAR(36) PRIMARY KEY COMMENT 'Unique outlet ID',
  name VARCHAR(100) NOT NULL COMMENT 'Outlet name',
  owner VARCHAR(100) NOT NULL COMMENT 'Owner name',
  address VARCHAR(255) NOT NULL COMMENT 'Physical address',
  phone VARCHAR(20) NOT NULL COMMENT 'Phone number',
  email VARCHAR(100) COMMENT 'Outlet email',
  city VARCHAR(50) COMMENT 'City',
  province VARCHAR(50) COMMENT 'Province',
  postal_code VARCHAR(10) COMMENT 'Postal code',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Created date',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last updated',
  INDEX idx_owner (owner),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Store outlets/branches';

-- ==========================================
-- 2. USERS TABLE
-- ==========================================
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY COMMENT 'Unique user ID',
  email VARCHAR(100) NOT NULL UNIQUE COMMENT 'User email (login)',
  password_hash VARCHAR(255) NOT NULL COMMENT 'Hashed password',
  name VARCHAR(100) NOT NULL COMMENT 'Full name',
  role ENUM('owner', 'admin', 'cashier') NOT NULL DEFAULT 'cashier' COMMENT 'User role',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active' COMMENT 'User status',
  phone VARCHAR(20) COMMENT 'Phone number',
  profile_image VARCHAR(255) COMMENT 'Profile image URL',
  last_login TIMESTAMP COMMENT 'Last login time',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Created date',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last updated',
  UNIQUE KEY uk_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='System users/employees';

-- ==========================================
-- 3. USER_OUTLETS TABLE (Many-to-Many)
-- ==========================================
CREATE TABLE user_outlets (
  id VARCHAR(36) PRIMARY KEY COMMENT 'Unique ID',
  user_id VARCHAR(36) NOT NULL COMMENT 'User ID',
  outlet_id VARCHAR(36) NOT NULL COMMENT 'Outlet ID',
  permissions VARCHAR(500) COMMENT 'JSON permissions array',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Created date',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_outlet (user_id, outlet_id),
  INDEX idx_user_id (user_id),
  INDEX idx_outlet_id (outlet_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User-Outlet relationship';

-- ==========================================
-- 4. PRODUCTS TABLE
-- ==========================================
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY COMMENT 'Unique product ID',
  outlet_id VARCHAR(36) NOT NULL COMMENT 'Outlet ID',
  name VARCHAR(150) NOT NULL COMMENT 'Product name',
  description TEXT COMMENT 'Product description',
  category VARCHAR(50) NOT NULL COMMENT 'Product category',
  price DECIMAL(12,2) NOT NULL COMMENT 'Selling price',
  cost_price DECIMAL(12,2) COMMENT 'Cost price',
  stock INT NOT NULL DEFAULT 0 COMMENT 'Current stock',
  min_stock INT DEFAULT 5 COMMENT 'Minimum stock alert',
  sku VARCHAR(50) COMMENT 'Product SKU',
  barcode VARCHAR(50) COMMENT 'Barcode',
  image VARCHAR(255) COMMENT 'Product image URL',
  status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active' COMMENT 'Product status',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Created date',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last updated',
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_sku (sku),
  INDEX idx_barcode (barcode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Products/Inventory';

-- ==========================================
-- 5. TRANSACTIONS TABLE
-- ==========================================
CREATE TABLE transactions (
  id VARCHAR(36) PRIMARY KEY COMMENT 'Unique transaction ID',
  outlet_id VARCHAR(36) NOT NULL COMMENT 'Outlet ID',
  cashier_id VARCHAR(36) NOT NULL COMMENT 'Cashier user ID',
  payment_method ENUM('cash', 'card', 'transfer', 'check', 'other') NOT NULL DEFAULT 'cash' COMMENT 'Payment method',
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Subtotal before tax/discount',
  discount_amount DECIMAL(15,2) DEFAULT 0 COMMENT 'Discount amount',
  discount_percent DECIMAL(5,2) DEFAULT 0 COMMENT 'Discount percentage',
  tax DECIMAL(15,2) DEFAULT 0 COMMENT 'Tax amount',
  total DECIMAL(15,2) NOT NULL COMMENT 'Total amount',
  notes TEXT COMMENT 'Transaction notes/remarks',
  receipt_number VARCHAR(50) COMMENT 'Receipt number for printing',
  status ENUM('completed', 'pending', 'cancelled', 'refunded') DEFAULT 'completed' COMMENT 'Transaction status',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Transaction date/time',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last updated',
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  FOREIGN KEY (cashier_id) REFERENCES users(id),
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_cashier_id (cashier_id),
  INDEX idx_created_at (created_at),
  INDEX idx_status (status),
  INDEX idx_receipt_number (receipt_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sales transactions/invoices';

-- ==========================================
-- 6. TRANSACTION_ITEMS TABLE
-- ==========================================
CREATE TABLE transaction_items (
  id VARCHAR(36) PRIMARY KEY COMMENT 'Unique item ID',
  transaction_id VARCHAR(36) NOT NULL COMMENT 'Transaction ID',
  product_id VARCHAR(36) NOT NULL COMMENT 'Product ID',
  product_name VARCHAR(150) NOT NULL COMMENT 'Product name (snapshot)',
  quantity INT NOT NULL COMMENT 'Quantity sold',
  price DECIMAL(12,2) NOT NULL COMMENT 'Unit price',
  subtotal DECIMAL(15,2) NOT NULL COMMENT 'Quantity * Price',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Created date',
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Items in each transaction';

-- ==========================================
-- 7. STOCK_LOGS TABLE (Optional - untuk audit)
-- ==========================================
CREATE TABLE stock_logs (
  id VARCHAR(36) PRIMARY KEY COMMENT 'Unique log ID',
  product_id VARCHAR(36) NOT NULL COMMENT 'Product ID',
  outlet_id VARCHAR(36) NOT NULL COMMENT 'Outlet ID',
  action ENUM('sale', 'purchase', 'adjustment', 'damage', 'return') NOT NULL COMMENT 'Stock action',
  quantity_change INT NOT NULL COMMENT 'Quantity change (+ or -)',
  notes TEXT COMMENT 'Reason/notes',
  created_by VARCHAR(36) COMMENT 'User who made the change',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Created date',
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_outlet_id (outlet_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stock movement audit log';

-- ==========================================
-- INSERT DEFAULT DATA
-- ==========================================

-- Sample Outlets
INSERT INTO outlets (id, name, owner, address, phone, email, city, province) VALUES
('outlet_001', 'Toko Madura - Sidoarjo', 'Fikri', 'Jl. Madura No. 123', '0812-3456-7890', 'sidoarjo@madura.com', 'Sidoarjo', 'East Java'),
('outlet_002', 'Toko Madura - Surabaya', 'Fikri', 'Jl. Surabaya No. 456', '0813-9876-5432', 'surabaya@madura.com', 'Surabaya', 'East Java'),
('outlet_003', 'Toko Madura - Malang', 'Fikri', 'Jl. Malang No. 789', '0814-1111-2222', 'malang@madura.com', 'Malang', 'East Java');

-- Sample Users (password hashed - in production use bcrypt)
-- Passwords: fikri123, admin123, cashier123
INSERT INTO users (id, email, password_hash, name, role, status, phone) VALUES
('user_001', 'fikri@madura.com', 'hashed_fikri123', 'Fikri (Owner)', 'owner', 'active', '0812-1111-1111'),
('user_002', 'admin@outlet1.com', 'hashed_admin123', 'Admin Outlet 1', 'admin', 'active', '0812-2222-2222'),
('user_003', 'admin@outlet2.com', 'hashed_admin123', 'Admin Outlet 2', 'admin', 'active', '0812-3333-3333'),
('user_004', 'cashier@outlet1.com', 'hashed_cashier123', 'Cashier Outlet 1', 'cashier', 'active', '0812-4444-4444');

-- User-Outlet Assignments
INSERT INTO user_outlets (id, user_id, outlet_id) VALUES
('uo_001', 'user_001', 'outlet_001'),
('uo_002', 'user_001', 'outlet_002'),
('uo_003', 'user_001', 'outlet_003'),
('uo_004', 'user_002', 'outlet_001'),
('uo_005', 'user_003', 'outlet_002'),
('uo_006', 'user_004', 'outlet_001');

-- Sample Products
INSERT INTO products (id, outlet_id, name, description, category, price, cost_price, stock, sku, image) VALUES
('prod_001', 'outlet_001', 'Beras Premium 5kg', 'Beras premium pilihan berkualitas tinggi', 'Kebutuhan Dapur', 75000, 60000, 25, 'BR001', 'https://images.unsplash.com/photo-1586857529235-ea4a90b1e595?w=300'),
('prod_002', 'outlet_001', 'Minyak Goreng 2L', 'Minyak goreng berkualitas', 'Kebutuhan Dapur', 28000, 22000, 10, 'MG001', 'https://images.unsplash.com/photo-1587291352341-ccb540eae75f?w=300'),
('prod_003', 'outlet_001', 'Gula Putih 1kg', 'Gula putih kemasan 1kg', 'Kebutuhan Dapur', 12000, 9000, 50, 'GP001', 'https://images.unsplash.com/photo-1599599810694-b308981df39e?w=300'),
('prod_004', 'outlet_001', 'Telur Ayam 1 Kg', 'Telur ayam segar', 'Makanan', 32000, 25000, 30, 'TR001', 'https://images.unsplash.com/photo-1582722921519-94d3dba35522?w=300'),
('prod_005', 'outlet_001', 'Susu UHT 1L', 'Susu UHT segar', 'Minuman', 15000, 11000, 40, 'SU001', 'https://images.unsplash.com/photo-1553531088-89dbbf58d9d1?w=300');

-- ==========================================
-- VIEWS (Optional - for easy querying)
-- ==========================================

-- View: Outlet Sales Summary
CREATE VIEW v_outlet_sales_summary AS
SELECT 
  o.id,
  o.name,
  COUNT(t.id) as total_transactions,
  SUM(t.total) as total_sales,
  AVG(t.total) as avg_transaction,
  DATE(t.created_at) as sale_date
FROM outlets o
LEFT JOIN transactions t ON o.id = t.outlet_id
GROUP BY o.id, o.name, DATE(t.created_at);

-- View: Product Stock Status
CREATE VIEW v_product_stock_status AS
SELECT 
  p.id,
  p.name,
  p.category,
  p.stock,
  p.min_stock,
  CASE 
    WHEN p.stock <= p.min_stock THEN 'Low Stock'
    WHEN p.stock = 0 THEN 'Out of Stock'
    ELSE 'In Stock'
  END as stock_status,
  o.name as outlet_name
FROM products p
LEFT JOIN outlets o ON p.outlet_id = o.id
ORDER BY p.stock ASC;

-- ==========================================
-- INDEXES (untuk optimasi query)
-- ==========================================

-- Composite indexes untuk common queries
CREATE INDEX idx_transaction_outlet_date ON transactions(outlet_id, created_at);
CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id, product_id);
CREATE INDEX idx_product_outlet_status ON products(outlet_id, status);

-- ==========================================
-- END OF MYSQL SCHEMA
-- ==========================================
