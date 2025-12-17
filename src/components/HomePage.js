import React, { useState } from 'react';
import '../styles/Home.css';
import Sidebar from './Sidebar';
import ProductCard from './ProductCard';
import Cart from './Cart';

const HomePage = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('home');
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sortBy, setSortBy] = useState('name');
  
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [showQRIS, setShowQRIS] = useState(false);
  const [transactions, setTransactions] = useState([]);

  // Kategori yang tersedia
  const categories = [
    'Semua',
    'Kebutuhan Dapur',
    'Kebutuhan Rumah',
    'Makanan',
    'Minuman',
    'Rokok',
    'Lain-lain'
  ];

  // Sample data produk
  const [products] = useState([
    {
      id: 1,
      name: 'Beras Premium 5kg',
      price: 75000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1586857529235-ea4a90b1e595?w=300&h=300&fit=crop'
    },
    {
      id: 2,
      name: 'Minyak Goreng 2L',
      price: 28000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1587291352341-ccb540eae75f?w=300&h=300&fit=crop'
    },
    {
      id: 3,
      name: 'Gula Putih 1kg',
      price: 12000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1599599810694-b308981df39e?w=300&h=300&fit=crop'
    },
    {
      id: 4,
      name: 'Telur Ayam 1 Kg',
      price: 32000,
      category: 'Makanan',
      image: 'https://images.unsplash.com/photo-1582722921519-94d3dba35522?w=300&h=300&fit=crop'
    },
    {
      id: 5,
      name: 'Susu UHT 1L',
      price: 15000,
      category: 'Minuman',
      image: 'https://images.unsplash.com/photo-1553531088-89dbbf58d9d1?w=300&h=300&fit=crop'
    },
    {
      id: 6,
      name: 'Tepung Terigu 1kg',
      price: 10000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1585707372641-92b5e5e36cce?w=300&h=300&fit=crop'
    },
    {
      id: 7,
      name: 'Garam Dapur 500g',
      price: 5000,
      category: 'Kebutuhan Dapur',
      image: 'https://images.unsplash.com/photo-1599599810771-f2b6b6c9f0f5?w=300&h=300&fit=crop'
    },
    {
      id: 8,
      name: 'Kopi Arabika 500g',
      price: 85000,
      category: 'Minuman',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=300&h=300&fit=crop'
    }
  ]);

  // Filter dan sort produk
  const getFilteredProducts = () => {
    let filtered = products;

    // Filter berdasarkan kategori
    if (selectedCategory !== 'Semua') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter berdasarkan search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  };

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

  const handlePlaceOrder = () => {
    if (cartItems.length > 0) {
      setActiveMenu('order');
      setPaymentMethod('cash');
      setAmountPaid('');
      setShowQRIS(false);
    }
  };

  const handlePaymentComplete = () => {
    const total = Math.round(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.1);
    const newTransaction = {
      id: Date.now(),
      items: cartItems,
      total: total,
      paymentMethod: paymentMethod,
      amountPaid: amountPaid || total,
      change: amountPaid ? amountPaid - total : 0,
      date: new Date().toLocaleString('id-ID')
    };
    
    setTransactions([...transactions, newTransaction]);
    setCartItems([]);
    setActiveMenu('history');
    setShowQRIS(false);
  };

  return (
    <div className="home-container">
      {/* Sidebar Navigation */}
      <Sidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} onLogout={handleLogoutClick} />

      {/* Main Content */}
      <div className="main-wrapper">
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
              <div className="products-section">
                <div className="products-header">
                  <h2>Daftar Produk</h2>
                  <p className="products-count">Total: {getFilteredProducts().length} produk</p>
                </div>

                {/* Search Bar dan Sort */}
                <div className="search-filter-bar">
                  <div className="search-wrapper">
                    <input
                      type="text"
                      className="search-input"
                      placeholder="🔍 Cari produk..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">↑↓ Nama</option>
                    <option value="price-low">💰 Harga Terendah</option>
                    <option value="price-high">💰 Harga Tertinggi</option>
                  </select>
                </div>

                {/* Category Tabs */}
                <div className="category-tabs">
                  {categories.map(category => (
                    <button
                      key={category}
                      className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                <div className="products-grid">
                  {getFilteredProducts().map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onUpdateQuantity={handleUpdateQuantity}
                      cartItems={cartItems}
                    />
                  ))}
                </div>
              </div>

              {/* Cart Sidebar for Menu - Always Visible */}
              <Cart
                items={cartItems}
                onRemoveItem={handleRemoveFromCart}
                onUpdateQuantity={handleUpdateQuantity}
                onClearCart={handleClearCart}
                onPlaceOrder={handlePlaceOrder}
              />
            </div>
          )}

          {/* Order Section */}
          {activeMenu === 'order' && (
            <div className="order-section">
              <div className="order-container">
                <h2>Konfirmasi Pesanan</h2>
                {cartItems.length > 0 ? (
                  <div className="order-content">
                    <div className="order-items">
                      <h3>Daftar Barang:</h3>
                      {cartItems.map(item => (
                        <div key={item.id} className="order-item">
                          <div className="order-item-image">
                            <img src={item.image} alt={item.name} />
                          </div>
                          <div className="order-item-info">
                            <h4>{item.name}</h4>
                            <p className="order-item-price">Rp {item.price.toLocaleString('id-ID')}</p>
                            <p className="order-item-qty">Qty: {item.quantity}</p>
                          </div>
                          <div className="order-item-total">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="payment-section">
                      <div className="payment-summary">
                        <div className="summary-row">
                          <span>Subtotal:</span>
                          <span>Rp {cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="summary-row">
                          <span>Pajak (10%):</span>
                          <span>Rp {Math.round(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.1).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="summary-row total">
                          <span>Total:</span>
                          <span>Rp {Math.round(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.1).toLocaleString('id-ID')}</span>
                        </div>
                      </div>

                      <div className="payment-method">
                        <label>Metode Pembayaran:</label>
                        <select 
                          value={paymentMethod}
                          onChange={(e) => {
                            setPaymentMethod(e.target.value);
                            setAmountPaid('');
                            setShowQRIS(false);
                          }}
                        >
                          <option value="cash">Tunai</option>
                          <option value="transfer">Transfer Bank</option>
                          <option value="ewallet">E-Wallet</option>
                        </select>
                      </div>

                      {/* Pembayaran Tunai */}
                      {paymentMethod === 'cash' && (
                        <div className="payment-cash">
                          <h4>Pilih Nominal atau Isi Manual</h4>
                          <div className="nominal-buttons">
                            <button className="nominal-btn" onClick={() => setAmountPaid(5000)}>Rp 5.000</button>
                            <button className="nominal-btn" onClick={() => setAmountPaid(10000)}>Rp 10.000</button>
                            <button className="nominal-btn" onClick={() => setAmountPaid(20000)}>Rp 20.000</button>
                            <button className="nominal-btn" onClick={() => setAmountPaid(50000)}>Rp 50.000</button>
                            <button className="nominal-btn" onClick={() => setAmountPaid(100000)}>Rp 100.000</button>
                          </div>
                          <div className="manual-input-cash">
                            <label>Atau isi manual:</label>
                            <input
                              type="number"
                              value={amountPaid}
                              onChange={(e) => setAmountPaid(parseInt(e.target.value) || '')}
                              placeholder="Masukkan nominal..."
                            />
                          </div>
                          {amountPaid && (
                            <div className="cash-calculation">
                              <div className="calc-row">
                                <span>Total:</span>
                                <span>Rp {Math.round(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.1).toLocaleString('id-ID')}</span>
                              </div>
                              <div className="calc-row">
                                <span>Uang Masuk:</span>
                                <span>Rp {parseInt(amountPaid).toLocaleString('id-ID')}</span>
                              </div>
                              <div className={`calc-row total ${amountPaid >= Math.round(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.1) ? 'valid' : 'invalid'}`}>
                                <span>Kembalian:</span>
                                <span>Rp {Math.max(0, parseInt(amountPaid) - Math.round(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.1)).toLocaleString('id-ID')}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pembayaran Transfer */}
                      {paymentMethod === 'transfer' && (
                        <div className="payment-transfer">
                          <h4>Rekening Transfer</h4>
                          <div className="bank-card">
                            <div className="bank-header">
                              <img src="https://images.unsplash.com/photo-1633356122544-f134ef2944f0?w=100&h=100&fit=crop" alt="Bank" className="bank-logo" />
                              <div className="bank-info">
                                <h5>Bank BCA</h5>
                                <p>PT Madura Mart</p>
                              </div>
                            </div>
                            <div className="bank-details">
                              <div className="detail-row">
                                <span>No. Rekening:</span>
                                <span className="account-number">1234567890</span>
                              </div>
                              <div className="detail-row">
                                <span>Atas Nama:</span>
                                <span>Madura Mart Store</span>
                              </div>
                              <div className="detail-row amount">
                                <span>Jumlah Transfer:</span>
                                <span>Rp {Math.round(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.1).toLocaleString('id-ID')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pembayaran E-Wallet */}
                      {paymentMethod === 'ewallet' && (
                        <div className="payment-ewallet">
                          {!showQRIS ? (
                            <div>
                              <p className="qris-info">Klik tombol dibawah untuk menampilkan QRIS</p>
                            </div>
                          ) : (
                            <div className="qris-container">
                              <h4>Scan QRIS</h4>
                              <img 
                                src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=250&h=250&fit=crop" 
                                alt="QRIS Code" 
                                className="qris-code" 
                              />
                              <p className="qris-amount">Rp {Math.round(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.1).toLocaleString('id-ID')}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="payment-actions">
                        <button className="btn-back" onClick={() => setActiveMenu('menu')}>Kembali ke Menu</button>
                        {paymentMethod === 'cash' && amountPaid && parseInt(amountPaid) >= Math.round(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.1) && (
                          <button className="btn-pay" onClick={handlePaymentComplete}>Selesai Pembayaran</button>
                        )}
                        {paymentMethod === 'cash' && (!amountPaid || parseInt(amountPaid) < Math.round(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.1)) && (
                          <button className="btn-pay disabled">Lanjut Pembayaran</button>
                        )}
                        {paymentMethod === 'transfer' && (
                          <button className="btn-pay" onClick={handlePaymentComplete}>Selesai Pembayaran</button>
                        )}
                        {paymentMethod === 'ewallet' && !showQRIS && (
                          <button className="btn-pay" onClick={() => setShowQRIS(true)}>Lanjut Pembayaran</button>
                        )}
                        {paymentMethod === 'ewallet' && showQRIS && (
                          <button className="btn-pay" onClick={handlePaymentComplete}>Selesai Pembayaran</button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-order">
                    <p>Keranjang kosong. Silakan tambahkan produk terlebih dahulu.</p>
                    <button className="btn-back" onClick={() => setActiveMenu('menu')}>Kembali ke Menu</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History Section */}
          {activeMenu === 'history' && (
            <div className="content-section">
              <div className="history-container">
                <h2>Riwayat Transaksi</h2>
                {transactions.length === 0 ? (
                  <div className="empty-history">
                    <p>Belum ada transaksi</p>
                  </div>
                ) : (
                  <div className="transactions-list">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="transaction-card">
                        <div className="transaction-header">
                          <div className="transaction-date">
                            <span className="date-label">Tanggal:</span>
                            <span className="date-value">{transaction.date}</span>
                          </div>
                          <div className="transaction-method">
                            <span className={`method-badge ${transaction.paymentMethod}`}>
                              {transaction.paymentMethod === 'cash' ? '💵 Tunai' : transaction.paymentMethod === 'transfer' ? '🏦 Transfer' : '📱 E-Wallet'}
                            </span>
                          </div>
                        </div>

                        <div className="transaction-items">
                          <h4>Produk:</h4>
                          {transaction.items.map(item => (
                            <div key={item.id} className="receipt-item">
                              <span className="item-name">{item.name}</span>
                              <span className="item-qty">x{item.quantity}</span>
                              <span className="item-price">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                            </div>
                          ))}
                        </div>

                        <div className="transaction-summary">
                          <div className="summary-line">
                            <span>Total:</span>
                            <span>Rp {transaction.total.toLocaleString('id-ID')}</span>
                          </div>
                          {transaction.change > 0 && (
                            <div className="summary-line">
                              <span>Kembalian:</span>
                              <span>Rp {transaction.change.toLocaleString('id-ID')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
