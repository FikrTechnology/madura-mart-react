# Backend API Integration Guide

Panduan lengkap untuk mengintegrasikan backend API ke dalam aplikasi React Madura Mart.

## 📁 Struktur File

```
src/
├── services/
│   └── api.ts          # API Client dan endpoints
├── hooks/
│   └── index.ts        # Custom hooks untuk API calls
├── components/
│   ├── LoginPage.tsx   # Authentication
│   ├── HomePage.tsx    # POS & Transactions
│   ├── AdminDashboard.tsx
│   └── OwnerDashboard.tsx
└── .env               # Environment variables (local)
```

## 🔧 Konfigurasi Environment

### 1. Setup .env file

Buat file `.env` di root project (sama level dengan package.json):

```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

**Untuk Production:**
```bash
REACT_APP_API_URL=https://api.madura-mart.com/api
REACT_APP_ENV=production
```

### 2. Install Dependencies

Pastikan semua dependencies sudah terinstall:

```bash
npm install axios
```

## 📚 API Services

### Available Services

#### **authAPI** - Authentication
```typescript
authAPI.login(email, password)          // Login user
authAPI.register(email, name, password) // Register new user
authAPI.logout()                         // Logout user
authAPI.verify(token)                    // Verify token validity
```

#### **outletAPI** - Outlet Management
```typescript
outletAPI.getAll()                       // Get all outlets
outletAPI.getById(id)                    // Get outlet by ID
outletAPI.create(data)                   // Create new outlet
outletAPI.update(id, data)               // Update outlet
outletAPI.delete(id)                     // Delete outlet
```

#### **userAPI** - User Management
```typescript
userAPI.getAll()                         // Get all users
userAPI.getById(id)                      // Get user by ID
userAPI.create(data)                     // Create new user
userAPI.update(id, data)                 // Update user
userAPI.delete(id)                       // Delete user
userAPI.getByOutlet(outletId)            // Get users by outlet
userAPI.assignToOutlet(userId, outletId) // Assign user to outlet
```

#### **productAPI** - Product Management
```typescript
productAPI.getAll()                      // Get all products
productAPI.getById(id)                   // Get product by ID
productAPI.getByOutlet(outletId)         // Get products by outlet
productAPI.create(data)                  // Create new product
productAPI.update(id, data)              // Update product
productAPI.delete(id)                    // Delete product
productAPI.updateStock(id, quantity)     // Update stock
productAPI.getLowStock(outletId)         // Get low stock products
```

#### **transactionAPI** - Transactions & POS
```typescript
transactionAPI.getAll()                  // Get all transactions
transactionAPI.getById(id)               // Get transaction by ID
transactionAPI.getByOutlet(outletId)     // Get transactions by outlet
transactionAPI.create(data)              // Create transaction (checkout)
transactionAPI.getByReceiptNumber(num)   // Get transaction by receipt
transactionAPI.getSalesReport(outletId, startDate?, endDate?) // Get sales report
```

## 🎣 Custom Hooks

### useAuth - Authentication Management

```typescript
import { useAuth } from '../hooks';

function LoginPage() {
  const { login, logout, user, loading, error, isAuthenticated } = useAuth();

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      // User logged in successfully
    } catch (err) {
      console.error(err);
    }
  };

  return (
    // Your component JSX
  );
}
```

**Hook Properties:**
- `user: User | null` - Current logged-in user
- `token: string | null` - Auth token
- `loading: boolean` - Loading state
- `error: string | null` - Error message
- `isAuthenticated: boolean` - Check if user is logged in

**Hook Methods:**
- `login(email, password)` - Login user
- `register(email, name, password)` - Register user
- `logout()` - Logout user

---

### useOutlet - Outlet Management

```typescript
import { useOutlet } from '../hooks';

function Dashboard() {
  const { outlets, currentOutlet, loading, fetchOutlets, getOutlet } = useOutlet();

  useEffect(() => {
    fetchOutlets();
  }, []);

  return (
    // Display outlets
  );
}
```

**Hook Properties:**
- `outlets: Outlet[]` - List of outlets
- `currentOutlet: Outlet | null` - Currently selected outlet
- `loading: boolean` - Loading state
- `error: string | null` - Error message

**Hook Methods:**
- `fetchOutlets()` - Fetch all outlets
- `getOutlet(id)` - Get specific outlet

---

### useProduct - Product Management

```typescript
import { useProduct } from '../hooks';

