# API Implementation Mapping - Postman Collection vs Frontend

**Status**: Ready for Backend Connection  
**Date**: December 21, 2025

---

## Summary of Changes

Spesifikasi backend yang telah dibuat telah disesuaikan dengan Postman Collection yang sebenarnya dari backend team. Berikut adalah mapping lengkap endpoint dan perubahan yang perlu dilakukan di frontend.

---

## 1. Authentication Endpoints

### ✅ Already Implemented
```
POST /api/auth/login           - Login user
POST /api/auth/logout          - Logout user
GET /api/auth/me               - Get current user
POST /api/auth/refresh         - Refresh token
```

### Frontend Usage
```typescript
// Login
const result = await authAPI.login(email, password);
// Returns: { user, token, refreshToken, expiresIn }

// Get current user
const user = await authAPI.getCurrentUser();

// Logout
await authAPI.logout();

// Refresh token
const newToken = await authAPI.refreshToken(refreshToken);
```

---

## 2. User Management Endpoints

### Postman Collection Endpoints
```
POST   /api/users                    - Create user/employee
GET    /api/users                    - Get all users (with filters)
GET    /api/users/{user_id}          - Get user by ID
PUT    /api/users/{user_id}          - Update user
DELETE /api/users/{user_id}          - Delete user
POST   /api/users/change-password    - Change password
POST   /api/users/assign-outlet      - Assign user to outlet
```

### Query Parameters (from Postman)
```
GET /api/users?page=1&limit=10&role=admin
GET /api/users?role=cashier&outlet_id=uuid
```

### Frontend Implementation
```typescript
// Get all users with filters
await userAPI.getAll({
  page: 1,
  limit: 10,
  role: 'admin',        // optional
  outlet_id: 'uuid',    // optional
  status: 'active'      // optional
});

// Create user
await userAPI.create({
  name: "Karyawan Baru",
  email: "karyawan@email.com",
  password: "password123",
  phone: "+62812345678",
  role: "cashier|admin",
  status: "active",
  outlet_ids: ["uuid1", "uuid2"]
});

// Update user
await userAPI.update(userId, {
  name: "Updated Name",
  email: "new@email.com",
  role: "admin",
  status: "active",
  outlet_ids: ["uuid1"]
});

// Change password
await userAPI.changePassword({
  oldPassword: "password123",
  newPassword: "newPassword456",
  confirmPassword: "newPassword456"
});

// Assign user to outlet
await userAPI.assignToOutlet(userId, outletId);
```

---

## 3. Outlet Management Endpoints

### Postman Collection Endpoints
```
POST   /api/outlets              - Create outlet
GET    /api/outlets              - Get all outlets
GET    /api/outlets/{outlet_id}  - Get outlet by ID
PUT    /api/outlets/{outlet_id}  - Update outlet
DELETE /api/outlets/{outlet_id}  - Delete outlet
```

### Query Parameters (from Postman)
```
GET /api/outlets?page=1&limit=10&status=active
```

### Frontend Implementation
```typescript
// Get all outlets
await outletAPI.getAll({
  page: 1,
  limit: 10,
  status: 'active'  // optional
});

// Create outlet
await outletAPI.create({
  name: "Outlet Baru",
  address: "Jl. Madura No. 5",
  phone: "+62812345678",
  email: "outlet@email.com",
  city: "Malang",
  province: "Jawa Timur",
  postalCode: "65115"
});

// Update outlet
await outletAPI.update(outletId, {
  name: "Outlet Updated",
  phone: "+62812345678",
  status: "active|inactive"
});

// Delete outlet
await outletAPI.delete(outletId);
```

---

## 4. Product Management Endpoints

### Postman Collection Endpoints
```
POST   /api/products                      - Create product
GET    /api/products                      - Get all products (with filters)
GET    /api/products/{product_id}         - Get product by ID
PUT    /api/products/{product_id}         - Update product
PUT    /api/products/{product_id}/stock   - Update stock
GET    /api/products/alerts/low-stock     - Get low stock products
DELETE /api/products/{product_id}         - Delete product
```

### Query Parameters (from Postman)
```
GET /api/products?page=1&limit=10&outletId=uuid&category=makanan
GET /api/products/alerts/low-stock?outletId=uuid
```

