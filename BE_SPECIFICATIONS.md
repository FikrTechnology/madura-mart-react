# Backend API Specifications - Madura Mart

**Project**: Madura Mart - Retail Management System  
**Version**: 1.0.0  
**Last Updated**: December 21, 2025  
**Frontend Framework**: React + TypeScript  
**Backend API Base**: `http://localhost:5000/api`

---

## Table of Contents

1. [Authentication & Session](#authentication--session)
2. [Data Models](#data-models)
3. [Dashboard Owner Specifications](#dashboard-owner-specifications)
4. [Dashboard Admin Specifications](#dashboard-admin-specifications)
5. [Dashboard Kasir Specifications](#dashboard-kasir-specifications)
6. [Common Endpoints](#common-endpoints)
7. [Error Handling](#error-handling)
8. [Response Format](#response-format)

---

## Authentication & Session

### Session Requirements
- **Session Duration**: 24 hours (1 hari)
- **Storage**: JWT Token + Refresh Token
- **Roles**: owner, admin, cashier
- **Token Location**: `Authorization: Bearer <token>`

### Login Endpoint
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@email.com",
  "password": "password123"
}

Success Response (200):
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@email.com",
      "name": "User Name",
      "role": "owner|admin|cashier",
      "status": "active|inactive|suspended",
      "phone": "+62812345678",
      "profile_image": "url",
      "created_at": "2025-12-21T10:00:00Z",
      "updated_at": "2025-12-21T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400 // seconds (24 hours)
  },
  "message": "Login berhasil"
}

Error Response (401):
{
  "success": false,
  "error": "Email atau password salah",
  "statusCode": 401
}
```

### Logout Endpoint
```
POST /api/auth/logout
Authorization: Bearer <token>

Success Response (200):
{
  "success": true,
  "message": "Logout berhasil"
}
```

### Validate Session/Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Success Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@email.com",
    "name": "User Name",
    "role": "owner|admin|cashier",
    "status": "active",
    "created_at": "2025-12-21T10:00:00Z"
  }
}

Error Response (401):
{
  "success": false,
  "error": "Token invalid atau expired",
  "statusCode": 401
}
```

### Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json

Request Body:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Success Response (200):
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400
  }
}
```

---

## Data Models

### User Model
```typescript
{
  "id": "uuid",
  "email": "string (unique)",
  "password": "string (hashed)",
  "name": "string",
  "role": "owner|admin|cashier",
  "status": "active|inactive|suspended",
  "phone": "string|null",
  "profile_image": "url|null",
  "outlet_ids": ["uuid1", "uuid2"], // For admin & cashier
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

### Outlet Model
```typescript
{
  "id": "uuid",
  "name": "string",
  "owner_id": "uuid",
  "address": "string",
  "phone": "string",
  "email": "string|null",
  "city": "string|null",
  "province": "string|null",
  "postal_code": "string|null",
  "status": "active|inactive",
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

### Product Model
```typescript
{
  "id": "uuid",
  "outlet_id": "uuid",
  "name": "string",
  "description": "string|null",
  "category": "Kebutuhan Dapur|Kebutuhan Rumah|Makanan|Minuman|Rokok|Lain-lain",
  "price": "number",
  "cost_price": "number|null",
  "stock": "number",
  "min_stock": "number|null",
  "sku": "string|null",
  "barcode": "string|null",
  "image": "url|null",
  "status": "active|inactive|discontinued",
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

### Transaction Model
```typescript
{
  "id": "uuid",
  "outlet_id": "uuid",
  "cashier_id": "uuid",
  "payment_method": "tunai|transfer|e-wallet",
  "subtotal": "number",
  "discount_amount": "number|null",
  "discount_percent": "number|null",
  "tax": "number|null",
  "total": "number",
  "notes": "string|null",
  "receipt_number": "string",
  "status": "completed|pending|cancelled|refunded",
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

### Transaction Item Model
```typescript
{
  "id": "uuid",
  "transaction_id": "uuid",
  "product_id": "uuid",
  "product_name": "string",
  "quantity": "number",
  "price": "number",
  "subtotal": "number",
  "created_at": "ISO 8601 datetime"
}
```

---

## Dashboard Owner Specifications

### 1. Tab: Ringkasan (Overview)

#### 1.1 Get Outlet Dropdown
```
GET /api/outlets
Authorization: Bearer <token>
Query Parameters: (optional)
  - status: "active|inactive"
  - owner_id: "uuid" (if owner filtering)

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Outlet Pusat",
      "address": "Jl. Madura No. 1",
      "city": "Surabaya",
      "status": "active"
    },
    {
      "id": "uuid2",
      "name": "Outlet Cabang",
      "address": "Jl. Madura No. 2",
      "city": "Jakarta",
      "status": "active"
    }
  ]
}
```

#### 1.2 Get Overview Summary (Ringkasan)
```
GET /api/dashboard/owner/overview
Authorization: Bearer <token>
Query Parameters:
  - outlet_id: "uuid|all" (Default: "all")
  - period: "today|week|month|year" (optional, default: all)

Response (200):
{
  "success": true,
  "data": {
    "total_sales": 15500000, // Total penjualan dalam semua waktu
    "today_sales": 2500000,  // Penjualan hari ini
    "total_transactions": 145, // Total transaksi
    "outlet_count": 3,       // Jumlah outlet
    "top_products": [        // Produk terlaris
      {
        "id": "uuid",
        "name": "Beras Premium 5kg",
        "quantity": 150,
        "revenue": 1500000,
        "category": "Kebutuhan Dapur"
      },
      {
        "id": "uuid2",
        "name": "Minyak Goreng 2L",
        "quantity": 120,
        "revenue": 960000,
        "category": "Kebutuhan Dapur"
      }
    ],
    "outlet_id_selected": "all|uuid"
  }
}
```

---

### 2. Tab: Inventory

#### 2.1 Get Inventory Summary
```
GET /api/dashboard/owner/inventory
Authorization: Bearer <token>
Query Parameters:
  - outlet_id: "uuid|all" (Default: "all")

Response (200):
{
  "success": true,
  "data": {
    "total_products": 156,       // Total produk
    "out_of_stock": 12,          // Stok habis
    "low_stock": 28,             // Stok rendah (< 5)
    "total_inventory_value": 125500000, // Total nilai inventaris
    "low_stock_products": [      // Produk stok rendah
      {
        "id": "uuid",
        "name": "Beras Premium",
        "category": "Kebutuhan Dapur",
        "stock": 3,
        "price": 10000,
        "outlet_id": "uuid"
      },
      {
        "id": "uuid2",
        "name": "Gula",
        "category": "Kebutuhan Dapur",
        "stock": 4,
        "price": 8000,
        "outlet_id": "uuid"
      }
    ],
    "outlet_id_selected": "all|uuid"
  }
}
```

---

### 3. Tab: Laporan & Analytics

#### 3.1 Get Sales Report
```
GET /api/dashboard/owner/reports/sales
Authorization: Bearer <token>
Query Parameters:
  - outlet_id: "uuid|all" (Default: "all")
  - start_date: "2025-12-01" (Format: YYYY-MM-DD)
  - end_date: "2025-12-21" (Format: YYYY-MM-DD)
  - period_type: "daily|weekly|monthly" (optional)

Response (200):
{
  "success": true,
  "data": {
    "summary": {
      "total_sales": 15500000,
      "total_transactions": 145,
      "total_items_sold": 1250,
      "average_per_transaction": 106896
    },
    "period_data": [
      {
        "date": "2025-12-21",
        "sales": 2500000,
        "transactions": 20,
        "items_sold": 150,
        "avg_transaction": 125000
      },
      {
        "date": "2025-12-20",
        "sales": 2200000,
        "transactions": 18,
        "items_sold": 140,
        "avg_transaction": 122222
      }
    ],
    "payment_methods": {
      "tunai": {
        "count": 85,
        "total": 8500000,
        "percentage": 58.06
      },
      "transfer": {
        "count": 40,
        "total": 4800000,
        "percentage": 32.26
      },
      "e-wallet": {
        "count": 20,
        "total": 2200000,
        "percentage": 14.84
      }
    },
    "category_performance": [
      {
        "category": "Kebutuhan Dapur",
        "total_sales": 6500000,
        "total_quantity": 450,
        "average_price": 14444
      },
      {
        "category": "Makanan",
        "total_sales": 5200000,
        "total_quantity": 520,
        "average_price": 10000
      }
    ],
    "top_products": [
      {
        "id": "uuid",
        "name": "Beras Premium 5kg",
        "quantity_sold": 150,
        "revenue": 1500000,
        "category": "Kebutuhan Dapur"
      }
    ],
    "filters": {
      "outlet_id": "all|uuid",
      "start_date": "2025-12-01",
      "end_date": "2025-12-21"
    }
  }
}

Query Parameters untuk Sorting:
  - sort_by: "quantity|revenue" (For top_products)
  - sort_order: "asc|desc"
```

---

### 4. Tab: Produk All Outlet

#### 4.1 Get All Products with Filter
```
GET /api/products
Authorization: Bearer <token>
Query Parameters:
  - outlet_id: "uuid|all" (Default: "all")
  - category: "Kebutuhan Dapur|Makanan|..." (optional)
  - status: "active|inactive|discontinued" (Default: "active")
  - search: "string" (optional, search by product name)
  - page: 1 (optional, for pagination)
  - limit: 20 (optional)

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Beras Premium 5kg",
      "category": "Kebutuhan Dapur",
      "price": 10000,
      "stock": 50,
      "status": "active",
      "outlet_id": "uuid",
      "outlet_name": "Outlet Pusat",
      "image": "url",
      "created_at": "2025-12-21T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

### 5. Tab: Manajemen Outlet & Karyawan

#### 5.1 Create New Outlet
```
POST /api/outlets
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "Outlet Baru",
  "address": "Jl. Madura No. 5",
  "phone": "+62812345678",
  "city": "Malang",
  "province": "Jawa Timur",
  "postal_code": "65115",
  "email": "outlet@email.com"
}

Success Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Outlet Baru",
    "owner_id": "uuid",
    "address": "Jl. Madura No. 5",
    "phone": "+62812345678",
    "city": "Malang",
    "province": "Jawa Timur",
    "postal_code": "65115",
    "email": "outlet@email.com",
    "status": "active",
    "created_at": "2025-12-21T10:00:00Z"
  },
  "message": "Outlet berhasil ditambahkan"
}
```

#### 5.2 Get All Outlets
```
GET /api/outlets
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Outlet Pusat",
      "address": "Jl. Madura No. 1",
      "phone": "+62812345678",
      "city": "Surabaya",
      "province": "Jawa Timur",
      "postal_code": "60000",
      "status": "active",
      "created_at": "2025-12-21T10:00:00Z"
    }
  ]
}
```

#### 5.3 Update Outlet
```
PUT /api/outlets/{outlet_id}
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "Outlet Pusat Updated",
  "address": "Jl. Madura No. 1 Updated",
  "phone": "+62812345678",
  "city": "Surabaya",
  "status": "active|inactive"
}

Success Response (200):
{
  "success": true,
  "data": { ... },
  "message": "Outlet berhasil diperbarui"
}
```

#### 5.4 Delete Outlet
```
DELETE /api/outlets/{outlet_id}
Authorization: Bearer <token>

Success Response (200):
{
  "success": true,
  "message": "Outlet berhasil dihapus"
}
```

#### 5.5 Create New Employee
```
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "Karyawan Baru",
  "email": "karyawan@email.com",
  "password": "password123",
  "phone": "+62812345678",
  "role": "cashier|admin",
  "status": "active",
  "outlet_ids": ["uuid1", "uuid2"] // For admin: multiple, For cashier: single
}

Success Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Karyawan Baru",
    "email": "karyawan@email.com",
    "role": "cashier",
    "phone": "+62812345678",
    "status": "active",
    "outlet_ids": ["uuid1"],
    "created_at": "2025-12-21T10:00:00Z"
  },
  "message": "Karyawan berhasil ditambahkan"
}

Error Response (409):
{
  "success": false,
  "error": "Email sudah terdaftar",
  "statusCode": 409
}
```

#### 5.6 Get All Employees
```
GET /api/users
Authorization: Bearer <token>
Query Parameters:
  - role: "cashier|admin" (optional)
  - outlet_id: "uuid" (optional, filter by outlet)
  - status: "active|inactive" (optional)

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Karyawan 1",
      "email": "karyawan1@email.com",
      "role": "cashier",
      "phone": "+62812345678",
      "status": "active",
      "outlet_ids": ["uuid1"],
      "created_at": "2025-12-21T10:00:00Z"
    }
  ]
}
```

#### 5.7 Update Employee
```
PUT /api/users/{user_id}
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "Karyawan Updated",
  "email": "karyawan.updated@email.com",
  "password": "newpassword123",
  "phone": "+62812345678",
  "role": "cashier|admin",
  "status": "active|inactive",
  "outlet_ids": ["uuid1", "uuid2"]
}

Success Response (200):
{
  "success": true,
  "data": { ... },
  "message": "Karyawan berhasil diperbarui"
}
```

#### 5.8 Delete Employee
```
DELETE /api/users/{user_id}
Authorization: Bearer <token>

Success Response (200):
{
  "success": true,
  "message": "Karyawan berhasil dihapus"
}
```

---

## Dashboard Admin Specifications

### 1. Tab: Pilih Outlet

#### 1.1 Get Outlets for Admin
```
GET /api/admin/outlets
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Outlet Pusat",
      "address": "Jl. Madura No. 1",
      "city": "Surabaya",
      "status": "active"
    }
  ]
}
```

#### 1.2 Get Products by Outlet (when outlet selected)
```
GET /api/products
Authorization: Bearer <token>
Query Parameters:
  - outlet_id: "uuid" (required when admin selects outlet)
  - status: "active"

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Beras Premium",
      "category": "Kebutuhan Dapur",
      "price": 10000,
      "stock": 50,
      "cost_price": 8000,
      "image": "url",
      "status": "active"
    }
  ]
}
```

#### 1.3 Get Employees by Outlet (when Karyawan tab clicked)
```
GET /api/users
Authorization: Bearer <token>
Query Parameters:
  - outlet_id: "uuid" (required)
  - role: "admin|cashier" (optional)

Response (200):
{
  "success": true,
  "data": {
    "admins": [
      {
        "id": "uuid",
        "name": "Admin 1",
        "email": "admin1@email.com",
        "phone": "+62812345678",
        "role": "admin",
        "status": "active"
      }
    ],
    "cashiers": [
      {
        "id": "uuid2",
        "name": "Kasir 1",
        "email": "kasir1@email.com",
        "phone": "+62812345678",
        "role": "cashier",
        "status": "active"
      },
      {
        "id": "uuid3",
        "name": "Kasir 2",
        "email": "kasir2@email.com",
        "phone": "+62812345678",
        "role": "cashier",
        "status": "active"
      }
    ]
  }
}
```

---

### 2. Tab: Produk

#### 2.1 Create Product
```
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "Produk Baru",
  "description": "Deskripsi produk",
  "category": "Kebutuhan Dapur",
  "price": 10000,
  "cost_price": 8000,
  "stock": 100,
  "min_stock": 10,
  "sku": "SKU123",
  "barcode": "8991234567890",
  "image": "https://example.com/image.jpg",
  "status": "active",
  "outlet_ids": ["uuid1", "uuid2"] // Multiple outlets
}

Success Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Produk Baru",
    "category": "Kebutuhan Dapur",
    "price": 10000,
    "cost_price": 8000,
    "stock": 100,
    "min_stock": 10,
    "image": "https://example.com/image.jpg",
    "outlet_ids": ["uuid1", "uuid2"],
    "status": "active",
    "created_at": "2025-12-21T10:00:00Z"
  },
  "message": "Produk berhasil ditambahkan"
}
```

#### 2.2 Update Product
```
PUT /api/products/{product_id}
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "Produk Updated",
  "category": "Kebutuhan Dapur",
  "price": 11000,
  "stock": 95,
  "status": "active"
}

Success Response (200):
{
  "success": true,
  "data": { ... },
  "message": "Produk berhasil diperbarui"
}
```

#### 2.3 Delete Product
```
DELETE /api/products/{product_id}
Authorization: Bearer <token>

Success Response (200):
{
  "success": true,
  "message": "Produk berhasil dihapus"
}
```

---

## Dashboard Kasir Specifications

### 1. Tab: Home (Ringkasan Report)

#### 1.1 Get Cashier Dashboard Summary
```
GET /api/dashboard/cashier/summary
Authorization: Bearer <token>
Query Parameters:
  - outlet_id: "uuid" (from cashier's outlet assignment)
  - date: "2025-12-21" (optional, default: today)

Response (200):
{
  "success": true,
  "data": {
    "today_sales": 2500000,
    "today_transactions": 20,
    "today_items_sold": 150,
    "average_per_transaction": 125000,
    "payment_breakdown": {
      "tunai": {
        "count": 12,
        "total": 1500000
      },
      "transfer": {
        "count": 5,
        "total": 700000
      },
      "e-wallet": {
        "count": 3,
        "total": 300000
      }
    }
  }
}
```

---

### 2. Tab: Menu (Produk)

#### 2.1 Get Products for Cashier
```
GET /api/products
Authorization: Bearer <token>
Query Parameters:
  - outlet_id: "uuid" (from cashier's assigned outlet)
  - status: "active"
  - search: "string" (optional)

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Beras Premium 5kg",
      "category": "Kebutuhan Dapur",
      "price": 10000,
      "stock": 50,
      "image": "url"
    }
  ]
}
```

---

### 3. Tab: Order (Transaksi)

#### 3.1 Create Transaction
```
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "outlet_id": "uuid",
  "cashier_id": "uuid", // From current user
  "payment_method": "tunai|transfer|e-wallet",
  "items": [
    {
      "product_id": "uuid",
      "product_name": "Beras Premium",
      "quantity": 2,
      "price": 10000,
      "subtotal": 20000
    },
    {
      "product_id": "uuid2",
      "product_name": "Minyak Goreng",
      "quantity": 1,
      "price": 8000,
      "subtotal": 8000
    }
  ],
  "subtotal": 28000,
  "discount_amount": 0,
  "discount_percent": 0,
  "tax": 0,
  "total": 28000,
  "notes": "Pembeli tetap",
  "receipt_number": "RCP-20251221-001"
}

Success Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "outlet_id": "uuid",
    "cashier_id": "uuid",
    "payment_method": "tunai",
    "subtotal": 28000,
    "discount_amount": 0,
    "tax": 0,
    "total": 28000,
    "receipt_number": "RCP-20251221-001",
    "status": "completed",
    "items": [
      {
        "product_id": "uuid",
        "product_name": "Beras Premium",
        "quantity": 2,
        "price": 10000,
        "subtotal": 20000
      }
    ],
    "created_at": "2025-12-21T14:30:00Z"
  },
  "message": "Transaksi berhasil dibuat"
}

IMPORTANT: Backend harus:
1. Kurangi stock produk secara otomatis
2. Update total sales di outlet
3. Generate unique receipt number
4. Set status = "completed" secara default
```

---

### 4. Tab: History (Riwayat Transaksi)

#### 4.1 Get Transaction History (Last 7 Days)
```
GET /api/transactions
Authorization: Bearer <token>
Query Parameters:
  - outlet_id: "uuid" (from cashier's assigned outlet)
  - cashier_id: "uuid" (from current user)
  - days: 7 (default: last 7 days)
  - page: 1 (optional)
  - limit: 20 (optional)

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "receipt_number": "RCP-20251221-001",
      "payment_method": "tunai",
      "total": 28000,
      "status": "completed",
      "created_at": "2025-12-21T14:30:00Z"
    },
    {
      "id": "uuid2",
      "receipt_number": "RCP-20251220-005",
      "payment_method": "transfer",
      "total": 52000,
      "status": "completed",
      "created_at": "2025-12-20T15:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145
  }
}
```

#### 4.2 Get Transaction Detail & Receipt
```
GET /api/transactions/{transaction_id}
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "receipt_number": "RCP-20251221-001",
    "outlet_id": "uuid",
    "outlet_name": "Outlet Pusat",
    "cashier_id": "uuid",
    "cashier_name": "Kasir 1",
    "payment_method": "tunai",
    "subtotal": 28000,
    "discount_amount": 0,
    "discount_percent": 0,
    "tax": 0,
    "total": 28000,
    "notes": "Pembeli tetap",
    "status": "completed",
    "items": [
      {
        "id": "uuid",
        "product_name": "Beras Premium 5kg",
        "quantity": 2,
        "price": 10000,
        "subtotal": 20000
      },
      {
        "id": "uuid2",
        "product_name": "Minyak Goreng 2L",
        "quantity": 1,
        "price": 8000,
        "subtotal": 8000
      }
    ],
    "created_at": "2025-12-21T14:30:00Z",
    "created_by": "2025-12-21T14:30:00Z"
  }
}
```

---

### 5. Tab: Report (Same as Owner Dashboard)

#### 5.1 Get Sales Report for Cashier
```
GET /api/dashboard/cashier/reports/sales
Authorization: Bearer <token>
Query Parameters:
  - outlet_id: "uuid" (from cashier's assigned outlet)
  - start_date: "2025-12-01"
  - end_date: "2025-12-21"

Response (200):
{
  "success": true,
  "data": {
    "summary": {
      "total_sales": 250000,
      "total_transactions": 25,
      "total_items_sold": 125,
      "average_per_transaction": 10000
    },
    "period_data": [ ... ],
    "payment_methods": { ... },
    "category_performance": [ ... ],
    "top_products": [ ... ]
  }
}
```

---

## Common Endpoints

### User Management (All Roles)

#### Get User by ID
```
GET /api/users/{user_id}
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": { ... }
}
```

#### Update Own Profile
```
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "New Name",
  "phone": "+62812345678",
  "profile_image": "url"
}

Success Response (200):
{
  "success": true,
  "data": { ... },
  "message": "Profil berhasil diperbarui"
}
```

#### Change Password
```
POST /api/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "old_password": "oldpassword123",
  "new_password": "newpassword123",
  "confirm_password": "newpassword123"
}

Success Response (200):
{
  "success": true,
  "message": "Password berhasil diubah"
}

Error Response (400):
{
  "success": false,
  "error": "Password lama salah",
  "statusCode": 400
}
```

---

### Product Stock Management

#### Update Product Stock
```
PUT /api/products/{product_id}/stock
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "quantity": 95, // New stock value
  "action": "set|add|subtract" // set: override, add/subtract: change
}

Success Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "stock": 95
  },
  "message": "Stok berhasil diperbarui"
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "details": {} // Optional, for validation errors
}
```

### HTTP Status Codes
| Status | Description |
|--------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/expired token) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 409 | Conflict (duplicate entry) |
| 500 | Server Error |

### Validation Error Response
```json
{
  "success": false,
  "error": "Validasi gagal",
  "statusCode": 400,
  "details": {
    "name": ["Name is required"],
    "email": ["Invalid email format"],
    "price": ["Price must be a number"]
  }
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* ... */ },
  "message": "Success message (optional)"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* ... */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

## Implementation Notes for Backend Team

### 1. Authentication
- Implement JWT token with 24-hour expiration
- Include refresh token for token renewal
- Validate token on every protected route
- Hash passwords using bcrypt or similar

### 2. Authorization
- Owner: Access to all data
- Admin: Access to assigned outlets only
- Cashier: Access to assigned outlet only

### 3. Database Constraints
- Email harus unique
- Product stock tidak boleh negatif
- Transaction items harus reference product yang valid
- Cashier hanya bisa input transaksi ke outlet yang di-assign

### 4. Stock Management
- Otomatis kurangi stock saat transaksi dibuat
- Validasi stock cukup sebelum transaction complete
- Jangan allow transaction jika stock tidak cukup

### 5. Reporting
- Cache report data untuk performa optimal
- Support date range filtering
- Support outlet filtering
- Calculate metrics secara real-time atau cache

### 6. Audit Trail (Optional but Recommended)
```
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  action VARCHAR(50), -- CREATE, UPDATE, DELETE, LOGIN
  table_name VARCHAR(50),
  record_id UUID,
  changes JSON, -- Before & after values
  created_at TIMESTAMP
)
```

### 7. Session Management
```
- Token expiry: 86400 detik (24 jam)
- Refresh token expiry: 604800 detik (7 hari)
- Invalidate token on logout
- Clear refresh token on logout
```

### 8. Rate Limiting (Recommended)
- Login endpoint: 5 attempts per minute
- API endpoints: 100 requests per minute per user

### 9. Validation Rules

#### User
- Email: Valid email format, must be unique
- Password: Minimum 8 characters
- Name: Required, max 100 characters
- Phone: Valid phone format (optional)

#### Outlet
- Name: Required, max 100 characters
- Address: Required, max 255 characters
- Phone: Valid phone format

#### Product
- Name: Required, max 100 characters
- Category: Must be one of predefined list
- Price: Must be >= cost_price
- Stock: Must be >= 0
- Image: Valid image URL (optional)

#### Transaction
- Payment method: Must be tunai|transfer|e-wallet
- Total: Must be > 0
- Items: Must have at least 1 item
- Product stock validation before create

---

## Database Schema Recommendations

```sql
-- Users Table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  profile_image VARCHAR(255),
  role ENUM('owner', 'admin', 'cashier') NOT NULL,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Outlets Table
