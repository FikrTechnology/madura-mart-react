# Backend Integration Guide

## Overview
Frontend Madura Mart React telah diintegrasikan dengan Backend API menggunakan Postman collection yang disediakan.

## Backend Configuration

### API Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: Update `REACT_APP_API_URL` di environment variable

### Environment Setup
```bash
# .env atau .env.local
REACT_APP_API_URL=http://localhost:5000/api
```

## API Integration Points

### 1. **Authentication** (`src/services/authService.ts` & `src/services/api.ts`)
```
POST   /api/auth/login          - Login dengan email & password
POST   /api/auth/register       - Register user baru
POST   /api/auth/logout         - Logout user
POST   /api/auth/verify         - Verify token validity
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "owner|admin|cashier",
      "status": "active|inactive|suspended",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

**Usage:**
```typescript
import { useAuth } from '../hooks';

const MyComponent = () => {
  const { login, user, loading, error } = useAuth();
  
  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      // Auto redirect handled by App.tsx
    } catch (err) {
      console.error(err);
    }
  };
};
```

### 2. **Outlets Management** (`src/services/api.ts`)
```
GET    /api/outlets              - Get all outlets
GET    /api/outlets/{id}         - Get outlet by ID
POST   /api/outlets              - Create new outlet
PUT    /api/outlets/{id}         - Update outlet
DELETE /api/outlets/{id}         - Delete outlet
```

**Usage:**
```typescript
import { useOutlet } from '../hooks';

const MyComponent = () => {
  const { outlets, fetchOutlets, loading } = useOutlet();
  
  useEffect(() => {
    fetchOutlets();
  }, []);
  
  return (
    <select>
      {outlets.map(outlet => (
        <option key={outlet.id} value={outlet.id}>
          {outlet.name}
        </option>
      ))}
    </select>
  );
};
```

### 3. **Products Management** (`src/services/api.ts`)
```
GET    /api/products              - Get all products
GET    /api/products/{id}         - Get product by ID
GET    /api/products/outlet/{outletId}  - Get products by outlet
POST   /api/products              - Create new product
PUT    /api/products/{id}         - Update product
DELETE /api/products/{id}         - Delete product
PUT    /api/products/{id}/stock   - Update product stock
GET    /api/products/low-stock/{outletId} - Get low stock products
```

**Usage:**
```typescript
import { useProduct } from '../hooks';

const MyComponent = () => {
  const { products, fetchProducts } = useProduct(outletId);
  
  useEffect(() => {
    fetchProducts();
  }, [outletId]);
  
  return products.map(product => (
    <div key={product.id}>{product.name}</div>
  ));
};
```

### 4. **Transactions/Checkout** (`src/services/api.ts`)
```
GET    /api/transactions              - Get all transactions
GET    /api/transactions/{id}         - Get transaction by ID
GET    /api/transactions/outlet/{outletId}  - Get transactions by outlet
POST   /api/transactions              - Create transaction (checkout)
GET    /api/transactions/report/{outletId}  - Get sales report
```

**Create Transaction Request:**
```json
{
  "outlet_id": "outlet_001",
  "cashier_id": "user_004",
  "payment_method": "cash",
  "items": [
    {
      "product_id": "prod_001",
      "quantity": 2,
      "price": 75000
    }
  ],
  "discount_amount": 5000,
  "tax": 0,
  "notes": "Customer purchase"
}
```

**Usage:**
```typescript
import { useTransaction } from '../hooks';

