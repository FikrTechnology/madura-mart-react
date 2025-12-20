# 🚀 Quick Setup Guide - Madura Mart React

## ⚡ Pre-requisites
- Node.js v14+ 
- npm atau yarn
- Backend API running (atau mock data)

## 📦 Installation

### 1. Install Dependencies
```bash
npm install
```

Jika ada error, bersihkan cache:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 2. Konfigurasi Environment
Buat file `.env` di root project:
```env
# Backend API URL
REACT_APP_API_URL=http://localhost:3001/api

# Atau untuk production/Supabase
# REACT_APP_API_URL=https://your-supabase-url/rest/v1
```

## 🏃 Running Project

### Development Mode
```bash
npm start
```
Aplikasi akan buka di `http://localhost:3000`

### Build untuk Production
```bash
npm run build
```

## 📋 Project Structure Overview

| Folder | Tujuan | Contoh |
|--------|--------|--------|
| `src/api/` | HTTP Client & Error Handling | axiosInstance, handleApiError |
| `src/services/` | Business Logic | authService, productService |
| `src/hooks/` | Custom React Hooks | useAuth, useFetch, useForm |
| `src/store/` | Global State | authContext |
| `src/constants/` | API URLs, Messages | api.js |
| `src/utils/` | Helper Functions | helpers, pdfGenerator |
| `src/components/` | React Components | LoginPage, HomePage, etc |

## 🔑 Key Architecture Files

### 1. API Configuration
📄 `src/constants/api.js` - Semua API endpoints & messages

**Contoh:**
```javascript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout'
  },
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products'
  }
};
```

### 2. API Client
📄 `src/api/axiosInstance.js` - Configured HTTP client

**Features:**
- Auto inject token ke headers
- Auto handle 401 errors
- Retry logic (configurable)

### 3. Services (Business Logic)
📄 `src/services/` - Pure functions, no UI logic

**Contoh:**
```javascript
const products = await productService.getAll();
const product = await productService.getById(1);
await productService.create(newProduct);
```

### 4. Custom Hooks
📄 `src/hooks/` - React-specific logic

**Available:**
- `useAuth()` - Authentication state
- `useFetch()` - Data fetching
- `useForm()` - Form handling

**Contoh:**
```javascript
const { user, login, logout } = useAuth();
const { data, loading, refetch } = useFetch(() => productService.getAll());
```

## 🔌 API Integration Steps

### Step 1: Update API URL
Edit `src/constants/api.js`:
```javascript
export const API_CONFIG = {
  BASE_URL: 'https://your-api.com/api'
};
```

### Step 2: Test Connection
Buka browser console dan test:
```javascript
import axiosInstance from './src/api/axiosInstance';
const response = await axiosInstance.get('/auth/login', {
  email: 'test@test.com',
  password: 'test123'
});
console.log(response.data);
```

### Step 3: Update Service Methods
Sesuaikan service methods dengan API response:
```javascript
// Jika API response format berbeda, adjust di service
export const productService = {
  getAll: async () => {
    const response = await axiosInstance.get('/products');
    // Parse response sesuai format backend
    return response.data.products || response.data;
  }
};
```

## 🔐 Authentication Flow

### Login Process
```
1. User submit login form
2. useForm hook validate input
3. useAuth hook call authService.login()
4. authService kirim POST ke /auth/login
5. Backend return token + user data
6. Token save ke localStorage
7. User redirect ke dashboard
```

### Token Management
- **Save**: `localStorage.setItem('madura_token', token)`
- **Retrieve**: `authService.getToken()`
- **Auto Inject**: Axios interceptor automatically add token ke header
- **Refresh**: Jika 401 error, clear token dan redirect ke login

## 🚨 Error Handling

### API Errors Otomatis Dihandle:
- Network Error → "Koneksi internet error"
- 400 Bad Request → Validation error message
- 401 Unauthorized → Auto redirect ke login
- 500 Server Error → "Server error, coba lagi"

### Handle Error di Component:
```javascript
function MyComponent() {
  const { data, error, loading } = useFetch(() => productService.getAll());
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{color: 'red'}}>{error}</p>;
  
  return <div>{data.map(...)}</div>;
}
```

## 🧪 Testing API Integration

### 1. Login Test
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}'
```

### 2. Get Products Test
```bash
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Browser DevTools
1. Open DevTools → Network tab
2. Filter XHR/Fetch
3. Inspect request/response

## 🌐 Supabase Integration

### 1. Create Supabase Project
- Go to https://supabase.com
- Create new project
- Get API URL & Anon Key

### 2. Update Config
```bash
# .env
REACT_APP_API_URL=https://your-project.supabase.co/rest/v1
REACT_APP_SUPABASE_KEY=your-anon-key
```

### 3. Create Database Tables
See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

## 📱 Common Tasks

### Add New Product
```javascript
const newProduct = {
  name: 'Beras Premium',
  price: 75000,
  outlet_id: 'outlet_001',
  stock: 50
};

await productService.create(newProduct);
```

### Fetch & Display Products
```javascript
function ProductList({ outletId }) {
  const { data: products, loading } = useFetch(
    () => productService.getAll(outletId)
  );
  
  if (loading) return <p>Loading...</p>;
  return products.map(p => <ProductCard key={p.id} product={p} />);
}
```

### Update Product
```javascript
await productService.update(productId, {
  name: 'Updated Name',
  price: 90000
});
```

## 🐛 Troubleshooting

### Error: CORS issue
- Ensure backend set `Access-Control-Allow-Origin` header
- For Supabase, enable CORS di project settings

### Error: 401 Unauthorized
- Check token di localStorage: `localStorage.getItem('madura_token')`
- Ensure token send di `Authorization: Bearer` header
- Check token expiry

### Error: Network Timeout
- Increase timeout di `src/api/axiosInstance.js`: `timeout: 20000`
- Check backend is running

### Data tidak update
- Call `refetch()` setelah create/update/delete
- Check API response format match expected

## 📞 Support & Next Steps

1. Read [ARCHITECTURE.md](ARCHITECTURE.md) untuk understand design pattern
2. Read [API_INTEGRATION.md](API_INTEGRATION.md) untuk detailed API guide
3. Check `src/services/` untuk available service methods
4. Check `src/hooks/` untuk available custom hooks

---

**Happy Coding! 🎉**