CREATE TABLE outlets (
  id VARCHAR(36) PRIMARY KEY,
  owner_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  city VARCHAR(50),
  province VARCHAR(50),
  postal_code VARCHAR(10),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- User Outlet Assignment (for admin & cashier)
CREATE TABLE user_outlet_assignments (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  outlet_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_outlet (user_id, outlet_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE
);

-- Products Table
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  outlet_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  cost_price DECIMAL(10, 2),
  stock INT NOT NULL DEFAULT 0,
  min_stock INT DEFAULT 5,
  sku VARCHAR(50),
  barcode VARCHAR(50),
  image VARCHAR(255),
  status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  INDEX idx_outlet_status (outlet_id, status),
  INDEX idx_category (category)
);

-- Transactions Table
CREATE TABLE transactions (
  id VARCHAR(36) PRIMARY KEY,
  outlet_id VARCHAR(36) NOT NULL,
  cashier_id VARCHAR(36) NOT NULL,
  payment_method ENUM('tunai', 'transfer', 'e-wallet') NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  tax DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  notes TEXT,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('completed', 'pending', 'cancelled', 'refunded') DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id),
  FOREIGN KEY (cashier_id) REFERENCES users(id),
  INDEX idx_outlet_date (outlet_id, created_at),
  INDEX idx_receipt (receipt_number)
);

