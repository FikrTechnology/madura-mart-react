# 🗄️ Database Setup & Schema Guide

## 📋 Overview

Madura Mart menggunakan relational database dengan berikut tabel utama:

| Tabel | Tujuan | Records |
|-------|--------|---------|
| `outlets` | Toko/cabang | Primary data |
| `users` | Karyawan/user | Primary data |
| `user_outlets` | User-Outlet relationship | Many-to-many |
| `products` | Produk/inventory | Primary data |
| `transactions` | Penjualan/invoice | Business data |
| `transaction_items` | Items per transaksi | Detail transaksi |
| `stock_logs` | Audit stock | Optional |

## 🔗 Relational Diagram

```
outlets (1) ---- (N) products
   |                    |
   |                    |
   ├---- (N) transactions (has cashier_id -> users)
   |            |
   |            └---- (N) transaction_items (references product)
   |
   └---- (N) user_outlets (1-M) users
```

## 📊 Table Details

### 1. outlets
Menyimpan data toko/cabang
```sql
id (PK)        -- UUID/varchar(36)
name           -- Nama toko
owner          -- Pemilik toko
address        -- Alamat lengkap
phone          -- No telepon
email          -- Email toko
city           -- Kota
province       -- Provinsi
postal_code    -- Kode pos
created_at     -- Waktu buat
updated_at     -- Waktu update
```

### 2. users
Menyimpan data user/karyawan
```sql
id (PK)           -- UUID/varchar(36)
email (UNIQUE)    -- Email login
password_hash     -- Password ter-hash (bcrypt)
name              -- Nama lengkap
role              -- owner | admin | cashier
status            -- active | inactive | suspended
phone             -- No telepon
profile_image     -- Foto profil URL
last_login        -- Waktu login terakhir
created_at        -- Waktu buat
updated_at        -- Waktu update
```

### 3. user_outlets
Relasi many-to-many antara users dan outlets
```sql
id (PK)        -- UUID
user_id (FK)   -- Reference ke users
outlet_id (FK) -- Reference ke outlets
permissions    -- JSON array permissions
created_at     -- Waktu assign
```

**Contoh:**
- Owner (user_001) bisa akses outlets 001, 002, 003
- Admin (user_002) hanya akses outlet 001
- Cashier (user_004) hanya akses outlet 001

### 4. products
Menyimpan data produk/barang
```sql
id (PK)           -- UUID
outlet_id (FK)    -- Toko mana
name              -- Nama produk
description       -- Deskripsi
category          -- Kategori (Dapur, Minuman, dll)
price             -- Harga jual
cost_price        -- Harga beli/cost
stock             -- Stok tersedia
min_stock         -- Stok minimal (alert)
sku               -- Stock Keeping Unit
barcode           -- Barcode produk
image             -- URL gambar
status            -- active | inactive | discontinued
created_at        -- Waktu buat
updated_at        -- Waktu update
```

### 5. transactions
Menyimpan data penjualan/transaksi
```sql
id (PK)           -- UUID
outlet_id (FK)    -- Toko mana
cashier_id (FK)   -- Cashier yang handle
payment_method    -- cash | card | transfer | check | other
subtotal          -- Total sebelum diskon/tax
discount_amount   -- Jumlah diskon (Rp)
discount_percent  -- Persen diskon
tax               -- Pajak (PPN, dll)
total             -- Total akhir
notes             -- Catatan transaksi
receipt_number    -- No bukti/kwitansi
status            -- completed | pending | cancelled | refunded
created_at        -- Waktu transaksi
updated_at        -- Waktu update
```

### 6. transaction_items
Detail item dalam setiap transaksi
```sql
id (PK)           -- UUID
transaction_id (FK) -- Referensi transaksi
product_id (FK)   -- Produk apa
product_name      -- Snapshot nama produk
quantity          -- Jumlah terjual
price             -- Harga per unit saat itu
subtotal          -- quantity * price
created_at        -- Waktu buat
```

### 7. stock_logs (Optional)
Audit trail untuk perubahan stok
```sql
id (PK)           -- UUID
product_id (FK)   -- Produk mana
outlet_id (FK)    -- Toko mana
action            -- sale | purchase | adjustment | damage | return
quantity_change   -- Perubahan stok (+/-)
notes             -- Keterangan
created_by        -- User yang membuat
created_at        -- Waktu
```

## 🚀 Setup Instructions

### Option 1: MySQL (Local)

#### 1. Create Database
```bash
# Login ke MySQL
mysql -u root -p

# Atau gunakan MySQL Workbench
```

#### 2. Buat Database
```sql
CREATE DATABASE madura_mart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE madura_mart;
```

#### 3. Run Schema
```bash
# Terminal
mysql -u root -p madura_mart < database_mysql.sql

# Atau copy-paste dari database_mysql.sql ke MySQL client
```

#### 4. Verify
```sql
-- Check tables
SHOW TABLES;

-- Check data
SELECT * FROM outlets;
SELECT * FROM users;
```

### Option 2: PostgreSQL (Local)

#### 1. Create Database
```bash
# Terminal
createdb madura_mart

# Atau menggunakan pgAdmin GUI
```

#### 2. Run Schema
```bash
# Terminal
psql madura_mart < database_postgresql.sql

# Atau connect & run
psql -U postgres -d madura_mart
# Paste queries dari database_postgresql.sql
```

#### 3. Verify
```sql
-- Check tables
\dt

-- Check data
SELECT * FROM outlets;
SELECT * FROM users;
```

### Option 3: Supabase (Cloud PostgreSQL)

#### 1. Create Supabase Account
- Go to https://supabase.com
- Create new project
- Note: Project URL & Anon Key

