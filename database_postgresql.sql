-- ==========================================
-- Madura Mart Database Schema - PostgreSQL
-- Compatible dengan Supabase
-- ==========================================

-- Drop existing tables if exists (untuk development)
DROP TABLE IF EXISTS stock_logs CASCADE;
DROP TABLE IF EXISTS transaction_items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS user_outlets CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS outlets CASCADE;

-- ==========================================
-- 1. OUTLETS TABLE
-- ==========================================
CREATE TABLE outlets (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  owner VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  city VARCHAR(50),
  province VARCHAR(50),
  postal_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_outlets_owner ON outlets(owner);
CREATE INDEX idx_outlets_created_at ON outlets(created_at);

-- ==========================================
-- 2. USERS TABLE
-- ==========================================
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'cashier');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role user_role NOT NULL DEFAULT 'cashier',
  status user_status DEFAULT 'active',
  phone VARCHAR(20),
  profile_image VARCHAR(255),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ==========================================
-- 3. USER_OUTLETS TABLE (Many-to-Many)
-- ==========================================
CREATE TABLE user_outlets (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  outlet_id VARCHAR(36) NOT NULL,
  permissions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  UNIQUE(user_id, outlet_id)
);

CREATE INDEX idx_user_outlets_user_id ON user_outlets(user_id);
CREATE INDEX idx_user_outlets_outlet_id ON user_outlets(outlet_id);

-- ==========================================
-- 4. PRODUCTS TABLE
-- ==========================================
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'discontinued');

CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  outlet_id VARCHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  cost_price DECIMAL(12,2),
  stock INT NOT NULL DEFAULT 0,
  min_stock INT DEFAULT 5,
  sku VARCHAR(50),
  barcode VARCHAR(50),
  image VARCHAR(255),
  status product_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE
);

CREATE INDEX idx_products_outlet_id ON products(outlet_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);

-- ==========================================
-- 5. TRANSACTIONS TABLE
-- ==========================================
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'transfer', 'check', 'other');
CREATE TYPE transaction_status AS ENUM ('completed', 'pending', 'cancelled', 'refunded');

CREATE TABLE transactions (
  id VARCHAR(36) PRIMARY KEY,
  outlet_id VARCHAR(36) NOT NULL,
  cashier_id VARCHAR(36) NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'cash',
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  tax DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) NOT NULL,
  notes TEXT,
  receipt_number VARCHAR(50),
  status transaction_status DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  FOREIGN KEY (cashier_id) REFERENCES users(id)
);

CREATE INDEX idx_transactions_outlet_id ON transactions(outlet_id);
CREATE INDEX idx_transactions_cashier_id ON transactions(cashier_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_receipt_number ON transactions(receipt_number);

-- ==========================================
-- 6. TRANSACTION_ITEMS TABLE
-- ==========================================
CREATE TABLE transaction_items (
  id VARCHAR(36) PRIMARY KEY,
  transaction_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product_id ON transaction_items(product_id);

-- ==========================================
-- 7. STOCK_LOGS TABLE (Optional - untuk audit)
-- ==========================================
CREATE TYPE stock_action AS ENUM ('sale', 'purchase', 'adjustment', 'damage', 'return');

CREATE TABLE stock_logs (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  outlet_id VARCHAR(36) NOT NULL,
  action stock_action NOT NULL,
  quantity_change INT NOT NULL,
  notes TEXT,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE
);

CREATE INDEX idx_stock_logs_product_id ON stock_logs(product_id);
CREATE INDEX idx_stock_logs_outlet_id ON stock_logs(outlet_id);
CREATE INDEX idx_stock_logs_action ON stock_logs(action);
CREATE INDEX idx_stock_logs_created_at ON stock_logs(created_at);

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
  COUNT(t.id)::INT as total_transactions,
  COALESCE(SUM(t.total), 0)::DECIMAL(15,2) as total_sales,
  COALESCE(AVG(t.total), 0)::DECIMAL(15,2) as avg_transaction,
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
-- COMPOSITE INDEXES (untuk optimasi query)
-- ==========================================

CREATE INDEX idx_transaction_outlet_date ON transactions(outlet_id, created_at);
CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id, product_id);
CREATE INDEX idx_product_outlet_status ON products(outlet_id, status);

-- ==========================================
-- END OF POSTGRESQL SCHEMA
-- ==========================================
