# 🔌 API Integration Guide

## 📚 Backend Requirements

Project ini expect backend API dengan structure berikut:

## 🔐 Authentication Endpoints

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@test.com",
  "password": "password123"
}

Response 200:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_001",
      "email": "user@test.com",
      "name": "John Doe",
      "role": "admin",
      "outlets": ["outlet_001"]
    }
  }
}

Response 401:
{
  "success": false,
  "message": "Email atau password salah"
}
```

### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@test.com",
  "password": "password123",
  "name": "Jane Doe",
  "role": "cashier"
}

Response 201:
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

### Logout
```
POST /auth/logout
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Logout berhasil"
}
```

## 📦 Products Endpoints

### Get All Products
```
GET /products?outlet_id=outlet_001
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "prod_001",
      "outlet_id": "outlet_001",
      "name": "Beras Premium 5kg",
      "price": 75000,
      "category": "Kebutuhan Dapur",
      "image": "https://...",
      "stock": 25,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z"
    },
    ...
  ]
}
```

### Get Products by Outlet
```
GET /outlets/{outletId}/products
Authorization: Bearer {token}

Same as above
```

### Get Product by ID
```
GET /products/{productId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "id": "prod_001",
    ...
  }
}
```

### Create Product
```
POST /products
Authorization: Bearer {token}
Content-Type: application/json

{
  "outlet_id": "outlet_001",
  "name": "Beras Premium 5kg",
  "price": 75000,
  "category": "Kebutuhan Dapur",
  "image": "https://...",
  "stock": 25
}

Response 201:
{
  "success": true,
  "data": {
    "id": "prod_001",
    ...
  }
}
```

### Update Product
```
PUT /products/{productId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Beras Premium 5kg Updated",
  "price": 80000,
  "stock": 30
}

Response 200:
{
  "success": true,
  "data": { ... }
}
```

### Delete Product
```
DELETE /products/{productId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Product deleted"
}
```

## 🏪 Outlets Endpoints

### Get All Outlets
```
GET /outlets
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "outlet_001",
      "name": "Toko Madura - Sidoarjo",
      "owner": "Fikri",
      "address": "Jl. Madura No. 123",
      "phone": "0812-3456-7890",
      "created_at": "2024-01-01T10:00:00Z"
    },
    ...
  ]
}
```

### Get Outlet by ID
```
GET /outlets/{outletId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": { ... }
}
```

### Create Outlet
```
POST /outlets
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Toko Baru",
  "owner": "Fikri",
  "address": "Jl. Baru No. 999",
  "phone": "0898-7654-3210"
}

Response 201:
{
  "success": true,
  "data": { ... }
}
```

### Update Outlet
```
PUT /outlets/{outletId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Toko Updated",
  "address": "Jl. Updated"
}

Response 200:
{
  "success": true,
  "data": { ... }
}
```

## 💰 Transactions Endpoints

### Get All Transactions
```
GET /transactions?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "trans_001",
      "outlet_id": "outlet_001",
      "cashier_id": "user_004",
      "payment_method": "cash",
      "items": [
        {
          "product_id": "prod_001",
          "product_name": "Beras Premium",
          "quantity": 2,
          "price": 75000,
          "subtotal": 150000
        },
        ...
      ],
      "subtotal": 150000,
      "tax": 0,
      "total": 150000,
      "created_at": "2024-01-15T10:30:00Z"
    },
    ...
  ]
}
```

### Get Transactions by Outlet
```
GET /outlets/{outletId}/transactions?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer {token}

Same format as above
```

### Get Transaction by ID
```
GET /transactions/{transactionId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": { ... }
}
```

### Create Transaction
```
POST /transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "outlet_id": "outlet_001",
  "cashier_id": "user_004",
  "payment_method": "cash",
  "items": [
    {
      "product_id": "prod_001",
      "quantity": 2,
      "price": 75000
    },
    ...
  ],
  "subtotal": 150000,
  "tax": 0,
  "total": 150000
}

Response 201:
{
  "success": true,
  "data": {
    "id": "trans_001",
    ...
  }
}
```

## 👥 Users/Employees Endpoints

### Get All Users
```
GET /users
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "user_001",
      "email": "user@test.com",
      "name": "John Doe",
      "role": "admin",
      "outlets": ["outlet_001"],
      "status": "active",
      "created_at": "2024-01-01T10:00:00Z"
    },
    ...
  ]
}
```

### Create User
```
POST /users
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newuser@test.com",
  "password": "password123",
  "name": "New User",
  "role": "cashier",
  "outlets": ["outlet_001"]
}

Response 201:
{
  "success": true,
  "data": { ... }
}
```

### Update User
```
PUT /users/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "inactive"
}

Response 200:
{
  "success": true,
  "data": { ... }
}
```

### Delete User
```
DELETE /users/{userId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "User deleted"
}
```

## 🔄 Using Services in Components

### Authentication Service
```javascript
import { authService } from '../services/authService';

// Login
const data = await authService.login('email@test.com', 'password');
// data = { user, token }

// Logout
authService.logout();

// Get current user
const user = authService.getCurrentUser();

// Check authenticated
if (authService.isAuthenticated()) {
  // User is logged in
}
```

### Product Service
```javascript
import { productService } from '../services/productService';

// Get all products
const { data: products } = await productService.getAll('outlet_001');

// Get by ID
const product = await productService.getById('prod_001');

// Create
await productService.create({
  name: 'New Product',
  price: 50000,
  outlet_id: 'outlet_001'
});

// Update
await productService.update('prod_001', {
  name: 'Updated Product',
  price: 60000
});

// Delete
await productService.delete('prod_001');
```

### Transaction Service
```javascript
import { transactionService } from '../services/transactionService';

// Get all
const transactions = await transactionService.getAll('outlet_001');

// Get by ID
const transaction = await transactionService.getById('trans_001');

// Create
await transactionService.create({
  outlet_id: 'outlet_001',
  items: [...],
  total: 150000
});
```

## 📊 Error Response Format

Semua error endpoints return:
```javascript
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field_name": "Field error message"
  }
}
```

## 🔗 Integration Checklist

- [ ] Backend API running dan accessible
- [ ] Update `REACT_APP_API_URL` di `.env`
- [ ] Test setiap endpoint dengan Postman/Insomnia
- [ ] Verify token persists & auto-injected ke headers
- [ ] Test error handling untuk setiap status code
- [ ] Test logout & 401 handling
- [ ] Implement UI loading/error states
- [ ] Test dengan real backend

## 🧪 Test Credentials (Default)

```
Owner Account:
Email: fikri@madura.com
Password: fikri123

Admin Account:
Email: admin@outlet1.com
Password: admin123

Cashier Account:
Email: cashier@outlet1.com
Password: cashier123
```

---

**Next Steps:**
1. Verify backend API endpoints match this spec
2. Implement missing endpoints if needed
3. Test each service method
4. Setup database with [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