### Frontend Implementation
```typescript
// Get all products
await productAPI.getAll({
  page: 1,
  limit: 10,
  outletId: 'uuid',     // optional
  category: 'makanan',  // optional
  status: 'active',     // optional
  search: 'string'      // optional
});

// Create product
await productAPI.create({
  outletId: "uuid",
  name: "Produk Baru",
  description: "Deskripsi",
  category: "makanan",
  price: 25000,
  costPrice: 10000,
  stock: 100,
  minStock: 10,
  sku: "SKU123",
  barcode: "8991234567890",
  image: "url"
});

// Update product
await productAPI.update(productId, {
  name: "Produk Updated",
  price: 30000,
  stock: 95,
  status: "active"
});

// Update stock
await productAPI.updateStock(productId, {
  quantity: 100,
  type: "set"  // or "add", "subtract"
});

// Get low stock products
await productAPI.getLowStock(outletId);

// Delete product
await productAPI.delete(productId);
```

---

## 5. Transaction Management Endpoints

### Postman Collection Endpoints
```
POST   /api/transactions                  - Create transaction (Checkout)
GET    /api/transactions                  - Get all transactions
GET    /api/transactions/{transaction_id} - Get transaction detail
GET    /api/transactions/{transaction_id}/receipt - Get receipt
GET    /api/transactions/date-range       - Get by date range
PUT    /api/transactions/{transaction_id}/status - Update status
```

### Query Parameters (from Postman)
```
GET /api/transactions?page=1&limit=10&outletId=uuid&status=completed
GET /api/transactions/date-range?outletId=uuid&startDate=2025-12-01&endDate=2025-12-31
```

### Frontend Implementation
```typescript
// Create transaction (Checkout)
await transactionAPI.create({
  outlet_id: "uuid",
  payment_method: "tunai|transfer|e-wallet",
  items: [
    {
      product_id: "uuid",
      quantity: 2,
      price: 25000
    }
  ],
  discount_amount: 0,
  discount_percent: 0,
  tax: 0,
  notes: "Pembeli setia"
});

// Get all transactions
await transactionAPI.getAll({
  page: 1,
  limit: 10,
  outlet_id: 'uuid',    // optional
  status: 'completed',  // optional
  cashier_id: 'uuid'    // optional
});

// Get transaction detail
await transactionAPI.getById(transactionId);

// Get transaction receipt
await transactionAPI.getReceipt(transactionId);

// Get transactions by date range
await transactionAPI.getByDateRange({
  outlet_id: 'uuid',
  start_date: '2025-12-01',
  end_date: '2025-12-31'
});

// Update transaction status
await transactionAPI.updateStatus(transactionId, {
  status: "refunded|cancelled"
});
```

---

## 6. Dashboard Endpoints

### 6.1 Owner Dashboard

#### Postman Collection Endpoints
```
GET /api/dashboard/owner/overview       - Get overview/ringkasan
GET /api/dashboard/owner/inventory      - Get inventory summary
GET /api/dashboard/owner/reports/sales  - Get sales report
GET /api/dashboard/owner/top-products   - Get top products
```

#### Query Parameters (from Postman)
```
GET /api/dashboard/owner/overview?outletId=uuid
GET /api/dashboard/owner/inventory?outletId=uuid
GET /api/dashboard/owner/reports/sales?startDate=2025-12-01&endDate=2025-12-31&outletId=uuid
GET /api/dashboard/owner/top-products?limit=10&period=30days&outletId=uuid
```

#### Frontend Implementation
```typescript
// Get owner overview
await dashboardAPI.owner.getOverview({
  outlet_id: 'all|uuid'  // optional, default: all
});

// Get inventory summary
await dashboardAPI.owner.getInventory({
  outlet_id: 'all|uuid'  // optional
});

// Get sales report
await dashboardAPI.owner.getSalesReport({
  outlet_id: 'all|uuid',
  start_date: '2025-12-01',
  end_date: '2025-12-31'
});

// Get top products
await dashboardAPI.owner.getTopProducts({
  outlet_id: 'all|uuid',
  limit: 10,
  period: '30days'
});
```

### 6.2 Admin Dashboard

#### Postman Collection Endpoints
```
GET /api/dashboard/admin/overview   - Get admin overview
GET /api/dashboard/admin/products   - Get products by outlet
GET /api/dashboard/admin/employees  - Get employees by outlet
```

#### Query Parameters (from Postman)
```
GET /api/dashboard/admin/overview?outletId=uuid
GET /api/dashboard/admin/products?outletId=uuid&page=1&limit=10
GET /api/dashboard/admin/employees?outletId=uuid
```

#### Frontend Implementation
```typescript
// Get admin overview
await dashboardAPI.admin.getOverview(outletId);

// Get products for outlet
await dashboardAPI.admin.getProducts({
  outlet_id: 'uuid',
  page: 1,
  limit: 10
});

// Get employees for outlet
await dashboardAPI.admin.getEmployees(outletId);
```

