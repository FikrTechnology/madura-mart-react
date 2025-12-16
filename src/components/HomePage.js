import React, { useState } from 'react';
import '../styles/Home.css';
import Sidebar from './Sidebar';
import ProductCard from './ProductCard';
import Cart from './Cart';

const HomePage = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('home');
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Sample data produk
  const [products] = useState([
    {
      id: 1,
      name: 'Beras Premium 5kg',
      price: 75000,
      category: 'Beras',
      image: 'https://images.unsplash.com/photo-1586857529235-ea4a90b1e595?w=300&h=300&fit=crop'
    },
    {
      id: 2,
      name: 'Minyak Goreng 2L',
      price: 28000,
      category: 'Minyak',
      image: 'https://images.unsplash.com/photo-1587291352341-ccb540eae75f?w=300&h=300&fit=crop'
    },
    {
      id: 3,
      name: 'Gula Putih 1kg',
      price: 12000,
      category: 'Gula',
      image: 'https://images.unsplash.com/photo-1599599810694-b308981df39e?w=300&h=300&fit=crop'
    },
    {
      id: 4,
      name: 'Telur Ayam 1 Kg',
      price: 32000,
      category: 'Telur',
      image: 'https://images.unsplash.com/photo-1582722921519-94d3dba35522?w=300&h=300&fit=crop'
    },
    {
      id: 5,
      name: 'Susu UHT 1L',
      price: 15000,
      category: 'Susu',
      image: 'https://images.unsplash.com/photo-1553531088-89dbbf58d9d1?w=300&h=300&fit=crop'
    },
    {
      id: 6,
      name: 'Tepung Terigu 1kg',
      price: 10000,
      category: 'Tepung',
      image: 'https://images.unsplash.com/photo-1585707372641-92b5e5e36cce?w=300&h=300&fit=crop'
    },
    {
      id: 7,
      name: 'Garam Dapur 500g',
      price: 5000,
      category: 'Garam',
      image: 'https://images.unsplash.com/photo-1599599810771-f2b6b6c9f0f5?w=300&h=300&fit=crop'
    },
    {
      id: 8,
      name: 'Kopi Arabika 500g',
      price: 85000,
      category: 'Kopi',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=300&h=300&fit=crop'
    }
  ]);

  const handleAddToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCartItems(cartItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleMenuChange = (menu) => {
    setActiveMenu(menu);
  };

  const handleLogoutClick = () => {
    onLogout();
  };

  return (
    <div className="home-container">
      {/* Sidebar Navigation */}
      <Sidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Header */}
        <header className="home-header">
          <div className="header-content">
            <h1 className="header-title">
              {activeMenu === 'home' && '🏠 Home'}
              {activeMenu === 'menu' && '📋 Menu'}
              {activeMenu === 'order' && '📦 Order'}
              {activeMenu === 'history' && '📜 History'}
              {activeMenu === 'report' && '📊 Report'}
            </h1>
            <div className="header-right">
              <button
                className="cart-toggle-btn"
                onClick={() => setShowCart(!showCart)}
              >
                🛒 Keranjang ({cartItems.length})
              </button>
              <button className="logout-btn" onClick={handleLogoutClick}>
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="home-content">
          {/* Home Section - Empty Placeholder */}
          {activeMenu === 'home' && (
            <div className="content-section">
              <div className="content-placeholder">
                <h2>Selamat Datang</h2>
                <p>Pilih Menu di sebelah kiri untuk memulai transaksi</p>
              </div>
            </div>
          )}

          {/* Menu Section - Products with Cart */}
          {activeMenu === 'menu' && (
            <div className="menu-content">
              <div className={`products-section ${showCart ? 'cart-visible' : ''}`}>
                <div className="products-header">
                  <h2>Daftar Produk</h2>
                  <p className="products-count">Total: {products.length} produk</p>
                </div>
                
                <div className="products-grid">
                  {products.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </div>

              {/* Cart Sidebar for Menu */}
              {cartItems.length > 0 && (
                <Cart
                  items={cartItems}
                  onRemoveItem={handleRemoveFromCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onClearCart={handleClearCart}
                  onClose={() => setShowCart(false)}
                />
              )}
            </div>
          )}

          {/* Order Section */}
          {activeMenu === 'order' && (
            <div className="content-section">
              <div className="content-placeholder">
                <h2>Order Management</h2>
                <p>Kelola pesanan pelanggan di sini</p>
              </div>
            </div>
          )}

          {/* History Section */}
          {activeMenu === 'history' && (
            <div className="content-section">
              <div className="content-placeholder">
                <h2>Riwayat Transaksi</h2>
                <p>Lihat histori semua transaksi di sini</p>
              </div>
            </div>
          )}

          {/* Report Section */}
          {activeMenu === 'report' && (
            <div className="content-section">
              <div className="content-placeholder">
                <h2>Laporan</h2>
                <p>Lihat laporan penjualan dan statistik di sini</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
