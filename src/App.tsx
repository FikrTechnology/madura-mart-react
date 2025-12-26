import { useState, useEffect, FC } from 'react';
import './App.css';
import { OutletProvider } from './context/OutletContext';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import ProductManagement from './components/ProductManagement';
import OwnerDashboard from './components/OwnerDashboard';
import AdminDashboard from './components/AdminDashboard';
import { User, Outlet, Product, Transaction } from './types';
import { useAuth } from './hooks';

const App: FC = () => {
  // Use useAuth hook untuk manage auth state
  const { user: authUser, loading: authLoading, logout: authLogout } = useAuth();
  
  const [currentUser, setCurrentUser] = useState<Omit<User, 'password'> | null>(
    null
  );
  const [currentOutlet, setCurrentOutlet] = useState<Outlet | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userOutlets, setUserOutlets] = useState<Outlet[]>([]);
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem('madura_transactions');
    return stored ? JSON.parse(stored) : [];
  });

  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      outletId: 'outlet_001',
      name: 'Beras Premium 5kg',
      price: 75000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1586857529235-ea4a90b1e595?w=300&h=300&fit=crop',
      stock: 25,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      outletId: 'outlet_001',
      name: 'Minyak Goreng 2L',
      price: 28000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1587291352341-ccb540eae75f?w=300&h=300&fit=crop',
      stock: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      outletId: 'outlet_001',
      name: 'Gula Putih 1kg',
      price: 12000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1599599810694-b308981df39e?w=300&h=300&fit=crop',
      stock: 5,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      outletId: 'outlet_001',
      name: 'Telur Ayam 1 Kg',
      price: 32000,
      category: 'Makanan',
      image: 'https://images.unsplash.com/photo-1582722921519-94d3dba35522?w=300&h=300&fit=crop',
      stock: 15,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '5',
      outletId: 'outlet_001',
      name: 'Susu UHT 1L',
      price: 15000,
      category: 'Minuman',
      image: 'https://images.unsplash.com/photo-1553531088-89dbbf58d9d1?w=300&h=300&fit=crop',
      stock: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '6',
      outletId: 'outlet_001',
      name: 'Tepung Terigu 1kg',
      price: 10000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1585707372641-92b5e5e36cce?w=300&h=300&fit=crop',
      stock: 32,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '7',
      outletId: 'outlet_001',
      name: 'Garam Dapur 500g',
      price: 5000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1599599810771-f2b6b6c9f0f5?w=300&h=300&fit=crop',
      stock: 50,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '8',
      outletId: 'outlet_001',
      name: 'Kopi Arabika 500g',
      price: 85000,
      category: 'Minuman',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=300&h=300&fit=crop',
      stock: 8,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '9',
      outletId: 'outlet_002',
      name: 'Beras Premium 5kg',
      price: 75000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1586857529235-ea4a90b1e595?w=300&h=300&fit=crop',
      stock: 20,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '10',
      outletId: 'outlet_002',
      name: 'Minyak Goreng 2L',
      price: 28000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1587291352341-ccb540eae75f?w=300&h=300&fit=crop',
      stock: 10,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  /**
   * Sync auth state - ketika authUser berubah
   */
  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
      setUserRole(authUser.role || 'cashier');
    } else {
      setCurrentUser(null);
      setUserRole(null);
      setCurrentOutlet(null);
      setUserOutlets([]);
    }
  }, [authUser]);

  /**
   * Handle logout - clear all user state dan auth
   */
  const handleLogout = (): void => {
    authLogout();
    setCurrentUser(null);
    setCurrentOutlet(null);
    setUserRole(null);
    setUserOutlets([]);
  };

  /**
   * Save products ke localStorage setiap ada perubahan (saat kasir checkout)
   */
  useEffect(() => {
    localStorage.setItem('madura_products', JSON.stringify(products));
  }, [products]);

  /**
   * Refresh products dari backend - called setelah CRUD operations
   * Fetch ALL products from ALL outlets, tidak hanya current outlet
   */
  const refreshProductsFromBackend = async () => {
    try {
      console.log('[App] ====== START REFRESH PRODUCTS ======');
      // Dynamic import untuk avoid circular dependency
      const { productAPI } = await import('./services/api');
      
      // PENTING: Fetch products tanpa filter outlet untuk mendapat semua data
      console.log('[App] Fetching ALL products (no outlet filter), limit: 1000');
      const result = await productAPI.getAll({ limit: 1000 });
      console.log('[App] API Response:', { success: result.success, dataType: typeof result.data, itemCount: Array.isArray(result.data) ? result.data.length : Object.keys(result.data || {}).length });
      
      if (result.success && result.data) {
        console.log('[App] Got response with data');
        let productsArray = Array.isArray(result.data) ? result.data : Object.values(result.data || {});
        console.log('[App] Products count after conversion:', productsArray.length, 'items');
        
        // Normalize products to ensure outlet_id field
        const normalized = productsArray.map((p: any) => {
          return {
            ...p,
            outlet_id: p.outlet_id || p.outletId,
          };
        });
        
        console.log('[App] After normalization:', normalized.length, 'products');
        if (normalized.length > 0) {
          console.log('[App] First product:', normalized[0]);
        }
        
        setProducts(normalized as Product[]);
        localStorage.setItem('madura_products', JSON.stringify(normalized));
        console.log('[App] ✅ Products state updated successfully with', normalized.length, 'items');
        console.log('[App] ====== END REFRESH PRODUCTS (SUCCESS) ======');
        return true;
      } else {
        console.error('[App] API returned success=false:', result.message);
        console.log('[App] ====== END REFRESH PRODUCTS (FAILED) ======');
        return false;
      }
    } catch (error) {
      console.error('[App] ❌ Error refreshing products:', error);
      console.log('[App] ====== END REFRESH PRODUCTS (ERROR) ======');
      return false;
    }
  };

  /**
   * Handle successful login from LoginPage
   */
  const handleLoginSuccess = (
    user: Omit<User, 'password'>,
    outlet: Outlet,
    outlets?: Outlet[]
  ): void => {
    setCurrentUser(user);
    setCurrentOutlet(outlet);
    setUserOutlets(outlets || [outlet]);
    setUserRole(user.role || 'cashier');
  };

  /**
   * Handle outlet switch
   */
  const handleSwitchOutlet = (outletId: string): void => {
    const selectedOutlet = userOutlets.find((o) => o.id === outletId);
    if (selectedOutlet) {
      setCurrentOutlet(selectedOutlet);
    }
  };

  return (
    <OutletProvider>
      <div className="App">
        {/* Loading state - tunggu sampai auth selesai di-restore */}
        {authLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div>Loading...</div>
          </div>
        ) : !currentUser ? (
          /* Belum login - tampilkan login page */
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        ) : userRole === 'owner' ? (
          <OwnerDashboard
            onLogout={handleLogout}
            currentOutlet={currentOutlet}
            products={products}
            transactions={transactions}
            userOutlets={userOutlets}
            onSwitchOutlet={handleSwitchOutlet}
          />
        ) : userRole === 'admin' ? (
          <AdminDashboard
            onLogout={handleLogout}
            currentOutlet={currentOutlet}
            products={products}
            setProducts={setProducts}
            userOutlets={userOutlets}
            onRefreshProducts={refreshProductsFromBackend}
          />
        ) : userRole === 'cashier' ? (
          <HomePage
            onLogout={handleLogout}
            currentOutlet={currentOutlet}
            products={products}
            setProducts={setProducts}
            transactions={transactions}
            setTransactions={setTransactions}
          />
        ) : (
          <ProductManagement
            products={products}
            setProducts={setProducts}
            currentOutlet={currentOutlet}
            onLogout={handleLogout}
            onSwitchOutlet={handleSwitchOutlet}
            userOutlets={userOutlets}
          />
        )}
      </div>
    </OutletProvider>
  );
};

export default App;