-- Transaction Items Table
CREATE TABLE transaction_items (
  id VARCHAR(36) PRIMARY KEY,
  transaction_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Sessions/Tokens Table (optional, if storing tokens in DB)
CREATE TABLE sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token VARCHAR(500),
  refresh_token VARCHAR(500),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_expires (user_id, expires_at)
);
```

---

## Frontend Integration Example

### Axios Instance Setup (Frontend)
```typescript
// src/services/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('madura_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try refresh
      const refreshToken = localStorage.getItem('madura_refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            'http://localhost:5000/api/auth/refresh',
            { refreshToken }
          );
          localStorage.setItem('madura_token', data.data.token);
          // Retry original request
          error.config.headers.Authorization = `Bearer ${data.data.token}`;
          return apiClient(error.config);
        } catch (err) {
          // Refresh failed, redirect to login
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## Testing Checklist

### Authentication
- [ ] Login with owner credentials
- [ ] Login with admin credentials  
- [ ] Login with cashier credentials
- [ ] Logout functionality
- [ ] Session expiry after 24 hours
- [ ] Refresh token mechanism

### Owner Dashboard
- [ ] Overview tab loads correctly
- [ ] Inventory tab shows stock info
- [ ] Reports tab with date filtering
- [ ] Products list with pagination
- [ ] Add/edit/delete outlet
- [ ] Add/edit/delete employee

### Admin Dashboard
- [ ] Outlet selection loads products
- [ ] Employee tab shows staff
- [ ] Add/edit/delete products

### Cashier Dashboard
- [ ] Menu shows assigned outlet products
- [ ] Create transaction with payment method
- [ ] Stock updates after transaction
- [ ] History shows last 7 days
- [ ] Receipt generation

---

**Document Version**: 1.0.0  
**Last Updated**: December 21, 2025  
**Status**: Ready for Backend Development