const CheckoutComponent = () => {
  const { createTransaction } = useTransaction();
  
  const handleCheckout = async (items, paymentMethod) => {
    const transactionData = {
      outlet_id: currentOutlet.id,
      cashier_id: currentUser.id,
      payment_method: paymentMethod,
      items: items
    };
    
    const response = await createTransaction(transactionData);
    console.log('Receipt:', response.data.receipt_number);
  };
};
```

### 5. **Users Management** (`src/services/api.ts`)
```
GET    /api/users                 - Get all users
GET    /api/users/{id}            - Get user by ID
GET    /api/users/email/{email}   - Get user by email
GET    /api/users/outlet/{outletId}  - Get users by outlet
POST   /api/users                 - Create new user
PUT    /api/users/{id}            - Update user
DELETE /api/users/{id}            - Delete user
POST   /api/users/{userId}/assign-outlet/{outletId}  - Assign user to outlet
```

## Storage Keys

Frontend menggunakan localStorage untuk menyimpan session:
- `madura_token` - JWT token (dari server)
- `madura_user` - User object (dari server)
- `madura_products` - Cached products
- `madura_transactions` - Cached transactions
- `madura_employees` - Cached employees (untuk demo accounts)
- `madura_outlets` - Cached outlets

## Error Handling

Semua API calls menggunakan centralized error handling:

```typescript
// src/api/handleApiError.ts
export const handleApiError = (error: AxiosError): ApiError => {
  // Handle berbagai jenis error
  // - Network error
  // - 401 Unauthorized (auto logout)
  // - 403 Forbidden
  // - 404 Not Found
  // - 500 Server error
};
```

## Token Management

### Automatic Token Injection
Semua requests otomatis include token di header:
```
Authorization: Bearer <token>
```

### Token Expiration
Ketika token expired (401 response):
1. Token dihapus dari localStorage
2. User dihapus dari localStorage
3. User di-redirect ke login page

## Development Mode Features

Saat running di development mode:
- Tombol "🧹 Clear Session (Dev)" tersedia di login page
- Gunakan untuk membersihkan session dari test sebelumnya
- Berguna saat testing flow login

## Testing dengan Postman

Semua endpoints sudah tersedia di Postman collection:
1. Import `postman_collection.json` ke Postman
2. Set `{{base_url}}` variable ke `http://localhost:5000`
3. Login endpoint akan auto-set `{{auth_token}}` variable
4. Gunakan token tersebut untuk test endpoint lain

### Demo Account Credentials
- **Owner**: fikri@madura.com / fikri123
- **Admin**: admin@outlet1.com / admin123
- **Cashier**: cashier@outlet1.com / cashier123

## Troubleshooting

### Frontend tidak bisa connect ke backend
1. Pastikan backend running di `http://localhost:5000`
2. Check `REACT_APP_API_URL` di environment variable
3. Lihat browser console untuk error message
4. Check CORS settings di backend

### Login gagal
1. Verify email & password benar
2. Check backend response di Postman
3. Verify user sudah terdaftar di backend
4. Check `madura_token` & `madura_user` di localStorage

### Session hilang setelah refresh
1. Check apakah token masih valid di backend
2. Gunakan tombol "Clear Session (Dev)" untuk reset
3. Login ulang dengan credentials yang benar

### Products/Outlets tidak tampil
1. Verify API endpoint di Postman returns data
2. Check network tab untuk API response
3. Verify user role memiliki akses ke resources
4. Check localStorage `madura_outlets` atau `madura_products`

## Architecture Diagram

```
Frontend (React)
    ↓
    ├─ App.tsx (Main router & auth state)
    ├─ services/
    │   ├─ api.ts (API client & endpoints)
    │   ├─ authService.ts (Auth logic)
    │   └─ outletService.ts (Outlet logic)
    ├─ hooks/
    │   ├─ useAuth.ts (Auth hook)
    │   ├─ useOutlet.ts (Outlet hook)
    │   ├─ useProduct.ts (Product hook)
    │   └─ useTransaction.ts (Transaction hook)
    └─ components/
        ├─ LoginPage.tsx (Login form)
        ├─ OwnerDashboard.tsx (Owner view)
        ├─ AdminDashboard.tsx (Admin view)
        ├─ HomePage.tsx (Cashier view)
        └─ ProductManagement.tsx (Product management)
    ↓
Backend API (Node.js/Express)
    ├─ POST /api/auth/login
    ├─ GET /api/outlets
    ├─ GET /api/products
    └─ POST /api/transactions
    ↓
Database (MySQL/PostgreSQL)
```

## Next Steps

1. Verify backend is running dan healthy:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. Test login dengan Postman:
   - Use "Login" endpoint
   - Verify token is returned
   - Copy token ke Postman environment

3. Start frontend:
   ```bash
   npm start
   ```

4. Test login flow di UI:
   - Should redirect ke dashboard based on role
   - Should auto-logout ketika token expired

5. Test CRUD operations:
   - Create/Read/Update/Delete products
   - Create transactions
   - View sales reports

## Support

Jika ada issues:
1. Check console error messages
2. Test endpoints di Postman
3. Verify backend API response format matches expected schema
4. Check network tab untuk API calls

