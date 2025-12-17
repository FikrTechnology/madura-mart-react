import { useState } from 'react';
import './App.css';
import { OutletProvider } from './context/OutletContext';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import ProductManagement from './components/ProductManagement';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentOutlet, setCurrentOutlet] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userOutlets, setUserOutlets] = useState([]);
  const [products, setProducts] = useState([
    {
      id: 1,
      outlet_id: 'outlet_001',
      name: 'Beras Premium 5kg',
      price: 75000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1586857529235-ea4a90b1e595?w=300&h=300&fit=crop',
      stock: 25
    },
    {
      id: 2,
      outlet_id: 'outlet_001',
      name: 'Minyak Goreng 2L',
      price: 28000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1587291352341-ccb540eae75f?w=300&h=300&fit=crop',
      stock: 0
    },
    {
      id: 3,
      outlet_id: 'outlet_001',
      name: 'Gula Putih 1kg',
      price: 12000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1599599810694-b308981df39e?w=300&h=300&fit=crop',
      stock: 5
    },
    {
      id: 4,
      outlet_id: 'outlet_001',
      name: 'Telur Ayam 1 Kg',
      price: 32000,
      category: 'Makanan',
      image: 'https://images.unsplash.com/photo-1582722921519-94d3dba35522?w=300&h=300&fit=crop',
      stock: 15
    },
    {
      id: 5,
      outlet_id: 'outlet_001',
      name: 'Susu UHT 1L',
      price: 15000,
      category: 'Minuman',
      image: 'https://images.unsplash.com/photo-1553531088-89dbbf58d9d1?w=300&h=300&fit=crop',
      stock: 0
    },
    {
      id: 6,
      outlet_id: 'outlet_001',
      name: 'Tepung Terigu 1kg',
      price: 10000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1585707372641-92b5e5e36cce?w=300&h=300&fit=crop',
      stock: 32
    },
    {
      id: 7,
      outlet_id: 'outlet_001',
      name: 'Garam Dapur 500g',
      price: 5000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1599599810771-f2b6b6c9f0f5?w=300&h=300&fit=crop',
      stock: 50
    },
    {
      id: 8,
      outlet_id: 'outlet_001',
      name: 'Kopi Arabika 500g',
      price: 85000,
      category: 'Minuman',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=300&h=300&fit=crop',
      stock: 8
    },
    {
      id: 9,
      outlet_id: 'outlet_002',
      name: 'Beras Premium 5kg',
      price: 75000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1586857529235-ea4a90b1e595?w=300&h=300&fit=crop',
      stock: 20
    },
    {
      id: 10,
      outlet_id: 'outlet_002',
      name: 'Minyak Goreng 2L',
      price: 28000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1587291352341-ccb540eae75f?w=300&h=300&fit=crop',
      stock: 10
    }
  ]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentOutlet(null);
    setUserRole(null);
    setUserOutlets([]);
  };

  const handleLoginSuccess = (user, outlet, outlets) => {
    setCurrentUser(user);
    setCurrentOutlet(outlet);
    setUserOutlets(outlets || [outlet]);
    // Determine role based on email
    if (user.email === 'fikri@madura.com') {
      setUserRole('owner');
    } else if (user.email.includes('admin')) {
      setUserRole('admin');
    } else {
      setUserRole('cashier');
    }
    setIsLoggedIn(true);
  };

  const handleSwitchOutlet = (outletId) => {
    const selectedOutlet = userOutlets.find(o => o.id === outletId);
    if (selectedOutlet) {
      setCurrentOutlet(selectedOutlet);
    }
  };

  return (
    <OutletProvider>
      <div className="App">
        {!isLoggedIn ? (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        ) : userRole === 'cashier' ? (
          <HomePage 
            onLogout={handleLogout} 
            currentOutlet={currentOutlet}
            products={products}
            setProducts={setProducts}
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
}

export default App;