### 6.3 Cashier Dashboard

#### Postman Collection Endpoints
```
GET /api/dashboard/cashier/daily-summary - Get daily summary
```

#### Query Parameters (from Postman)
```
GET /api/dashboard/cashier/daily-summary?outletId=uuid&date=2025-12-21
```

#### Frontend Implementation
```typescript
// Get cashier daily summary
await dashboardAPI.cashier.getDailySummary({
  outlet_id: 'uuid',
  date: '2025-12-21'  // optional, default: today
});
```

---

## 7. Request/Response Format Examples

### Successful Response (200-201)
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Success message"
}
```

### Error Response (400, 401, 404, 409, 500)
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "totalPages": 8
  }
}
```

---

## 8. Critical Changes from Original Spec to Postman Collection

| Aspect | Original Spec | Postman Collection | Action |
|--------|---------------|-------------------|--------|
| Stock update | `/products/{id}/stock` with body | `/products/{id}/stock` ✓ | No change |
| Low stock endpoint | `/products/alerts/low-stock` ✓ | Same ✓ | No change |
| Assign outlet | `/users/assign-outlet` with body | Same endpoint ✓ | Update to use `assign-outlet` endpoint |
| Payment methods | cash\|card\|transfer | tunai\|transfer\|e-wallet | Update enum |
| Dashboard endpoints | All implemented ✓ | All match ✓ | No change |
| Query parameters | Documented ✓ | Explicit in Postman ✓ | Align exactly |

---

## 9. Implementation Checklist for Frontend

### Authentication
- [x] Login endpoint
- [x] Logout endpoint
- [x] Get current user
- [x] Refresh token
- [ ] Change password integration in frontend

### User Management
- [x] Basic CRUD
- [ ] Query parameters (page, limit, role, outlet_id)
- [ ] Assign user to outlet
- [ ] Change password

### Outlet Management
- [x] Basic CRUD
- [ ] Query parameters (status filter)

### Product Management
- [x] Basic CRUD
- [ ] Query parameters (category, outlet_id, search)
- [x] Stock update
- [x] Low stock query
- [ ] Ensure payment_method enum is correct (tunai, transfer, e-wallet)

### Transaction Management
- [ ] Create transaction (Checkout)
- [ ] Get by date range
- [ ] Update status
- [ ] Get receipt endpoint

### Dashboard
- [ ] Owner overview with filters
- [ ] Owner inventory
- [ ] Owner sales report
- [ ] Owner top products
- [ ] Admin overview
- [ ] Admin products by outlet
- [ ] Admin employees by outlet
- [ ] Cashier daily summary

### Error Handling
- [x] 401 Unauthorized redirect to login
- [ ] 400 Bad Request with validation errors
- [ ] 409 Conflict (duplicate entry)
- [ ] 404 Not Found
- [ ] 500 Server Error

---

## 10. Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_TOKEN_KEY=madura_token
REACT_APP_REFRESH_TOKEN_KEY=madura_refresh_token
REACT_APP_USER_KEY=madura_user
```

---

## 11. Next Steps for Backend Team

Backend team tinggal mengimplementasikan sesuai Postman Collection dengan catatan:

1. ✓ Semua endpoint sudah defined di Postman
2. ✓ Request/Response format sudah jelas
3. ✓ Query parameters sudah specified
4. ✓ Authentication menggunakan JWT Bearer token

Backend hanya perlu:
1. Implement setiap endpoint sesuai method dan path di Postman
2. Validate request sesuai body/query yang diberikan
3. Return response dengan format `{ success, data, message, statusCode }`
4. Handle all HTTP status codes (200, 201, 400, 401, 409, 500)

---

## 12. Frontend Architecture for Backend Integration

```
Frontend (React + TypeScript)
    ↓
/src/services/api.ts (Axios client)
    ↓
apiClient (with interceptors)
    ↓
Endpoints:
    - authAPI
    - userAPI
    - outletAPI
    - productAPI
    - transactionAPI
    - dashboardAPI
    ↓
Backend API (Node.js/Express)
    ↓
Database (MySQL/PostgreSQL)
```

---

## Final Notes

✅ Frontend sudah siap untuk connect dengan backend  
✅ Postman Collection dari backend sudah align dengan frontend spec  
✅ Tinggal backend team implementasikan sesuai collection  
✅ Frontend akan otomatis consume API sesuai endpoints yang ada  

**Status**: READY FOR BACKEND DEVELOPMENT