function ProductList({ outletId }) {
  const { products, loading, fetchProducts, updateProductStock } = useProduct(outletId);

  useEffect(() => {
    fetchProducts();
  }, [outletId]);

  const handleStockUpdate = async (productId, newQty) => {
    try {
      await updateProductStock(productId, newQty);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    // Display products
  );
}
```

**Hook Properties:**
- `products: Product[]` - List of products
- `loading: boolean` - Loading state
- `error: string | null` - Error message

**Hook Methods:**
- `fetchProducts()` - Fetch products
- `updateProductStock(id, quantity)` - Update stock

---

### useTransaction - POS & Checkout

```typescript
import { useTransaction } from '../hooks';

function Cart({ outletId, userId }) {
  const { 
    cartItems, 
    loading, 
    addToCart, 
    removeFromCart, 
    updateQuantity,
    checkout,
    getTotalPrice 
  } = useTransaction();

  const handleCheckout = async () => {
    try {
      const result = await checkout(
        outletId, 
        userId, 
        'cash'
      );
      console.log('Transaction successful:', result);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {cartItems.map(item => (
        <div key={item.product_id}>
          {item.product_name} - {item.quantity}
        </div>
      ))}
      <button onClick={handleCheckout}>
        Checkout: Rp {getTotalPrice().toLocaleString('id-ID')}
      </button>
    </div>
  );
}
```

**Hook Properties:**
- `cartItems: CartItem[]` - Items in cart
- `loading: boolean` - Loading state
- `error: string | null` - Error message

**Hook Methods:**
- `addToCart(item)` - Add item to cart
- `removeFromCart(productId)` - Remove item from cart
- `updateQuantity(productId, qty)` - Update item quantity
- `clearCart()` - Clear all items
- `checkout(outletId, cashierId, paymentMethod?, discount?, tax?)` - Process checkout
- `getTotalPrice()` - Get total cart price

---

### useUser - User Management

```typescript
import { useUser } from '../hooks';

function UserManagement() {
  const { users, loading, fetchUsers, getUsersByOutlet } = useUser();

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    // Display users
  );
}
```

**Hook Properties:**
- `users: User[]` - List of users
- `loading: boolean` - Loading state
- `error: string | null` - Error message

**Hook Methods:**
- `fetchUsers()` - Fetch all users
- `getUsersByOutlet(outletId)` - Fetch users by outlet

## 🔐 Authentication Flow

### Login Process

```typescript
// LoginPage.tsx
import { useAuth } from '../hooks';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect based on role
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

### Token Management

Token disimpan otomatis di `localStorage` dan dikirim dengan setiap request:

```typescript
// Automatic token handling
// Di src/services/api.ts - sudah included

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

Token akan otomatis dihapus jika token expired (401 response):

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 📊 Example: HomePage Integration

```typescript
import { useTransaction, useProduct, useAuth } from '../hooks';

function HomePage({ currentOutlet }) {
  const { user } = useAuth();
  const { products, fetchProducts } = useProduct(currentOutlet?.id);
  const { cartItems, addToCart, removeFromCart, checkout } = useTransaction();

  useEffect(() => {
    fetchProducts();
  }, [currentOutlet?.id]);

  const handleAddProduct = (product) => {
    addToCart({
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      price: product.price,
    });
  };

  const handleCheckout = async (paymentMethod) => {
    try {
      const result = await checkout(
        currentOutlet.id,
        user.id,
        paymentMethod
      );
      alert(`Transaction successful! Receipt: ${result.receipt_number}`);
    } catch (err) {
      alert(`Checkout failed: ${err.message}`);
    }
  };

  return (
    <div>
      {/* Display products */}
      {products.map(product => (
        <button 
          key={product.id}
          onClick={() => handleAddProduct(product)}
        >
          {product.name} - Rp {product.price}
        </button>
      ))}
      
      {/* Display cart */}
      <div className="cart">
        {cartItems.map(item => (
          <div key={item.product_id}>
            {item.product_name} x {item.quantity}
            <button onClick={() => removeFromCart(item.product_id)}>Remove</button>
          </div>
        ))}
        <button onClick={() => handleCheckout('cash')}>
          Checkout with Cash
        </button>
      </div>
    </div>
  );
}
```

## ⚠️ Error Handling

Semua hooks menyediakan `error` state:

```typescript
const { data, error, loading } = useYourHook();

if (loading) return <p>Loading...</p>;
if (error) return <p style={{ color: 'red' }}>{error}</p>;

return (
  // Your component
);
```

## 🧪 Testing API Connection

Jalankan di browser console untuk test:

```typescript
import { authAPI } from './services/api';

// Test login
authAPI.login('admin@example.com', 'password123')
  .then(res => console.log('Login success:', res))
  .catch(err => console.error('Login error:', err));
```

## 📝 Next Steps

1. ✅ Setup API Client dan Hooks (sudah selesai)
2. ⏳ Integrate LoginPage.tsx dengan useAuth hook
3. ⏳ Integrate HomePage.tsx dengan useTransaction dan useProduct hooks
4. ⏳ Integrate AdminDashboard.tsx dengan useUser dan useProduct hooks
5. ⏳ Integrate OwnerDashboard.tsx dengan useOutlet hook
6. ⏳ Test semua API endpoints
7. ⏳ Handle errors dan loading states
8. ⏳ Deploy ke production dengan REACT_APP_API_URL yang sesuai

## 🆘 Troubleshooting

### CORS Error
- Pastikan backend sudah konfigurasi CORS dengan benar
- Verify REACT_APP_API_URL sudah benar

### Token Expired
- Token akan otomatis dihapus
- User akan di-redirect ke login page

### API Not Responding
- Check apakah backend running di port 5000
- Verify REACT_APP_API_URL di .env file
- Check browser console untuk error details

---

**Untuk pertanyaan lebih lanjut, lihat dokumentasi backend di madura-mart-backend/**
