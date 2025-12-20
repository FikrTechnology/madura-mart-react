# 📐 Madura Mart - Clean Architecture Guide

## 🎯 Struktur Project (Clean Architecture Pattern)

```
src/
├── api/                 # HTTP Client & Error Handling
│   ├── axiosInstance.js # Axios config dengan interceptors
│   └── handleApiError.js # Error handling reusable
│
├── services/            # Business Logic Layer
│   ├── authService.js   # Auth logic
│   ├── productService.js # Product logic
│   ├── transactionService.js
│   └── outletService.js
│
├── hooks/               # Custom React Hooks
│   ├── useAuth.js       # Auth state management
│   ├── useFetch.js      # Reusable data fetching
│   ├── useForm.js       # Form handling
│   └── index.js
│
├── store/               # Global State Management
│   └── authContext.js   # Auth context
│
├── constants/           # Constant Values
│   └── api.js          # API endpoints & messages
│
├── utils/               # Helper Functions
│   ├── helpers.js       # Utility functions
│   └── pdfGenerator.js  # PDF/Print utilities
│
├── components/          # React Components
│   └── ...existing components
│
├── context/             # Legacy Context (akan di-refactor)
│   └── OutletContext.js
│
├── styles/              # CSS Files
│   └── ...
│
└── App.js              # Main App Component

```

## 🏗️ Architecture Pattern Explanation

### Layer 1: API Layer (`api/`)
- **Tujuan**: Handle HTTP requests dan error responses
- **File**: `axiosInstance.js` - Configured axios instance dengan token management
- **File**: `handleApiError.js` - Parse API errors jadi user-friendly messages
- **Keuntungan**: Centralized, mudah maintenance, easy to change HTTP library

**Contoh Penggunaan:**
```javascript
// axios sudah siap dengan token, interceptors, base URL
import axiosInstance from '../api/axiosInstance';
const response = await axiosInstance.get('/products');
```

### Layer 2: Services Layer (`services/`)
- **Tujuan**: Business logic yang independent dari UI
- **Berisi**: CRUD operations, data transformation
- **Reusable**: Bisa digunakan di berbagai components
- **Easy Testing**: Pure functions, mudah di-test

**Contoh Penggunaan:**
```javascript
import { productService } from '../services/productService';

// Service handle API call + error handling
const products = await productService.getAll();
```

### Layer 3: Hooks Layer (`hooks/`)
- **Tujuan**: React-specific logic (state, side effects)
- **Custom Hooks**: `useAuth`, `useFetch`, `useForm`
- **Reusable**: Digunakan di multiple components
- **Readable**: Lebih clean & maintainable daripada useState everywhere

**Contoh Penggunaan:**
```javascript
// Di dalam component
const { user, login, logout } = useAuth();
const { data, loading, refetch } = useFetch(() => productService.getAll());
```

### Layer 4: Context/Store (`store/`)
- **Tujuan**: Global state management
- **Shared State**: User, auth, outlets
- **Prevents Prop Drilling**: Data tidak perlu pass via props
- **Scalable**: Mudah expand untuk state lain

**Contoh Penggunaan:**
```javascript
// Wrap app dengan provider
<AuthProvider>
  <App />
</AuthProvider>

// Di dalam component
const { user, login } = useAuthContext();
```

### Layer 5: Components (`components/`)
- **Tujuan**: UI Presentation & User Interaction
- **Types**: 
  - **Presentational** - Pure UI, no business logic
  - **Container** - Connect ke store/services
- **Prop-based**: Terima data via props
- **Pure** - Sama input = sama output

## 🔄 Data Flow (Request → Response)

```
Component
    ↓ (calls useAuth, useFetch)
    ↓
Custom Hook (useAuth, useFetch)
    ↓ (calls)
    ↓
Service (authService, productService)
    ↓ (calls)
    ↓
API Client (axiosInstance)
    ↓ (HTTP request)
    ↓
Backend API
    ↓ (response)
    ↓
Error Handler (handleApiError) / Response Parser
    ↓
Service (process data)
    ↓
Hook (update state)
    ↓
Component (re-render with new data)
```

## 💡 Best Practices

### 1. Services - Hanya Business Logic
```javascript
// ✅ GOOD - Pure business logic, reusable
export const productService = {
  getAll: async (outletId) => {
    const response = await axiosInstance.get('/products');
    return response.data;
  }
};

// ❌ BAD - UI logic di service
export const productService = {
  getAll: async (outletId) => {
    const response = await axiosInstance.get('/products');
    alert('Data loaded'); // ❌ UI logic
    return response.data;
  }
};
```

### 2. Hooks - React-Specific Logic
```javascript
// ✅ GOOD - Hook handle state & effects
const useProducts = (outletId) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    productService.getAll(outletId)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [outletId]);
  
  return { products, loading };
};
```

### 3. Components - Hanya UI
```javascript
// ✅ GOOD - Component menerima data via props/hooks
function ProductList({ outletId }) {
  const { products, loading } = useProducts(outletId);
  
  if (loading) return <p>Loading...</p>;
  
  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

// ❌ BAD - Business logic di component
function ProductList() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    // ❌ API call di component
    fetch('/api/products').then(r => setProducts(r));
  }, []);
  
  return <div>{products.map(...)}</div>;
}
```

## 🚀 Adding New Feature - Step by Step

### Example: Tambah Feature "Delete Product"

**Step 1: Tambah Service**
```javascript
// services/productService.js
export const productService = {
  // ... existing methods
  
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};
```

**Step 2: Tambah Hook (optional)**
```javascript
// hooks/useDeleteProduct.js
export const useDeleteProduct = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const deleteProduct = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await productService.delete(id);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return { deleteProduct, loading, error };
};
```

**Step 3: Gunakan di Component**
```javascript
function ProductCard({ product, onDelete }) {
  const { deleteProduct, loading } = useDeleteProduct();
  
  const handleDelete = async () => {
    if (window.confirm('Yakin hapus?')) {
      const success = await deleteProduct(product.id);
      if (success) {
        onDelete(product.id);
      }
    }
  };
  
  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={handleDelete} disabled={loading}>
        {loading ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
}
```

## 🔌 Integration Checklist

- [ ] Update `API_CONFIG.BASE_URL` di `src/constants/api.js`
- [ ] Test setiap service method dengan postman/insomnia
- [ ] Implement error handling untuk setiap API call
- [ ] Add loading states di UI
- [ ] Test refresh token behavior
- [ ] Setup token persistence di localStorage

## 📚 Related Files

- **API Config**: [src/constants/api.js](src/constants/api.js)
- **Setup Guide**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **API Integration**: [API_INTEGRATION.md](API_INTEGRATION.md)