#### 2. Open SQL Editor
- Go ke Dashboard → SQL Editor
- Create new query

#### 3. Paste Schema
- Copy semua dari `database_postgresql.sql`
- Paste ke SQL editor
- Run

#### 4. Verify Data
- Buka Table Editor
- Verify all tables created with sample data

## 💾 Sample Data

Schema sudah include sample data:

### Outlets (3 toko)
```
outlet_001 - Toko Madura Sidoarjo
outlet_002 - Toko Madura Surabaya
outlet_003 - Toko Madura Malang
```

### Users (4 orang)
```
user_001 - fikri@madura.com (owner, akses semua outlet)
user_002 - admin@outlet1.com (admin, akses outlet 001)
user_003 - admin@outlet2.com (admin, akses outlet 002)
user_004 - cashier@outlet1.com (cashier, akses outlet 001)
```

**Default Passwords (hash dalam database):**
- fikri123
- admin123
- cashier123

### Products (5 produk di outlet 001)
```
Beras Premium 5kg - Rp 75.000
Minyak Goreng 2L - Rp 28.000
Gula Putih 1kg - Rp 12.000
Telur Ayam 1 Kg - Rp 32.000
Susu UHT 1L - Rp 15.000
```

## 🔐 User Roles & Permissions

### Owner
- Akses: Semua outlets
- Permissions: View/Create/Edit/Delete semua data
- Dashboard: Overview semua toko

### Admin
- Akses: Outlet tertentu saja
- Permissions: View/Create/Edit/Delete data outlet
- Dashboard: Data outlet spesifik

### Cashier
- Akses: Outlet tertentu saja
- Permissions: Create transaksi, View produk
- Dashboard: Kasir/penjualan

## 📈 Key Relationships

### Contoh: Create Transaksi
```
1. Cashier login (user_004)
   └─ System check: user_004 akses outlet_001? ✓

2. Cashier select produk (prod_001, prod_002)
   └─ Query: WHERE outlet_id = 'outlet_001'

3. Cashier create transaksi
   └─ Insert transaction (id, outlet_id, cashier_id, total, ...)
   └─ Insert transaction_items (transaksi_id, product_id, qty, price, ...)
   └─ Update products SET stock = stock - qty

4. Transaksi selesai
   └─ Bisa generate receipt, laporan, PDF
```

## 📊 Useful Queries

### 1. Total Penjualan Hari Ini
```sql
-- MySQL
SELECT SUM(total) as penjualan_hari_ini
FROM transactions
WHERE DATE(created_at) = CURDATE();

-- PostgreSQL
SELECT SUM(total) as penjualan_hari_ini
FROM transactions
WHERE DATE(created_at) = CURRENT_DATE;
```

### 2. Top 5 Produk Terjual
```sql
SELECT 
  ti.product_name,
  SUM(ti.quantity) as total_qty,
  SUM(ti.subtotal) as total_sales
FROM transaction_items ti
GROUP BY ti.product_name
ORDER BY total_qty DESC
LIMIT 5;
```

### 3. Stock Rendah Alert
```sql
SELECT * FROM products
WHERE stock <= min_stock
AND status = 'active'
ORDER BY stock ASC;
```

### 4. User Outlet Assignment
```sql
SELECT 
  u.name,
  u.role,
  o.name as outlet_name
FROM user_outlets uo
JOIN users u ON uo.user_id = u.id
JOIN outlets o ON uo.outlet_id = o.id
ORDER BY u.name, o.name;
```

### 5. Transaction Detail
```sql
SELECT 
  t.id,
  t.receipt_number,
  u.name as cashier,
  ti.product_name,
  ti.quantity,
  ti.price,
  ti.subtotal,
  t.total,
  t.created_at
FROM transactions t
JOIN users u ON t.cashier_id = u.id
JOIN transaction_items ti ON t.id = ti.transaction_id
WHERE DATE(t.created_at) = CURRENT_DATE
ORDER BY t.created_at DESC;
```

## 🔄 Database Sync dengan Aplikasi

### Best Practices:
1. **Use Service Layer** - Tidak query langsung dari component
2. **Error Handling** - Catch & handle database errors
3. **Validation** - Validate data sebelum insert/update
4. **Indexes** - Schema sudah include optimized indexes
5. **Backup** - Regular backup production database
6. **Migrations** - Use version control untuk schema changes

## 🐛 Common Issues & Solutions

### Issue: Can't Connect to Database
**Solution:**
- Verify database running
- Check credentials in .env
- Check firewall settings (port 5432 for PostgreSQL, 3306 for MySQL)

### Issue: Password Hash Error
**Solution:**
- Use bcrypt untuk hash password di backend
- Store hashed password, never plain text

### Issue: Data Inconsistency
**Solution:**
- Use transactions untuk multi-step operations
- Setup foreign keys dengan CASCADE delete
- Regular data integrity checks

## 📝 Migration Guide

Jika butuh rename/add column:

**MySQL:**
```sql
ALTER TABLE products ADD COLUMN supplier VARCHAR(100);
ALTER TABLE products RENAME COLUMN image TO image_url;
```

**PostgreSQL:**
```sql
ALTER TABLE products ADD COLUMN supplier VARCHAR(100);
ALTER TABLE products RENAME COLUMN image TO image_url;
```

## 🔗 Related Documents

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Quick start
- [API_INTEGRATION.md](API_INTEGRATION.md) - API endpoints
- [ARCHITECTURE.md](ARCHITECTURE.md) - Clean architecture pattern

---

**Database setup complete! 🎉**

Next: Run backend server dan test API endpoints.
