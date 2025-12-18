import React, { useState, useEffect } from 'react';
import '../styles/OwnerDashboard.css';
import AlertModal from './AlertModal';
import { generateSalesPDF } from '../utils/pdfGenerator';

const OwnerDashboard = ({ onLogout, currentOutlet, products, transactions, userOutlets, onSwitchOutlet }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '', actions: [] });
  const [logoutModal, setLogoutModal] = useState(false);
  const [selectedOutletId, setSelectedOutletId] = useState(currentOutlet?.id);
  const [reportPeriod, setReportPeriod] = useState('today');
  const [viewMode, setViewMode] = useState('all'); // 'all' or specific outlet id
  const [reportViewMode, setReportViewMode] = useState('all'); // Separate view mode for reports
  const [selectedManagementOutlet, setSelectedManagementOutlet] = useState(null); // For filtering employees by outlet in management tab
  const [productSortBy, setProductSortBy] = useState('quantity'); // 'quantity' or 'revenue' for sorting sold products
  
  // Employee management states
  const [employees, setEmployees] = useState(() => {
    const stored = localStorage.getItem('madura_employees');
    return stored ? JSON.parse(stored) : [];
  });
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier',
    outlet_ids: [currentOutlet?.id || '']
  });

  // Outlet management states
  const [outlets, setOutlets] = useState(() => {
    const stored = localStorage.getItem('madura_outlets');
    return stored ? JSON.parse(stored) : userOutlets;
  });
  const [showAddOutlet, setShowAddOutlet] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState(null);
  const [newOutlet, setNewOutlet] = useState({
    name: '',
    address: '',
    phone: ''
  });

  // Save employees to localStorage
  useEffect(() => {
    localStorage.setItem('madura_employees', JSON.stringify(employees));
  }, [employees]);

  // Save outlets to localStorage
  useEffect(() => {
    localStorage.setItem('madura_outlets', JSON.stringify(outlets));
  }, [outlets]);

  // Check if active viewMode outlet is deactivated, reset to 'all' if so
  useEffect(() => {
    if (viewMode !== 'all') {
      const selectedOutlet = outlets.find(o => o.id === viewMode);
      if (selectedOutlet && selectedOutlet.status === 'inactive') {
        setViewMode('all');
      }
    }
  }, [outlets, viewMode]);

  // Calculate total sales based on view mode
  const calculateTotalSales = () => {
    const filtered = viewMode === 'all' 
      ? transactions 
      : transactions.filter(t => t.outlet_id === viewMode);
    return filtered.reduce((sum, t) => sum + t.total, 0);
  };

  // Calculate today's sales based on view mode
  const calculateTodaySales = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStart = today.getTime();
    const todayEnd = todayStart + (24 * 60 * 60 * 1000);

    const filtered = viewMode === 'all' 
      ? transactions 
      : transactions.filter(t => t.outlet_id === viewMode);

    return filtered
      .filter(t => {
        const txTimestamp = t.timestamp || 0;
        return txTimestamp >= todayStart && txTimestamp < todayEnd;
      })
      .reduce((sum, t) => sum + t.total, 0);
  };

  // Calculate outlet performance
  const getOutletPerformance = () => {
    return userOutlets.map(outlet => {
      const outletTransactions = transactions.filter(t => t.outlet_id === outlet.id);
      const totalSales = outletTransactions.reduce((sum, t) => sum + t.total, 0);
      const totalItems = outletTransactions.reduce((sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
      const outletProducts = products.filter(p => p.outlet_id === outlet.id);
      const lowStockCount = outletProducts.filter(p => p.stock < 5).length;

      return {
        id: outlet.id,
        name: outlet.name,
        address: outlet.address,
        totalSales,
        totalItems,
        transactionCount: outletTransactions.length,
        lowStockCount,
        totalProducts: outletProducts.length
      };
    });
  };

  // Get top selling products
  const getTopProducts = () => {
    const productSales = {};
    
    // Filter transactions based on viewMode
    const filteredTransactions = viewMode === 'all' 
      ? transactions 
      : transactions.filter(t => t.outlet_id === viewMode);
    
    filteredTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        // Group by product ID first
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

    // If viewing all outlets, also merge products with same name but different IDs
    if (viewMode === 'all') {
      const mergedProducts = {};
      Object.values(productSales).forEach(product => {
        const key = product.name.toLowerCase().trim();
        if (!mergedProducts[key]) {
          mergedProducts[key] = {
            id: product.id,
            name: product.name,
            quantity: 0,
            revenue: 0
          };
        }
        mergedProducts[key].quantity += product.quantity;
        mergedProducts[key].revenue += product.revenue;
      });
      
      return Object.values(mergedProducts)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    }

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  // Get all sold products for reports (not just top 5, with outlet filtering)
  const getAllSoldProducts = () => {
    const filteredTx = reportViewMode === 'all'
      ? getFilteredTransactionsByPeriod()
      : getFilteredTransactionsByPeriod().filter(t => t.outlet_id === reportViewMode);

    const productSales = {};
    
    filteredTx.forEach(transaction => {
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

    // If viewing all outlets, merge products with same name
    if (reportViewMode === 'all') {
      const mergedProducts = {};
      Object.values(productSales).forEach(product => {
        const key = product.name.toLowerCase().trim();
        if (!mergedProducts[key]) {
          mergedProducts[key] = {
            id: product.id,
            name: product.name,
            quantity: 0,
            revenue: 0
          };
        }
        mergedProducts[key].quantity += product.quantity;
        mergedProducts[key].revenue += product.revenue;
      });
      
      const sorted = Object.values(mergedProducts);
      return productSortBy === 'quantity' 
        ? sorted.sort((a, b) => b.quantity - a.quantity)
        : sorted.sort((a, b) => b.revenue - a.revenue);
    }

    const sorted = Object.values(productSales);
    return productSortBy === 'quantity' 
      ? sorted.sort((a, b) => b.quantity - a.quantity)
      : sorted.sort((a, b) => b.revenue - a.revenue);
  };

  // Get sorted products with max value for bar calculation
  const getSortedSoldProducts = () => {
    const products = getAllSoldProducts();
    if (products.length === 0) return [];
    
    const sortKey = productSortBy === 'quantity' ? 'quantity' : 'revenue';
    const maxValue = Math.max(...products.map(p => p[sortKey]));
    
    return products.map(p => ({
      ...p,
      maxValue,
      percentage: (p[sortKey] / maxValue) * 100
    }));
  };

  // Get inventory summary
  const getInventorySummary = () => {
    const outletProducts = viewMode === 'all' 
      ? products 
      : products.filter(p => p.outlet_id === viewMode);
    
    return {
      total: outletProducts.length,
      outOfStock: outletProducts.filter(p => p.stock === 0).length,
      lowStock: outletProducts.filter(p => p.stock > 0 && p.stock < 5).length,
      totalValue: outletProducts.reduce((sum, p) => sum + (p.stock * p.price), 0)
    };
  };

  // Add new employee
  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.password || newEmployee.outlet_ids.length === 0) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Semua field harus diisi!',
        actions: [{ label: 'OK', type: 'primary' }]
      });
      return;
    }

    if (editingEmployee) {
      // Update employee
      const emailExists = employees.some(e => e.id !== editingEmployee.id && e.email === newEmployee.email);
      if (emailExists) {
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Email Sudah Terdaftar',
          message: 'Email sudah digunakan karyawan lain!',
          actions: [{ label: 'OK', type: 'primary' }]
        });
        return;
      }
      setEmployees(employees.map(e => 
        e.id === editingEmployee.id ? { ...e, ...newEmployee } : e
      ));
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Berhasil!',
        message: 'Karyawan berhasil diperbarui!',
        actions: [{ label: 'OK', type: 'primary' }]
      });
      setEditingEmployee(null);
    } else {
      // Add new employee
      const employeeExists = employees.some(e => e.email === newEmployee.email);
      if (employeeExists) {
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Email Sudah Terdaftar',
          message: 'Email sudah terdaftar!',
          actions: [{ label: 'OK', type: 'primary' }]
        });
        return;
      }

      const employee = {
        id: Date.now().toString(),
        name: newEmployee.name,
        email: newEmployee.email,
        password: newEmployee.password,
        role: newEmployee.role,
        outlet_ids: newEmployee.outlet_ids,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      setEmployees([...employees, employee]);
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Berhasil!',
        message: 'Karyawan berhasil ditambahkan!',
        actions: [{ label: 'OK', type: 'primary' }]
      });
    }

    setNewEmployee({ name: '', email: '', password: '', role: 'cashier', outlet_ids: [currentOutlet?.id || ''] });
    setShowAddEmployee(false);
  };

  // Edit employee
  const handleEditEmployee = (emp) => {
    setEditingEmployee(emp);
    setNewEmployee({
      name: emp.name,
      email: emp.email,
      password: emp.password,
      role: emp.role,
      outlet_ids: emp.outlet_ids || [emp.outlet_id]
    });
    setShowAddEmployee(true);
  };

  // Delete employee
  const handleDeleteEmployee = (id) => {
    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Konfirmasi Hapus',
      message: 'Apakah Anda yakin ingin menghapus karyawan ini?',
      actions: [
        { label: 'Batal', type: 'secondary' },
        {
          label: 'Hapus',
          type: 'danger',
          onClick: () => {
            setEmployees(employees.filter(e => e.id !== id));
            setModal({
              isOpen: true,
              type: 'success',
              title: 'Berhasil!',
              message: 'Karyawan berhasil dihapus!',
              actions: [{ label: 'OK', type: 'primary' }]
            });
          }
        }
      ]
    });
  };

  // Toggle employee status (active/inactive)
  const handleToggleEmployeeStatus = (id) => {
    setEmployees(employees.map(e => 
      e.id === id ? { ...e, status: e.status === 'active' ? 'inactive' : 'active' } : e
    ));
  };

  // Add new outlet
  const handleAddOutlet = () => {
    if (!newOutlet.name || !newOutlet.address) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Nama dan alamat outlet harus diisi!',
        actions: [{ label: 'OK', type: 'primary' }]
      });
      return;
    }

    if (editingOutlet) {
      // Update outlet
      setOutlets(outlets.map(o => 
        o.id === editingOutlet.id ? { ...o, ...newOutlet } : o
      ));
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Berhasil!',
        message: 'Outlet berhasil diperbarui!',
        actions: [{ label: 'OK', type: 'primary' }]
      });
      setEditingOutlet(null);
    } else {
      // Add new outlet
      const outlet = {
        id: 'outlet_' + Date.now().toString(),
        name: newOutlet.name,
        address: newOutlet.address,
        phone: newOutlet.phone,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      setOutlets([...outlets, outlet]);
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Berhasil!',
        message: 'Outlet berhasil ditambahkan!',
        actions: [{ label: 'OK', type: 'primary' }]
      });
    }

    setNewOutlet({ name: '', address: '', phone: '' });
    setShowAddOutlet(false);
  };

  // Edit outlet
  const handleEditOutlet = (outlet) => {
    setEditingOutlet(outlet);
    setNewOutlet({
      name: outlet.name,
      address: outlet.address,
      phone: outlet.phone || ''
    });
    setShowAddOutlet(true);
  };

  // Delete outlet
  const handleDeleteOutlet = (id) => {
    if (window.confirm('Yakin ingin menghapus outlet ini? Semua produk di outlet ini akan dihapus!')) {
      setOutlets(outlets.filter(o => o.id !== id));
    }
  };

  // Toggle outlet status
  const handleToggleOutletStatus = (id) => {
    setOutlets(outlets.map(o => 
      o.id === id ? { ...o, status: o.status === 'active' ? 'inactive' : 'active' } : o
    ));
  };

  // Get filtered transactions by period
  const getFilteredTransactionsByPeriod = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStart = today.getTime();
    const todayEnd = todayStart + (24 * 60 * 60 * 1000);

    let filtered = transactions.filter(t => {
      const txTimestamp = t.timestamp || 0;

      if (reportPeriod === 'today') {
        return txTimestamp >= todayStart && txTimestamp < todayEnd;
      } else if (reportPeriod === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStart = weekAgo.getTime();
        return txTimestamp >= weekAgoStart && txTimestamp < todayEnd;
      } else if (reportPeriod === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const monthAgoStart = monthAgo.getTime();
        return txTimestamp >= monthAgoStart && txTimestamp < todayEnd;
      }
      return true;
    });

    // Filter by viewMode
    if (viewMode !== 'all') {
      filtered = filtered.filter(t => t.outlet_id === viewMode);
    }

    return filtered;
  };

  // Get payment breakdown
  const getPaymentBreakdown = () => {
    const filtered = getFilteredTransactionsByPeriod();
    return {
      cash: filtered.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.total, 0),
      transfer: filtered.filter(t => t.paymentMethod === 'transfer').reduce((sum, t) => sum + t.total, 0),
      ewallet: filtered.filter(t => t.paymentMethod === 'ewallet').reduce((sum, t) => sum + t.total, 0)
    };
  };

  // Get payment method counts
  const getPaymentMethodCounts = () => {
    const filtered = getFilteredTransactionsByPeriod();
    return {
      cash: filtered.filter(t => t.paymentMethod === 'cash').length,
      transfer: filtered.filter(t => t.paymentMethod === 'transfer').length,
      ewallet: filtered.filter(t => t.paymentMethod === 'ewallet').length
    };
  };

  // Get category performance
  const getCategoryPerformance = () => {
    const filtered = getFilteredTransactionsByPeriod();
    const categoryStats = {};

    products.forEach(product => {
      if (!categoryStats[product.category]) {
        categoryStats[product.category] = { category: product.category, quantity: 0, revenue: 0 };
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

    return Object.values(categoryStats)
      .sort((a, b) => b.revenue - a.revenue)
      .filter(cat => cat.revenue > 0);
  };

  // Export report to PDF with outlet filtering
  // Export report to PDF with outlet filtering
  const exportReportToPDF = () => {
    try {
      // Get filtered transactions based on reportViewMode
      const filteredTx = reportViewMode === 'all'
        ? getFilteredTransactionsByPeriod()
        : getFilteredTransactionsByPeriod().filter(t => t.outlet_id === reportViewMode);

      const selectedOutletName = reportViewMode === 'all'
        ? 'Semua Outlet'
        : outlets.find(o => o.id === reportViewMode)?.name || 'Unknown';

      // Get top products based on filtered transactions
      const topProds = reportViewMode === 'all'
        ? topProducts
        : filteredTx.reduce((acc, tx) => {
            tx.items.forEach(item => {
              const prod = acc.find(p => p.id === item.id);
              if (prod) {
                prod.quantity += item.quantity;
                prod.revenue += item.quantity * item.price;
              } else {
                acc.push({
                  id: item.id,
                  name: item.name,
                  quantity: item.quantity,
                  revenue: item.quantity * item.price,
                  price: item.price
                });
              }
            });
            return acc;
          }, [])
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);

      generateSalesPDF(
        filteredTx,
        outlets,
        reportViewMode,
        reportPeriod,
        topProds,
        selectedOutletName
      );
    } catch (error) {
      console.error('Error generating report PDF:', error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Gagal Membuat Laporan PDF',
        message: 'Error: ' + error.message,
        actions: [{ label: 'OK', type: 'primary' }]
      });
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    try {
      // Filter transactions by both period and outlet
      const filteredTx = reportViewMode === 'all'
        ? getFilteredTransactionsByPeriod()
        : getFilteredTransactionsByPeriod().filter(t => t.outlet_id === reportViewMode);
      
      let csv = 'No,Tanggal,Outlet,Metode Pembayaran,Jumlah Item,Total,Produk\n';

      filteredTx.forEach((tx, idx) => {
        const outlet = userOutlets.find(o => o.id === tx.outlet_id)?.name || tx.outlet_id;
        const products = tx.items.map(i => i.name).join('; ');
        csv += `${idx + 1},"${tx.date}","${outlet}","${tx.paymentMethod}",${tx.items.length},"Rp ${tx.total.toLocaleString('id-ID')}","${products}"\n`;
      });

      const link = document.createElement('a');
      link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      link.download = `Transaksi_${reportPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Gagal Export CSV',
        message: 'Error: ' + error.message,
        actions: [{ label: 'OK', type: 'primary' }]
      });
    }
  };

  const handleSwitchOutlet = (outletId) => {
    const outlet = userOutlets.find(o => o.id === outletId);
    if (outlet && onSwitchOutlet) {
      onSwitchOutlet(outletId);
      setSelectedOutletId(outletId);
    }
  };

  const outletPerformance = getOutletPerformance();
  const topProducts = getTopProducts();
  const inventorySummary = getInventorySummary();

  return (
    <div className="owner-dashboard">
      <AlertModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        actions={modal.actions}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>📊 Dashboard Owner</h1>
          <p>Ringkasan performa semua outlet Anda</p>
        </div>
        <div className="header-actions">
          <button className="logout-btn" onClick={() => setLogoutModal(true)}>Keluar</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Ringkasan
        </button>
        <button
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          📦 Inventory
        </button>
        <button
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📊 Laporan & Analytics
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Produk All Outlet
        </button>
        <button
          className={`tab-btn ${activeTab === 'outlets-mgmt' ? 'active' : ''}`}
          onClick={() => setActiveTab('outlets-mgmt')}
        >
          🏪 Manajemen Outlet & Karyawan
        </button>
      </div>

      {/* View Mode Selector - Show only on overview, inventory, products tabs */}
      {['overview', 'inventory', 'products'].includes(activeTab) && (
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          backgroundColor: '#f9f9f9'
        }}>
          <label style={{ fontWeight: '600', marginBottom: 0, color: '#333' }}>
            📍 Tampilkan Data:
          </label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          >
            <option value="all">🌐 Semua Outlet</option>
            {outlets.filter(outlet => (outlet.status || 'active') === 'active').map(outlet => (
              <option key={outlet.id} value={outlet.id}>
                🏪 {outlet.name}
              </option>
            ))}
          </select>
          <span style={{ fontSize: '12px', color: '#666', marginLeft: 'auto' }}>
            {viewMode === 'all' 
              ? 'Menampilkan data dari semua outlet' 
              : `Menampilkan data dari ${userOutlets.find(o => o.id === viewMode)?.name || 'outlet'}`
            }
          </span>
        </div>
      )}

      {/* Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            {/* Key Metrics */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">💰</div>
                <div className="metric-content">
                  <h3>Total Penjualan</h3>
                  <p className="metric-value">Rp {calculateTotalSales().toLocaleString('id-ID')}</p>
                  <span className="metric-subtitle">
                    {viewMode === 'all' ? 'Semua outlet, semua waktu' : `${userOutlets.find(o => o.id === viewMode)?.name || 'Outlet'}, semua waktu`}
                  </span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">📊</div>
                <div className="metric-content">
                  <h3>Penjualan Hari Ini</h3>
                  <p className="metric-value">Rp {calculateTodaySales().toLocaleString('id-ID')}</p>
                  <span className="metric-subtitle">
                    {viewMode === 'all' ? 'Total semua outlet' : `Total ${userOutlets.find(o => o.id === viewMode)?.name || 'outlet'}`}
                  </span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">🛒</div>
                <div className="metric-content">
                  <h3>Total Transaksi</h3>
                  <p className="metric-value">
                    {viewMode === 'all' 
                      ? transactions.length 
                      : transactions.filter(t => t.outlet_id === viewMode).length
                    }
                  </p>
                  <span className="metric-subtitle">
                    {viewMode === 'all' ? 'Semua outlet, semua waktu' : `${userOutlets.find(o => o.id === viewMode)?.name || 'Outlet'}, semua waktu`}
                  </span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">🏪</div>
                <div className="metric-content">
                  <h3>Jumlah Outlet</h3>
                  <p className="metric-value">{userOutlets.length}</p>
                  <span className="metric-subtitle">Outlet aktif Anda</span>
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="section-container">
              <h2>🏆 Produk Terlaris</h2>
              <div className="top-products-list">
                {topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <div key={product.id} className="product-rank-item">
                      <span className="rank-badge">#{index + 1}</span>
                      <div className="product-rank-info">
                        <h4>{product.name}</h4>
                        <p>{product.quantity} terjual • Rp {product.revenue.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">Belum ada transaksi</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="inventory-section">
            <h2>📦 Inventaris {viewMode === 'all' ? 'Semua Outlet' : currentOutlet?.name}</h2>
            
            <div className="inventory-cards">
              <div className="inventory-card">
                <div className="inventory-icon">📊</div>
                <h4>Total Produk</h4>
                <p className="inventory-number">{inventorySummary.total}</p>
              </div>

              <div className="inventory-card warning">
                <div className="inventory-icon">🔴</div>
                <h4>Stok Habis</h4>
                <p className="inventory-number">{inventorySummary.outOfStock}</p>
              </div>

              <div className="inventory-card alert">
                <div className="inventory-icon">🟡</div>
                <h4>Stok Rendah</h4>
                <p className="inventory-number">{inventorySummary.lowStock}</p>
              </div>

              <div className="inventory-card">
                <div className="inventory-icon">💵</div>
                <h4>Nilai Inventaris</h4>
                <p className="inventory-number">Rp {(inventorySummary.totalValue / 1000000).toFixed(1)}jt</p>
              </div>
            </div>

            <div className="low-stock-products">
              <h3>⚠️ Produk Stok Rendah</h3>
              <div className="products-list">
                {products
                  .filter(p => (viewMode === 'all' ? true : p.outlet_id === viewMode) && p.stock > 0 && p.stock < 5)
                  .map(product => (
                    <div key={product.id} className="low-stock-item">
                      <div className="low-stock-info">
                        <h4>{product.name}</h4>
                        <p>{product.category}</p>
                      </div>
                      <div className="low-stock-stock">
                        <span className="stock-badge">Stok: {product.stock}</span>
                        <span className="price">Rp {product.price.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                {products.filter(p => (viewMode === 'all' ? true : p.outlet_id === viewMode) && p.stock > 0 && p.stock < 5).length === 0 && (
                  <p className="no-data">Semua produk memiliki stok cukup</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-section">
            <h2>📊 Laporan & Analytics {reportViewMode === 'all' ? '(Semua Outlet)' : `(${outlets.find(o => o.id === reportViewMode)?.name})`}</h2>
            
            {/* Period Filter & Outlet Selection */}
            <div className="report-controls">
              <div className="control-group">
                <div className="period-selector">
                  <label>📅 Pilih Periode:</label>
                  <select value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)}>
                    <option value="today">Hari Ini</option>
                    <option value="week">7 Hari Terakhir</option>
                    <option value="month">30 Hari Terakhir</option>
                    <option value="all">Semua Waktu</option>
                  </select>
                </div>

                {userOutlets && userOutlets.length > 1 && (
                  <div className="outlet-selector">
                    <label>🏪 Pilih Outlet:</label>
                    <select value={reportViewMode} onChange={(e) => setReportViewMode(e.target.value)}>
                      <option value="all">Semua Outlet</option>
                      {userOutlets.map(outlet => (
                        <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="export-buttons">
                <button className="export-btn pdf-btn" onClick={exportReportToPDF}>
                  📄 Download PDF
                </button>
                <button className="export-btn csv-btn" onClick={exportToCSV}>
                  📊 Export CSV
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="report-summary">
              <h3>Ringkasan Periode</h3>
              <div className="summary-cards">
                {(() => {
                  const filtered = reportViewMode === 'all'
                    ? getFilteredTransactionsByPeriod()
                    : getFilteredTransactionsByPeriod().filter(t => t.outlet_id === reportViewMode);
                  const totalSales = filtered.reduce((sum, t) => sum + t.total, 0);
                  const totalTx = filtered.length;
                  const totalItems = filtered.reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0), 0);
                  const avgTransaction = totalTx > 0 ? totalSales / totalTx : 0;

                  return (
                    <>
                      <div className="summary-card">
                        <h4>Total Penjualan</h4>
                        <p className="amount">Rp {totalSales.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="summary-card">
                        <h4>Total Transaksi</h4>
                        <p className="amount">{totalTx}</p>
                      </div>
                      <div className="summary-card">
                        <h4>Total Item Terjual</h4>
                        <p className="amount">{totalItems}</p>
                      </div>
                      <div className="summary-card">
                        <h4>Rata-rata/Transaksi</h4>
                        <p className="amount">Rp {avgTransaction.toLocaleString('id-ID')}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Metode Pembayaran</h3>
                <div className="payment-breakdown">
                  {(() => {
                    const filtered = reportViewMode === 'all'
                      ? getFilteredTransactionsByPeriod()
                      : getFilteredTransactionsByPeriod().filter(t => t.outlet_id === reportViewMode);
                    const breakdown = reportViewMode === 'all'
                      ? getPaymentBreakdown()
                      : {
                          cash: filtered.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.total, 0),
                          transfer: filtered.filter(t => t.paymentMethod === 'transfer').reduce((sum, t) => sum + t.total, 0),
                          ewallet: filtered.filter(t => t.paymentMethod === 'ewallet').reduce((sum, t) => sum + t.total, 0)
                        };
                    const counts = {
                      cash: filtered.filter(t => t.paymentMethod === 'cash').length,
                      transfer: filtered.filter(t => t.paymentMethod === 'transfer').length,
                      ewallet: filtered.filter(t => t.paymentMethod === 'ewallet').length
                    };
                    const total = breakdown.cash + breakdown.transfer + breakdown.ewallet;

                    return (
                      <>
                        <div className="payment-item">
                          <div className="payment-header">
                            <span className="payment-label">💵 Tunai</span>
                            <span className="payment-count">{counts.cash}x</span>
                          </div>
                          <span className="payment-value">Rp {breakdown.cash.toLocaleString('id-ID')}</span>
                          <div className="payment-bar">
                            <div className="bar-fill" style={{ width: `${total > 0 ? (breakdown.cash / total) * 100 : 0}%`, backgroundColor: '#667eea' }}></div>
                          </div>
                        </div>
                        <div className="payment-item">
                          <div className="payment-header">
                            <span className="payment-label">🏦 Transfer</span>
                            <span className="payment-count">{counts.transfer}x</span>
                          </div>
                          <span className="payment-value">Rp {breakdown.transfer.toLocaleString('id-ID')}</span>
                          <div className="payment-bar">
                            <div className="bar-fill" style={{ width: `${total > 0 ? (breakdown.transfer / total) * 100 : 0}%`, backgroundColor: '#764ba2' }}></div>
                          </div>
                        </div>
                        <div className="payment-item">
                          <div className="payment-header">
                            <span className="payment-label">📱 E-Wallet</span>
                            <span className="payment-count">{counts.ewallet}x</span>
                          </div>
                          <span className="payment-value">Rp {breakdown.ewallet.toLocaleString('id-ID')}</span>
                          <div className="payment-bar">
                            <div className="bar-fill" style={{ width: `${(breakdown.ewallet / total) * 100}%`, backgroundColor: '#f093fb' }}></div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="analytics-card">
                <h3>Performa Kategori</h3>
                <div className="category-list">
                  {getCategoryPerformance().map((cat, idx) => (
                    <div key={idx} className="category-item">
                      <span className="cat-name">{cat.category}</span>
                      <span className="cat-stats">{cat.quantity} item | Rp {cat.revenue.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                  {getCategoryPerformance().length === 0 && <p className="no-data">Belum ada data</p>}
                </div>
              </div>
            </div>

            {/* Sold Products Detail */}
            <div className="top-products-detail">
              <div className="products-header">
                <h3>📦 Produk yang Terjual</h3>
                <div className="sort-buttons">
                  <button 
                    className={`sort-btn ${productSortBy === 'quantity' ? 'active' : ''}`}
                    onClick={() => setProductSortBy('quantity')}
                  >
                    📊 Qty Terbanyak
                  </button>
                  <button 
                    className={`sort-btn ${productSortBy === 'revenue' ? 'active' : ''}`}
                    onClick={() => setProductSortBy('revenue')}
                  >
                    💰 Revenue Terbanyak
                  </button>
                </div>
              </div>
              <div className="sold-products-table-container">
                {getSortedSoldProducts().length > 0 ? (
                  <table className="sold-products-table">
                    <thead>
                      <tr>
                        <th className="rank-col">No</th>
                        <th className="product-col">Nama Produk</th>
                        <th className="qty-col">Qty Terjual</th>
                        <th className="revenue-col">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedSoldProducts().map((prod, idx) => (
                        <tr key={prod.id} className="product-row">
                          <td className="rank-col">
                            <span className="rank-number">{idx + 1}</span>
                          </td>
                          <td className="product-col">
                            <span className="product-title">{prod.name}</span>
                          </td>
                          <td className="qty-col">
                            <span className="qty-badge">{prod.quantity}</span>
                          </td>
                          <td className="revenue-col">
                            <span className="revenue-badge">Rp {prod.revenue.toLocaleString('id-ID')}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">Belum ada data produk yang terjual</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Products All Outlet Tab */}
        {activeTab === 'products' && (
          <div className="tab-content">
            <div className="products-overview">
              <h2>📦 Manajemen Produk {viewMode === 'all' ? '- Semua Outlet' : `- ${currentOutlet?.name}`}</h2>
              {viewMode === 'all' ? (
                outlets && outlets.filter(outlet => (outlet.status || 'active') === 'active').map((outlet) => {
                  const outletProducts = products.filter(p => p.outlet_id === outlet.id);
                  return (
                    <div key={outlet.id} className="outlet-products-section">
                      <div className="outlet-section-header">
                        <h3>🏪 {outlet.name}</h3>
                        <span className="product-count">{outletProducts.length} produk</span>
                      </div>
                      {outletProducts.length > 0 ? (
                        <div className="products-grid">
                          {outletProducts.map((product) => (
                            <div key={product.id} className="product-card">
                              {product.image && (
                                <div className="product-image">
                                  <img src={product.image} alt={product.name} />
                                </div>
                              )}
                              <div className="product-info">
                                <h4>{product.name}</h4>
                                <p className="product-category">{product.category}</p>
                                <div className="product-details">
                                  <span className="price">Rp {product.price.toLocaleString('id-ID')}</span>
                                  <span className={`stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                    Stock: {product.stock}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-data-outlet">Belum ada produk di outlet ini</p>
                      )}
                    </div>
                  );
                })
              ) : (
                (() => {
                  const outletProducts = products.filter(p => p.outlet_id === viewMode);
                  return (
                    <div className="outlet-products-section">
                      <div className="outlet-section-header">
                        <h3>🏪 {currentOutlet?.name}</h3>
                        <span className="product-count">{outletProducts.length} produk</span>
                      </div>
                      {outletProducts.length > 0 ? (
                        <div className="products-grid">
                          {outletProducts.map((product) => (
                            <div key={product.id} className="product-card">
                              {product.image && (
                                <div className="product-image">
                                  <img src={product.image} alt={product.name} />
                                </div>
                              )}
                              <div className="product-info">
                                <h4>{product.name}</h4>
                                <p className="product-category">{product.category}</p>
                                <div className="product-details">
                                  <span className="price">Rp {product.price.toLocaleString('id-ID')}</span>
                                  <span className={`stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                    Stock: {product.stock}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-data-outlet">Belum ada produk di outlet ini</p>
                      )}
                    </div>
                  );
                })()
              )}
              {products.length === 0 && <p className="no-data">Belum ada produk</p>}
            </div>
          </div>
        )}

        {/* Management Tab - Employees & Outlets */}
        {activeTab === 'outlets-mgmt' && (
          <div className="tab-content">
            <div className="management-section">
              {/* Two-Column Layout */}
              <div className="management-columns">
                {/* Left Column: Outlets Cards */}
                <div className="management-column left-column">
                  <div className="management-subsection">
                    <div className="subsection-header">
                      <h2>🏪 Outlets</h2>
                      <button className="add-btn" onClick={() => setShowAddOutlet(true)}>
                        ➕ Tambah Outlet
                      </button>
                    </div>

                    {/* Add Outlet Form */}
                    {showAddOutlet && (
                      <div className="add-outlet-form">
                        <div className="form-overlay" onClick={() => { setShowAddOutlet(false); setEditingOutlet(null); }}></div>
                        <div className="form-modal">
                          <h3>{editingOutlet ? '✏️ Edit Outlet' : '➕ Tambah Outlet Baru'}</h3>
                          <div className="form-group">
                            <label>Nama Outlet</label>
                            <input
                              type="text"
                              placeholder="Masukkan nama outlet"
                              value={newOutlet.name}
                              onChange={(e) => setNewOutlet({ ...newOutlet, name: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Alamat</label>
                            <textarea
                              placeholder="Masukkan alamat outlet"
                              value={newOutlet.address}
                              onChange={(e) => setNewOutlet({ ...newOutlet, address: e.target.value })}
                              rows="3"
                            ></textarea>
                          </div>
                          <div className="form-group">
                            <label>Nomor Telepon (Opsional)</label>
                            <input
                              type="tel"
                              placeholder="Nomor telepon outlet"
                              value={newOutlet.phone}
                              onChange={(e) => setNewOutlet({ ...newOutlet, phone: e.target.value })}
                            />
                          </div>
                          <div className="form-actions">
                            <button className="btn-cancel" onClick={() => { setShowAddOutlet(false); setEditingOutlet(null); }}>Batal</button>
                            <button className="btn-save" onClick={handleAddOutlet}>
                              {editingOutlet ? 'Perbarui' : 'Simpan'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Outlets Cards List */}
                    <div className="outlets-cards-list">
                      {outlets.length > 0 ? (
                        outlets.map((outlet) => (
                          <div 
                            key={outlet.id} 
                            className={`outlet-card ${selectedManagementOutlet?.id === outlet.id ? 'selected' : ''}`}
                            onClick={() => setSelectedManagementOutlet(outlet)}
                          >
                            <div className="outlet-card-header">
                              <h3>🏪 {outlet.name}</h3>
                              <span className={`status-badge ${outlet.status || 'active'}`}>
                                {(outlet.status || 'active') === 'active' ? '✅' : '❌'}
                              </span>
                            </div>
                            <p className="outlet-card-address">{outlet.address}</p>
                            {outlet.phone && <p className="outlet-card-phone">📞 {outlet.phone}</p>}
                            <div className="outlet-card-actions">
                              <button
                                className="action-btn edit"
                                onClick={(e) => { e.stopPropagation(); handleEditOutlet(outlet); }}
                              >
                                ✏️
                              </button>
                              <button
                                className={`action-btn ${(outlet.status || 'active') === 'active' ? 'deactivate' : 'activate'}`}
                                onClick={(e) => { e.stopPropagation(); handleToggleOutletStatus(outlet.id); }}
                              >
                                {(outlet.status || 'active') === 'active' ? '🔒' : '🔓'}
                              </button>
                              <button
                                className="action-btn delete"
                                onClick={(e) => { e.stopPropagation(); handleDeleteOutlet(outlet.id); }}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="no-data">Belum ada outlet terdaftar</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Employees Cards */}
                <div className="management-column right-column">
                  <div className="management-subsection">
                    <div className="subsection-header">
                      <h2>👥 Karyawan {selectedManagementOutlet ? `- ${selectedManagementOutlet.name}` : '(Semua)'}</h2>
                      <button className="add-btn" onClick={() => setShowAddEmployee(true)}>
                        ➕ Tambah Karyawan
                      </button>
                    </div>

                    {/* Add Employee Form */}
                    {showAddEmployee && (
                      <div className="add-employee-form">
                        <div className="form-overlay" onClick={() => { setShowAddEmployee(false); setEditingEmployee(null); }}></div>
                        <div className="form-modal large-modal">
                          <h3>{editingEmployee ? '✏️ Edit Karyawan' : '➕ Tambah Karyawan Baru'}</h3>
                          <div className="form-group">
                            <label>Nama Karyawan</label>
                            <input
                              type="text"
                              placeholder="Masukkan nama lengkap"
                              value={newEmployee.name}
                              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Email</label>
                            <input
                              type="email"
                              placeholder="contoh@email.com"
                              value={newEmployee.email}
                              onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Password</label>
                            <input
                              type="password"
                              placeholder="Masukkan password"
                              value={newEmployee.password}
                              onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Role</label>
                            <select
                              value={newEmployee.role}
                              onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                            >
                              <option value="admin">Admin</option>
                              <option value="cashier">Kasir</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>
                              {newEmployee.role === 'admin' ? 'Outlet yang Dikelola (Pilih Multiple)' : 'Outlet'}
                            </label>
                            {newEmployee.role === 'admin' ? (
                              <div className="outlet-checkboxes">
                                {outlets.map(outlet => (
                                  <label key={outlet.id} className="checkbox-label">
                                    <input
                                      type="checkbox"
                                      checked={newEmployee.outlet_ids.includes(outlet.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setNewEmployee({
                                            ...newEmployee,
                                            outlet_ids: [...newEmployee.outlet_ids, outlet.id]
                                          });
                                        } else {
                                          setNewEmployee({
                                            ...newEmployee,
                                            outlet_ids: newEmployee.outlet_ids.filter(id => id !== outlet.id)
                                          });
                                        }
                                      }}
                                    />
                                    {outlet.name}
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <select
                                value={newEmployee.outlet_ids[0] || ''}
                                onChange={(e) => setNewEmployee({ ...newEmployee, outlet_ids: [e.target.value] })}
                              >
                                <option value="">Pilih Outlet</option>
                                {outlets.map(outlet => (
                                  <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
                                ))}
                              </select>
                            )}
                          </div>
                          <div className="form-actions">
                            <button className="btn-cancel" onClick={() => { setShowAddEmployee(false); setEditingEmployee(null); }}>Batal</button>
                            <button className="btn-save" onClick={handleAddEmployee}>
                              {editingEmployee ? 'Perbarui' : 'Simpan'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Employees Cards List */}
                    <div className="employees-cards-list">
                      {employees.length > 0 ? (
                        employees
                          .filter(emp => {
                            if (!selectedManagementOutlet) return true;
                            return emp.outlet_ids?.includes(selectedManagementOutlet.id) || 
                                   emp.outlet_id === selectedManagementOutlet.id;
                          })
                          .map((emp) => {
                            const empOutlets = outlets.filter(o => 
                              emp.outlet_ids?.includes(o.id) || o.id === emp.outlet_id
                            );
                            return (
                              <div key={emp.id} className="employee-card">
                                <div className="employee-card-header">
                                  <h4>{emp.name || emp.email.split('@')[0]}</h4>
                                  <span className={`status-badge ${emp.status}`}>
                                    {emp.status === 'active' ? '✅' : '❌'}
                                  </span>
                                </div>
                                <p className="employee-card-email">{emp.email}</p>
                                <div className="employee-card-role">
                                  <span className={`role-badge role-${emp.role}`}>
                                    {emp.role === 'admin' ? '👨‍💼 Admin' : '👨‍💻 Kasir'}
                                  </span>
                                </div>
                                <div className="employee-card-outlets">
                                  <small>Outlets:</small>
                                  <div className="outlets-tags">
                                    {empOutlets.length > 0 ? (
                                      empOutlets.map(o => (
                                        <span key={o.id} className="outlet-tag">{o.name}</span>
                                      ))
                                    ) : (
                                      <span className="outlet-tag">-</span>
                                    )}
                                  </div>
                                </div>
                                <div className="employee-card-actions">
                                  <button
                                    className="action-btn edit"
                                    onClick={() => handleEditEmployee(emp)}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className={`action-btn ${emp.status === 'active' ? 'deactivate' : 'activate'}`}
                                    onClick={() => handleToggleEmployeeStatus(emp.id)}
                                  >
                                    {emp.status === 'active' ? '🔒' : '🔓'}
                                  </button>
                                  <button
                                    className="action-btn delete"
                                    onClick={() => handleDeleteEmployee(emp.id)}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <p className="no-data">
                          {selectedManagementOutlet 
                            ? `Belum ada karyawan di outlet ${selectedManagementOutlet.name}`
                            : 'Belum ada karyawan terdaftar'
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <AlertModal
        isOpen={logoutModal}
        type="warning"
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari dashboard?"
        onClose={() => setLogoutModal(false)}
        actions={[
          {
            label: 'Batal',
            type: 'secondary',
            onClick: () => setLogoutModal(false)
          },
          {
            label: 'Keluar',
            type: 'primary',
            onClick: onLogout
          }
        ]}
      />
    </div>
  );
};

export default OwnerDashboard;
