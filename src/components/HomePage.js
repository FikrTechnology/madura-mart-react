import React, { useState, useEffect } from 'react';
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
  
  // History page states
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyFilterMethod, setHistoryFilterMethod] = useState('all');
  const [historySortBy, setHistorySortBy] = useState('newest');
  
  // Home & Report states
  const [reportTimePeriod, setReportTimePeriod] = useState('all');
  
  // Dynamic time states
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

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

  // useEffect untuk update waktu setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  // Filter dan sort untuk history
  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    // Filter berdasarkan search query
    if (historySearchQuery.trim()) {
      filtered = filtered.filter(transaction =>
        transaction.items.some(item =>
          item.name.toLowerCase().includes(historySearchQuery.toLowerCase())
        ) || transaction.id.toString().includes(historySearchQuery)
      );
    }

    // Filter berdasarkan metode pembayaran
    if (historyFilterMethod !== 'all') {
      filtered = filtered.filter(t => t.paymentMethod === historyFilterMethod);
    }

    // Sort berdasarkan tanggal menggunakan timestamp untuk akurasi
    if (historySortBy === 'newest') {
      filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } else if (historySortBy === 'oldest') {
      filtered.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
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
      date: new Date().toLocaleString('id-ID'),
      timestamp: Date.now()
    };
    
    setTransactions([...transactions, newTransaction]);
    setCartItems([]);
    setActiveMenu('history');
    setShowQRIS(false);
  };

  // Fungsi untuk menghitung sales summary
  const calculateSalesStats = () => {
    if (transactions.length === 0) {
      return {
        totalSales: 0,
        totalTransactions: 0,
        totalItems: 0,
        averageTransaction: 0
      };
    }

    const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = transactions.length;
    const totalItems = transactions.reduce((sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    const averageTransaction = Math.round(totalSales / totalTransactions);

    return {
      totalSales,
      totalTransactions,
      totalItems,
      averageTransaction
    };
  };

  // Fungsi untuk mendapatkan top 5 produk terlaris
  const getTopProducts = () => {
    const productSales = {};
    
    transactions.forEach(transaction => {
      transaction.items.forEach(item => {
        if (!productSales[item.id]) {
          productSales[item.id] = {
            id: item.id,
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.id].quantity += item.quantity;
        productSales[item.id].revenue += item.price * item.quantity;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  // Fungsi untuk kategori performa
  const getCategoryPerformance = () => {
    const categoryStats = {};

    products.forEach(product => {
      if (!categoryStats[product.category]) {
        categoryStats[product.category] = {
          category: product.category,
          quantity: 0,
          revenue: 0
        };
      }
    });

    transactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product && categoryStats[product.category]) {
          categoryStats[product.category].quantity += item.quantity;
          categoryStats[product.category].revenue += item.price * item.quantity;
        }
      });
    });

    return Object.values(categoryStats)
      .sort((a, b) => b.revenue - a.revenue)
      .filter(cat => cat.revenue > 0);
  };

  // Fungsi untuk payment method breakdown
  const getPaymentMethodBreakdown = () => {
    const breakdown = {
      cash: { count: 0, total: 0 },
      transfer: { count: 0, total: 0 },
      ewallet: { count: 0, total: 0 }
    };

    transactions.forEach(transaction => {
      const method = transaction.paymentMethod;
      if (breakdown[method]) {
        breakdown[method].count += 1;
        breakdown[method].total += transaction.total;
      }
    });

    return breakdown;
  };

  // Fungsi untuk get recent transactions
  const getRecentTransactions = () => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  // Fungsi untuk get greeting message
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 17) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  // Fungsi untuk format waktu
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fungsi untuk filter transactions berdasarkan time period
  const getFilteredTransactionsByPeriod = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const filtered = transactions.filter(t => {
      const txDate = new Date(t.date);
      const txDateOnly = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
      
      if (reportTimePeriod === 'today') {
        return txDateOnly.getTime() === today.getTime();
      } else if (reportTimePeriod === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return txDateOnly.getTime() >= weekAgo.getTime();
      } else if (reportTimePeriod === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return txDateOnly.getTime() >= monthAgo.getTime();
      }
      return true; // all
    });

    // Sort dari terbaru (descending) menggunakan timestamp
    return filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  };

  // Fungsi untuk get today's sales data
  const getTodayStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStart = today.getTime();
    const todayEnd = todayStart + (24 * 60 * 60 * 1000);
    
    const todayTransactions = transactions.filter(t => {
      const txTimestamp = t.timestamp || 0;
      return txTimestamp >= todayStart && txTimestamp < todayEnd;
    });

    const totalSales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = todayTransactions.length;
    const totalItems = todayTransactions.reduce((sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    const avgTransaction = totalTransactions > 0 ? Math.round(totalSales / totalTransactions) : 0;

    return { totalSales, totalTransactions, totalItems, avgTransaction, todayTransactions };
  };

  // Fungsi untuk get yesterday's sales for comparison
  const getYesterdayStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = yesterday.getTime();
    const yesterdayEnd = yesterdayStart + (24 * 60 * 60 * 1000);
    
    const yesterdayTransactions = transactions.filter(t => {
      const txTimestamp = t.timestamp || 0;
      return txTimestamp >= yesterdayStart && txTimestamp < yesterdayEnd;
    });

    return yesterdayTransactions.reduce((sum, t) => sum + t.total, 0);
  };

  // Fungsi untuk get growth percentage
  const getGrowthPercentage = () => {
    const today = getTodayStats().totalSales;
    const yesterday = getYesterdayStats();
    
    if (yesterday === 0) {
      return today > 0 ? 100 : 0;
    }
    
    return Math.round(((today - yesterday) / yesterday) * 100);
  };

  // Fungsi untuk get best performing hour
  const getBestSellingTime = () => {
    const hourStats = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStart = today.getTime();
    const todayEnd = todayStart + (24 * 60 * 60 * 1000);
    
    transactions.forEach(t => {
      const txTimestamp = t.timestamp || 0;
      if (txTimestamp >= todayStart && txTimestamp < todayEnd) {
        const hour = new Date(txTimestamp).getHours();
        if (!hourStats[hour]) {
          hourStats[hour] = { hour, count: 0, total: 0 };
        }
        hourStats[hour].count += 1;
        hourStats[hour].total += t.total;
      }
    });

    if (Object.keys(hourStats).length === 0) {
      return null;
    }

    const best = Object.values(hourStats).reduce((max, curr) => 
      curr.count > max.count ? curr : max
    );

    return best;
  };

  // Fungsi untuk get daily breakdown (last 7 days)
  const getDailyBreakdown = () => {
    const days = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString('id-ID', { weekday: 'short', month: 'short', day: 'numeric' });
      days[dateKey] = { date, sales: 0, count: 0 };
    }

    // Aggregate transactions menggunakan timestamp
    transactions.forEach(t => {
      const txTimestamp = t.timestamp || 0;
      const txDate = new Date(txTimestamp);
      const txDateOnly = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
      
      for (let i = 6; i >= 0; i--) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        
        if (txDateOnly.getTime() === checkDate.getTime()) {
          const dateKey = checkDate.toLocaleDateString('id-ID', { weekday: 'short', month: 'short', day: 'numeric' });
          days[dateKey].sales += t.total;
          days[dateKey].count += 1;
          break;
        }
      }
    });

    return Object.values(days);
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
            <div className="home-dashboard">
              {/* Welcome Section */}
              <div className="welcome-section">
                <div className="welcome-header">
                  <div className="welcome-text">
                    <h1>{getGreeting()}, Kasir! 👋</h1>
                    <p className="welcome-subtitle">Selamat datang di Madura Mart POS System</p>
                  </div>
                  <div className="welcome-time">
                    <div className="time-display">{currentTime}</div>
                    <div className="date-display">{currentDate}</div>
                  </div>
                </div>
              </div>

              {/* Today's Performance Section */}
              {transactions.length > 0 && (
                <div className="todays-performance">
                  <h3>📊 Performa Hari Ini</h3>
                  <div className="performance-grid">
                    <div className="perf-card sales">
                      <div className="perf-icon">💰</div>
                      <div className="perf-content">
                        <p className="perf-label">Total Penjualan</p>
                        <p className="perf-value">Rp {getTodayStats().totalSales.toLocaleString('id-ID')}</p>
                        <p className={`perf-growth ${getGrowthPercentage() >= 0 ? 'positive' : 'negative'}`}>
                          {getGrowthPercentage() > 0 ? '↑' : getGrowthPercentage() < 0 ? '↓' : '→'} {Math.abs(getGrowthPercentage())}% vs kemarin
                        </p>
                      </div>
                    </div>

                    <div className="perf-card transactions">
                      <div className="perf-icon">📦</div>
                      <div className="perf-content">
                        <p className="perf-label">Transaksi</p>
                        <p className="perf-value">{getTodayStats().totalTransactions}</p>
                        <p className="perf-meta">transaksi</p>
                      </div>
                    </div>

                    <div className="perf-card items">
                      <div className="perf-icon">🛍️</div>
                      <div className="perf-content">
                        <p className="perf-label">Items Terjual</p>
                        <p className="perf-value">{getTodayStats().totalItems}</p>
                        <p className="perf-meta">produk</p>
                      </div>
                    </div>

                    <div className="perf-card average">
                      <div className="perf-icon">📈</div>
                      <div className="perf-content">
                        <p className="perf-label">Rata-rata</p>
                        <p className="perf-value">Rp {getTodayStats().avgTransaction.toLocaleString('id-ID')}</p>
                        <p className="perf-meta">per transaksi</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Best Selling Time */}
              {getBestSellingTime() && (
                <div className="best-time-section">
                  <h3>⏰ Jam Paling Sibuk</h3>
                  <div className="best-time-card">
                    <div className="time-info">
                      <p className="time-label">Waktu Puncak:</p>
                      <p className="time-value">{String(getBestSellingTime().hour).padStart(2, '0')}:00 - {String(getBestSellingTime().hour + 1).padStart(2, '0')}:00</p>
                    </div>
                    <div className="time-stats">
                      <div className="stat">
                        <span className="stat-label">Transaksi:</span>
                        <span className="stat-value">{getBestSellingTime().count}x</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Revenue:</span>
                        <span className="stat-value">Rp {getBestSellingTime().total.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Daily Breakdown (7 days) */}
              {transactions.length > 0 && (
                <div className="daily-breakdown-section">
                  <h3>📅 Performa 7 Hari Terakhir</h3>
                  <div className="daily-breakdown-list">
                    {getDailyBreakdown().map((day, idx) => {
                      const maxSales = Math.max(...getDailyBreakdown().map(d => d.sales), 1);
                      const percentage = (day.sales / maxSales) * 100;
                      return (
                        <div key={idx} className="daily-item">
                          <div className="daily-date">{day.date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                          <div className="daily-chart">
                            <div className="bar-container">
                              <div className="bar" style={{ height: `${Math.max(percentage, 5)}%` }}></div>
                            </div>
                          </div>
                          <div className="daily-stats">
                            <p className="daily-sales">Rp {day.sales.toLocaleString('id-ID')}</p>
                            <p className="daily-count">{day.count} tx</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Action Buttons */}
              <div className="quick-actions">
                <h3>Aksi Cepat</h3>
                <div className="actions-grid">
                  <button 
                    className="action-btn start-transaction"
                    onClick={() => setActiveMenu('menu')}
                  >
                    <span className="btn-icon">🛒</span>
                    <span className="btn-label">Mulai Transaksi</span>
                    <span className="btn-arrow">→</span>
                  </button>
                  <button 
                    className="action-btn view-history"
                    onClick={() => setActiveMenu('history')}
                  >
                    <span className="btn-icon">📜</span>
                    <span className="btn-label">Lihat Riwayat</span>
                    <span className="btn-arrow">→</span>
                  </button>
                  <button 
                    className="action-btn view-report"
                    onClick={() => setActiveMenu('report')}
                  >
                    <span className="btn-icon">📊</span>
                    <span className="btn-label">Laporan Penjualan</span>
                    <span className="btn-arrow">→</span>
                  </button>
                  <button 
                    className="action-btn logout-btn"
                    onClick={handleLogoutClick}
                  >
                    <span className="btn-icon">🚪</span>
                    <span className="btn-label">Keluar</span>
                    <span className="btn-arrow">→</span>
                  </button>
                </div>
              </div>

              {/* Tips & Info */}
              <div className="tips-section">
                <h3>💡 Tips Penggunaan</h3>
                <div className="tips-grid">
                  <div className="tip-card">
                    <div className="tip-number">1</div>
                    <div className="tip-content">
                      <p className="tip-title">Mulai Transaksi</p>
                      <p className="tip-desc">Klik "Mulai Transaksi" atau pilih menu di sidebar untuk membuka daftar produk</p>
                    </div>
                  </div>
                  <div className="tip-card">
                    <div className="tip-number">2</div>
                    <div className="tip-content">
                      <p className="tip-title">Pilih Produk</p>
                      <p className="tip-desc">Cari produk menggunakan search bar, filter kategori, atau urutkan sesuai kebutuhan</p>
                    </div>
                  </div>
                  <div className="tip-card">
                    <div className="tip-number">3</div>
                    <div className="tip-content">
                      <p className="tip-title">Selesaikan Pembayaran</p>
                      <p className="tip-desc">Pilih metode pembayaran (Tunai, Transfer, atau E-Wallet) dan selesaikan transaksi</p>
                    </div>
                  </div>
                  <div className="tip-card">
                    <div className="tip-number">4</div>
                    <div className="tip-content">
                      <p className="tip-title">Lihat Laporan</p>
                      <p className="tip-desc">Pantau performa penjualan di menu Laporan dengan berbagai statistik detail</p>
                    </div>
                  </div>
                </div>
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
            <div className="history-content">
              <div className="history-main">
                <div className="history-header">
                  <h2>Riwayat Transaksi</h2>
                </div>

                {/* Search, Filter, Sort Bar */}
                <div className="history-controls">
                  <div className="history-search">
                    <input
                      type="text"
                      className="history-search-input"
                      placeholder="🔍 Cari receipt..."
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="history-filters">
                    <select
                      className="filter-select"
                      value={historyFilterMethod}
                      onChange={(e) => setHistoryFilterMethod(e.target.value)}
                    >
                      <option value="all">🔗 Semua Metode</option>
                      <option value="cash">💵 Tunai</option>
                      <option value="transfer">🏦 Transfer</option>
                      <option value="ewallet">📱 E-Wallet</option>
                    </select>
                    <select
                      className="sort-select-history"
                      value={historySortBy}
                      onChange={(e) => setHistorySortBy(e.target.value)}
                    >
                      <option value="newest">📅 Terbaru</option>
                      <option value="oldest">📅 Terlama</option>
                    </select>
                  </div>
                </div>

                {/* Transactions List */}
                {transactions.length === 0 ? (
                  <div className="empty-history">
                    <p>Belum ada transaksi</p>
                  </div>
                ) : getFilteredTransactions().length === 0 ? (
                  <div className="empty-history">
                    <p>Tidak ada transaksi yang sesuai dengan filter</p>
                  </div>
                ) : (
                  <div className="transactions-cards-list">
                    {getFilteredTransactions().map((transaction) => (
                      <div
                        key={transaction.id}
                        className={`transaction-list-card ${selectedTransaction?.id === transaction.id ? 'active' : ''}`}
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <div className="card-icon">
                          {transaction.paymentMethod === 'cash' ? '💵' : transaction.paymentMethod === 'transfer' ? '🏦' : '📱'}
                        </div>
                        <div className="card-info">
                          <div className="card-datetime">
                            {transaction.date}
                          </div>
                          <div className="card-outlet">
                            Outlet: Madura Mart
                          </div>
                        </div>
                        <div className="card-method">
                          <span className={`method-badge-small ${transaction.paymentMethod}`}>
                            {transaction.paymentMethod === 'cash' ? 'Tunai' : transaction.paymentMethod === 'transfer' ? 'Transfer' : 'E-Wallet'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Receipt Sidebar */}
              <aside className="receipt-sidebar">
                {selectedTransaction ? (
                  <div className="receipt-detail">
                    <div className="receipt-header">
                      <h3>Receipt #{selectedTransaction.id}</h3>
                      <button
                        className="close-receipt"
                        onClick={() => setSelectedTransaction(null)}
                      >
                        ✕
                      </button>
                    </div>

                    <div className="receipt-content">
                      <div className="receipt-section">
                        <label>Tanggal & Waktu:</label>
                        <p>{selectedTransaction.date}</p>
                      </div>

                      <div className="receipt-section">
                        <label>Metode Pembayaran:</label>
                        <p>
                          {selectedTransaction.paymentMethod === 'cash' ? '💵 Tunai' : selectedTransaction.paymentMethod === 'transfer' ? '🏦 Transfer Bank' : '📱 E-Wallet'}
                        </p>
                      </div>

                      <div className="receipt-section">
                        <label>Produk:</label>
                        <div className="receipt-items">
                          {selectedTransaction.items.map(item => (
                            <div key={item.id} className="receipt-item-detail">
                              <span className="item-name">{item.name}</span>
                              <span className="item-qty">x{item.quantity}</span>
                              <span className="item-total">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="receipt-summary">
                        <div className="summary-item">
                          <span>Subtotal:</span>
                          <span>Rp {Math.round(selectedTransaction.total / 1.1).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="summary-item">
                          <span>Pajak (10%):</span>
                          <span>Rp {Math.round(selectedTransaction.total * 0.1 / 1.1).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="summary-item total">
                          <span>Total:</span>
                          <span>Rp {selectedTransaction.total.toLocaleString('id-ID')}</span>
                        </div>
                        {selectedTransaction.change > 0 && (
                          <div className="summary-item change">
                            <span>Kembalian:</span>
                            <span>Rp {selectedTransaction.change.toLocaleString('id-ID')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="receipt-empty">
                    <p>Pilih transaksi untuk melihat detail receipt</p>
                  </div>
                )}
              </aside>
            </div>
          )}

          {/* Report Section */}
          {activeMenu === 'report' && (
            <div className="report-section">
              <div className="report-container">
                <div className="report-header">
                  <div className="report-header-left">
                    <h2>Laporan Penjualan</h2>
                    <p className="report-subtitle">Ringkasan performa penjualan Anda</p>
                  </div>
                  <div className="report-filters">
                    <select 
                      value={reportTimePeriod}
                      onChange={(e) => setReportTimePeriod(e.target.value)}
                      className="period-select"
                    >
                      <option value="today">Hari Ini</option>
                      <option value="week">7 Hari Terakhir</option>
                      <option value="month">30 Hari Terakhir</option>
                      <option value="all">Semua Waktu</option>
                    </select>
                  </div>
                </div>

                {getFilteredTransactionsByPeriod().length === 0 ? (
                  <div className="empty-report">
                    <h3>Belum ada data transaksi</h3>
                    <p>Mulai melakukan transaksi untuk melihat laporan penjualan</p>
                  </div>
                ) : (
                  <>
                    {/* Sales Summary Cards */}
                    <div className="report-summary-grid">
                      <div className="summary-card">
                        <div className="card-icon">💰</div>
                        <div className="card-content">
                          <p className="card-label">Total Penjualan</p>
                          <p className="card-value">Rp {(() => {
                            const total = getFilteredTransactionsByPeriod().reduce((sum, t) => sum + t.total, 0);
                            return total.toLocaleString('id-ID');
                          })()}</p>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-icon">📦</div>
                        <div className="card-content">
                          <p className="card-label">Total Transaksi</p>
                          <p className="card-value">{getFilteredTransactionsByPeriod().length}</p>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-icon">📊</div>
                        <div className="card-content">
                          <p className="card-label">Total Produk Terjual</p>
                          <p className="card-value">{(() => {
                            const total = getFilteredTransactionsByPeriod().reduce((sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
                            return total + ' items';
                          })()}</p>
                        </div>
                      </div>

                      <div className="summary-card">
                        <div className="card-icon">📈</div>
                        <div className="card-content">
                          <p className="card-label">Rata-rata Transaksi</p>
                          <p className="card-value">Rp {(() => {
                            const filtered = getFilteredTransactionsByPeriod();
                            const total = filtered.reduce((sum, t) => sum + t.total, 0);
                            const avg = filtered.length > 0 ? Math.round(total / filtered.length) : 0;
                            return avg.toLocaleString('id-ID');
                          })()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Analytics */}
                    <div className="report-analytics-grid">
                      {/* Highest Transaction */}
                      <div className="analytics-card">
                        <h4>🎯 Transaksi Tertinggi</h4>
                        <p className="analytics-value">Rp {(() => {
                          const max = Math.max(...getFilteredTransactionsByPeriod().map(t => t.total), 0);
                          return max.toLocaleString('id-ID');
                        })()}</p>
                        <p className="analytics-desc">Nilai transaksi terbesar dalam periode ini</p>
                      </div>

                      {/* Lowest Transaction */}
                      <div className="analytics-card">
                        <h4>📉 Transaksi Terendah</h4>
                        <p className="analytics-value">Rp {(() => {
                          const filtered = getFilteredTransactionsByPeriod();
                          const min = filtered.length > 0 ? Math.min(...filtered.map(t => t.total)) : 0;
                          return min.toLocaleString('id-ID');
                        })()}</p>
                        <p className="analytics-desc">Nilai transaksi terkecil dalam periode ini</p>
                      </div>

                      {/* Most Used Payment */}
                      <div className="analytics-card">
                        <h4>💳 Metode Pembayaran Utama</h4>
                        <p className="analytics-value">{(() => {
                          const filtered = getFilteredTransactionsByPeriod();
                          const breakdown = {cash: 0, transfer: 0, ewallet: 0};
                          filtered.forEach(t => breakdown[t.paymentMethod]++);
                          const max = Math.max(breakdown.cash, breakdown.transfer, breakdown.ewallet);
                          return breakdown.cash === max ? '💵 Tunai' : breakdown.transfer === max ? '🏦 Transfer' : '📱 E-Wallet';
                        })()}</p>
                        <p className="analytics-desc">Metode pembayaran paling sering digunakan</p>
                      </div>

                      {/* Average Items per Transaction */}
                      <div className="analytics-card">
                        <h4>📦 Rata-rata Item/Transaksi</h4>
                        <p className="analytics-value">{(() => {
                          const filtered = getFilteredTransactionsByPeriod();
                          const total = filtered.reduce((sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
                          const avg = filtered.length > 0 ? (total / filtered.length).toFixed(1) : 0;
                          return avg;
                        })()}</p>
                        <p className="analytics-desc">Rata-rata jumlah produk per transaksi</p>
                      </div>
                    </div>

                    {/* Payment Method Breakdown */}
                    <div className="report-grid">
                      <div className="report-card payment-breakdown">
                        <h3>Metode Pembayaran</h3>
                        <div className="payment-stats">
                          {(() => {
                            const filtered = getFilteredTransactionsByPeriod();
                            const breakdown = {cash: {count: 0, total: 0}, transfer: {count: 0, total: 0}, ewallet: {count: 0, total: 0}};
                            filtered.forEach(t => {
                              const method = t.paymentMethod;
                              if (breakdown[method]) {
                                breakdown[method].count += 1;
                                breakdown[method].total += t.total;
                              }
                            });
                            return (
                              <>
                                <div className="payment-row">
                                  <div className="payment-info">
                                    <span className="payment-icon">💵</span>
                                    <div>
                                      <p className="payment-name">Tunai</p>
                                      <p className="payment-count">{breakdown.cash.count} transaksi</p>
                                    </div>
                                  </div>
                                  <p className="payment-amount">Rp {breakdown.cash.total.toLocaleString('id-ID')}</p>
                                </div>

                                <div className="payment-row">
                                  <div className="payment-info">
                                    <span className="payment-icon">🏦</span>
                                    <div>
                                      <p className="payment-name">Transfer</p>
                                      <p className="payment-count">{breakdown.transfer.count} transaksi</p>
                                    </div>
                                  </div>
                                  <p className="payment-amount">Rp {breakdown.transfer.total.toLocaleString('id-ID')}</p>
                                </div>

                                <div className="payment-row">
                                  <div className="payment-info">
                                    <span className="payment-icon">📱</span>
                                    <div>
                                      <p className="payment-name">E-Wallet</p>
                                      <p className="payment-count">{breakdown.ewallet.count} transaksi</p>
                                    </div>
                                  </div>
                                  <p className="payment-amount">Rp {breakdown.ewallet.total.toLocaleString('id-ID')}</p>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Top Products */}
                      <div className="report-card top-products">
                        <h3>Produk Terlaris</h3>
                        <div className="products-table">
                          <div className="table-header">
                            <div className="col-no">No</div>
                            <div className="col-name">Produk</div>
                            <div className="col-qty">Terjual</div>
                            <div className="col-revenue">Revenue</div>
                          </div>
                          {(() => {
                            const filtered = getFilteredTransactionsByPeriod();
                            const productSales = {};
                            filtered.forEach(transaction => {
                              transaction.items.forEach(item => {
                                if (!productSales[item.id]) {
                                  productSales[item.id] = {
                                    id: item.id,
                                    name: item.name,
                                    quantity: 0,
                                    revenue: 0
                                  };
                                }
                                productSales[item.id].quantity += item.quantity;
                                productSales[item.id].revenue += item.price * item.quantity;
                              });
                            });
                            const topProducts = Object.values(productSales)
                              .sort((a, b) => b.quantity - a.quantity)
                              .slice(0, 5);
                            return topProducts.length === 0 ? (
                              <p className="no-data">Belum ada data produk</p>
                            ) : (
                              topProducts.map((product, index) => (
                                <div key={product.id} className="table-row">
                                  <div className="col-no">{index + 1}</div>
                                  <div className="col-name">{product.name}</div>
                                  <div className="col-qty">{product.quantity}</div>
                                  <div className="col-revenue">Rp {product.revenue.toLocaleString('id-ID')}</div>
                                </div>
                              ))
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Category Performance */}
                    <div className="report-card category-performance">
                      <h3>Performa Kategori</h3>
                      <div className="category-stats">
                        {(() => {
                          const filtered = getFilteredTransactionsByPeriod();
                          const categoryStats = {};
                          products.forEach(product => {
                            if (!categoryStats[product.category]) {
                              categoryStats[product.category] = {
                                category: product.category,
                                quantity: 0,
                                revenue: 0
                              };
                            }
                          });
                          filtered.forEach(transaction => {
                            transaction.items.forEach(item => {
                              const product = products.find(p => p.id === item.id);
                              if (product && categoryStats[product.category]) {
                                categoryStats[product.category].quantity += item.quantity;
                                categoryStats[product.category].revenue += item.price * item.quantity;
                              }
                            });
                          });
                          const categoryPerf = Object.values(categoryStats)
                            .sort((a, b) => b.revenue - a.revenue)
                            .filter(cat => cat.revenue > 0);
                          return categoryPerf.length === 0 ? (
                            <p className="no-data">Belum ada data kategori</p>
                          ) : (
                            categoryPerf.map((cat) => {
                              const maxRevenue = Math.max(...categoryPerf.map(c => c.revenue));
                              const percentage = (cat.revenue / maxRevenue) * 100;
                              return (
                                <div key={cat.category} className="category-row">
                                  <div className="category-info">
                                    <p className="category-name">{cat.category}</p>
                                    <p className="category-detail">{cat.quantity} items • Rp {cat.revenue.toLocaleString('id-ID')}</p>
                                  </div>
                                  <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                                  </div>
                                </div>
                              );
                            })
                          );
                        })()}
                      </div>
                    </div>

                    {/* Recent Transactions */}
                    {getFilteredTransactionsByPeriod().length > 0 && (
                      <div className="report-card recent-transactions-report">
                        <h3>Transaksi Terbaru</h3>
                        <div className="recent-list-scroll">
                          <div className="recent-list">
                            {getFilteredTransactionsByPeriod().slice(0, 5).map((transaction, index) => (
                              <div 
                                key={transaction.id} 
                                className="recent-item"
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setActiveMenu('history');
                                }}
                              >
                                <div className="recent-number">{index + 1}</div>
                                <div className="recent-icon">
                                  {transaction.paymentMethod === 'cash' ? '💵' : transaction.paymentMethod === 'transfer' ? '🏦' : '📱'}
                                </div>
                                <div className="recent-info">
                                  <div className="recent-method">
                                    {transaction.paymentMethod === 'cash' ? 'Tunai' : transaction.paymentMethod === 'transfer' ? 'Transfer' : 'E-Wallet'}
                                  </div>
                                  <div className="recent-time">{transaction.date}</div>
                                </div>
                                <div className="recent-amount">
                                  Rp {transaction.total.toLocaleString('id-ID')}
                                </div>
                                <div className="recent-arrow">→</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
