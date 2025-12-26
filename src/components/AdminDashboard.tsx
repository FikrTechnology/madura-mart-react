// @ts-nocheck
import React, { useState, useEffect } from 'react';
import '../styles/AdminDashboard.css';
import AlertModal from './AlertModal';
import { userAPI, productAPI } from '../services/api';

const AdminDashboard = ({ onLogout, currentOutlet, products, setProducts, userOutlets, onRefreshProducts }) => {
  const [activeTab, setActiveTab] = useState('products');
  // Initialize with currentOutlet?.id, fallback to first userOutlet
  const [currentOutletId, setCurrentOutletId] = useState(() => {
    return currentOutlet?.id || userOutlets?.[0]?.id;
  });
  
  // Ensure setProducts is a function - use default if not provided
  // Also normalize products to use outlet_id (snake_case) consistently
  const normalizeProducts = (prods) => {
    return prods.map(p => {
      // Create new object with proper outlet_id
      const normalized = {
        ...p,
        outlet_id: p.outlet_id || p.outletId, // Handle both snake_case and camelCase
      };
      // Remove outletId if it's different from outlet_id to avoid confusion
      if (normalized.outletId && normalized.outletId !== normalized.outlet_id) {
        delete normalized.outletId;
      }
      return normalized;
    });
  };

  const safeSetProducts = typeof setProducts === 'function' 
    ? (newProducts) => {
        console.log('[safeSetProducts] Setting products, count:', newProducts.length);
        const normalized = normalizeProducts(newProducts);
        console.log('[safeSetProducts] After normalization:', normalized.length);
        console.log('[safeSetProducts] First product:', normalized[0] || 'none');
        
        // IMPORTANT: Create new array reference to force React re-render
        const newArray = [...normalized];
        console.log('[safeSetProducts] Calling setProducts with new array reference...');
        setProducts(newArray);
        console.log('[safeSetProducts] ✓ setProducts called');
      }
    : (newProducts) => {
        console.warn('[safeSetProducts] setProducts not a function, using localStorage fallback');
        const normalized = normalizeProducts(newProducts);
        localStorage.setItem('madura_products', JSON.stringify(normalized));
      };
  
  // Function to reload products from backend
  // ROBUST VERSION: Always fetch fresh data directly
  const reloadProducts = async (showLoadingMsg = true, retries = 3) => {
    try {
      console.log('[reloadProducts] ======= START RELOAD =======');
      console.log('[reloadProducts] Attempt', (3 - retries + 1), 'of 3');
      
      if (showLoadingMsg) {
        setIsLoading(true);
        setLoadingMessage('Memperbarui data produk...');
      }
      
      // ALWAYS fetch fresh from backend directly
      console.log('[reloadProducts] Fetching ALL products from backend (no cache)...');
      // Add timestamp to bypass any potential caching
      const result = await productAPI.getAll({ limit: 1000, _t: Date.now() });
      console.log('[reloadProducts] API Response:', {
        success: result.success,
        dataType: typeof result.data,
        itemCount: Array.isArray(result.data) ? result.data.length : Object.keys(result.data || {}).length
      });
      
      if (result.success && result.data) {
        // Convert object to array if needed
        let productsArray = Array.isArray(result.data) ? result.data : Object.values(result.data || {});
        console.log('[reloadProducts] ✓ Got', productsArray.length, 'products from backend');
        
        // Normalize products
        const normalized = productsArray.map((p: any) => ({
          ...p,
          outlet_id: p.outlet_id || p.outletId,
        }));
        
        console.log('[reloadProducts] ✓ Normalized', normalized.length, 'products');
        console.log('[reloadProducts] Sample product:', normalized[0] || 'none');
        console.log('[reloadProducts] Updating local state...');
        
        // Update local state directly - this is the key
        safeSetProducts(normalized);
        
        // Also update localStorage
        localStorage.setItem('madura_products', JSON.stringify(normalized));
        console.log('[reloadProducts] ✓ State & LocalStorage updated');
        
        if (showLoadingMsg) {
          setIsLoading(false);
          setLoadingMessage('');
        }
        
        console.log('[reloadProducts] ======= END RELOAD (SUCCESS) =======');
        return true;
      } else {
        console.error('[reloadProducts] API returned success=false');
        throw new Error(result.message || 'API returned success=false');
      }
    } catch (error) {
      console.error('[reloadProducts] ❌ Error:', error.message || error);
      
      // Retry mechanism
      if (retries > 0) {
        console.log('[reloadProducts] ⟳ Retrying... (' + (3 - retries + 1) + '/3 attempts)');
        await new Promise(resolve => setTimeout(resolve, 1500));
        return reloadProducts(showLoadingMsg, retries - 1);
      }
      
      console.log('[reloadProducts] ❌ Failed after 3 attempts');
      if (showLoadingMsg) {
        setIsLoading(false);
        setLoadingMessage('');
      }
      
      return false;
    }
  };
  
  // Debug logging
  useEffect(() => {
    console.log('=== AdminDashboard RENDER ===');
    console.log('userOutlets prop:', userOutlets);
    console.log('userOutlets length:', userOutlets?.length);
    console.log('currentOutletId:', currentOutletId);
    console.log('currentOutlet prop:', currentOutlet);
    console.log('Current products in state:', products.length, 'products');
    console.log('Filtered products for outlet:', products.filter(p => {
      const oid = p.outlet_id || p.outletId;
      return oid === currentOutletId;
    }).length);
    console.log('===========================');
  }, [products, currentOutletId, userOutlets]);
  
  // Modal state
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '', actions: [] });
  const [logoutModal, setLogoutModal] = useState(false);
  
  // Loading state untuk CRUD operations
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Product management states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [selectedOutletsForProduct, setSelectedOutletsForProduct] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'Kebutuhan Dapur',
    image: ''
  });

  // Employee & Outlet data
  const [employees, setEmployees] = useState(() => {
    const stored = localStorage.getItem('madura_employees');
    return stored ? JSON.parse(stored) : [];
  });

  const [outlets, setOutlets] = useState(() => {
    const stored = localStorage.getItem('madura_outlets');
    return stored ? JSON.parse(stored) : userOutlets;
  });

  // Load employees from backend on component mount
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const result = await userAPI.getAll();
        if (result.success && result.data) {
          setEmployees(result.data);
          localStorage.setItem('madura_employees', JSON.stringify(result.data));
        }
      } catch (error) {
        console.error('Failed to load employees from backend:', error);
        // Fall back to localStorage if backend fails
        const stored = localStorage.getItem('madura_employees');
        if (stored) {
          setEmployees(JSON.parse(stored));
        }
      }
    };
    
    loadEmployees();
  }, []);

  // Sync currentOutletId with currentOutlet prop
  useEffect(() => {
    if (currentOutlet?.id) {
      setCurrentOutletId(currentOutlet.id);
    } else if (userOutlets?.length > 0 && !currentOutletId) {
      // Fallback to first outlet if no currentOutlet
      setCurrentOutletId(userOutlets[0].id);
    }
  }, [currentOutlet?.id, userOutlets]);

  // Load products from backend on mount
  useEffect(() => {
    const loadProductsFromBackend = async () => {
      try {
        console.log('Loading products from backend on mount...');
        const result = await productAPI.getAll({ limit: 100 });
        if (result.success && result.data) {
          console.log('Products loaded from backend:', result.data.length);
          safeSetProducts(result.data);
          localStorage.setItem('madura_products', JSON.stringify(result.data));
        }
      } catch (error) {
        console.error('Failed to load products from backend:', error);
        // Keep existing products from props/localStorage
      }
    };
    
    loadProductsFromBackend();
  }, []);

  // Get current outlet
  const currentOutletData = outlets.find(o => o.id === currentOutletId) || currentOutlet;

  // Get outlet-specific products - handle both outlet_id and outletId
  const outletProducts = products.filter(p => {
    const outletId = p.outlet_id || p.outletId;
    return outletId === currentOutletId;
  });
  const filteredProducts = outletProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Get outlet-specific employees (exclude owner role)
  // First try strict filter - show only assigned to current outlet
  // Then fallback to show all if none found (for legacy data compatibility)
  const strictFilteredEmployees = employees.filter(emp => {
    if (!currentOutletId || emp.role === 'owner') {
      return false;
    }
    
    if ((emp.outlet_ids && emp.outlet_ids.length > 0) || emp.outlet_id) {
      const empOutletIds = (emp.outlet_ids || []).map(id => String(id).trim().toLowerCase());
      const empSingleOutletId = emp.outlet_id ? String(emp.outlet_id).trim().toLowerCase() : null;
      const currentId = String(currentOutletId).trim().toLowerCase();
      return empOutletIds.includes(currentId) || empSingleOutletId === currentId;
    }
    
    return false;
  });
  
  // Fallback: if no employees found with proper assignment, show all non-owner employees
  // This handles case where employees exist but haven't been properly assigned
  const outletEmployees = strictFilteredEmployees.length > 0 
    ? strictFilteredEmployees 
    : employees.filter(emp => emp.role !== 'owner');

  // Product CRUD handlers
  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Nama, harga, dan stok harus diisi!',
        actions: [{ label: 'OK', type: 'primary' }]
      });
      return;
    }

    // Cek outlet selection untuk produk baru
    if (!editingProduct && selectedOutletsForProduct.length === 0) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Pilih Outlet',
        message: 'Silakan pilih minimal satu outlet untuk produk ini!',
        actions: [{ label: 'OK', type: 'primary' }]
      });
      return;
    }

    if (editingProduct) {
      // Update existing product
      console.log('[UPDATE] ========== START UPDATE ==========');
      console.log('[UPDATE] Product ID:', editingProduct.id);
      console.log('[UPDATE] Product name:', newProduct.name);
      setIsLoading(true);
      setLoadingMessage('Mengupdate produk...');
      
      try {
        const updateData = {
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock),
          category: newProduct.category,
          image: newProduct.image,
          outlet_id: editingProduct.outlet_id || editingProduct.outletId,
          status: 'active'
        };
        
        console.log('[UPDATE] Sending update request to backend');
        const result = await productAPI.update(editingProduct.id, updateData);
        console.log('[UPDATE] ✓ Backend response received:', result.success);
        
        if (result.success) {
          console.log('[UPDATE] ✓ Update successful, waiting for database to commit...');
          setLoadingMessage('Memperbarui daftar produk...');
          
          // IMPORTANT: Wait longer for database to fully commit
          console.log('[UPDATE] Waiting 800ms for backend to persist...');
          await new Promise(resolve => setTimeout(resolve, 800));
          
          console.log('[UPDATE] Now reloading products from backend...');
          const reloadSuccess = await reloadProducts(false);
          console.log('[UPDATE] ✓ Reload result:', reloadSuccess);
          
          if (reloadSuccess) {
            console.log('[UPDATE] ✓ Data refreshed successfully');
            resetProductForm();
            
            // Small delay before closing form and showing success
            await new Promise(resolve => setTimeout(resolve, 200));
            setIsLoading(false);
            setLoadingMessage('');
            
            setModal({
              isOpen: true,
              type: 'success',
              title: 'Berhasil!',
              message: 'Produk "' + newProduct.name + '" berhasil diperbarui. Halaman akan dimuat ulang...',
              actions: [{ 
                label: 'OK', 
                type: 'primary',
                onClick: () => {
                  console.log('[UPDATE] User clicked OK, reloading page...');
                  window.location.reload();
                }
              }]
            });
            console.log('[UPDATE] ========== END UPDATE (SUCCESS) ==========');
          } else {
            throw new Error('Gagal memperbarui daftar produk setelah update');
          }
        } else {
          throw new Error(result.message || 'Update failed');
        }
      } catch (error) {
        console.error('[UPDATE] Error:', error);
        setIsLoading(false);
        setLoadingMessage('');
        
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Gagal!',
          message: `Error: ${error.response?.data?.message || error.message || 'Update gagal'}`,
          actions: [{ label: 'OK', type: 'primary' }]
        });
      }
    } else {
      // Add new product to multiple outlets
      console.log('[CREATE] ========== START CREATE ==========');
      console.log('[CREATE] Product name:', newProduct.name);
      console.log('[CREATE] Selected outlets:', selectedOutletsForProduct.length);
      setIsLoading(true);
      setLoadingMessage('Membuat produk baru...');
      
      try {
        const newProducts = selectedOutletsForProduct.map(outletId => ({
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock),
          category: newProduct.category,
          image: newProduct.image,
          outlet_id: outletId,
          status: 'active'
        }));

        console.log('[CREATE] Creating', newProducts.length, 'products in parallel');
        
        // Create all products in parallel
        const results = await Promise.all(newProducts.map(prod =>
          productAPI.create(prod)
        ));
        
        console.log('[CREATE] ✓ All', results.length, 'products created successfully');
        
        // IMPORTANT: Wait longer for database to fully commit
        console.log('[CREATE] Waiting 800ms for backend to persist...');
        setLoadingMessage('Memperbarui daftar produk...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.log('[CREATE] Now reloading products from backend...');
        const reloadSuccess = await reloadProducts(false);
        console.log('[CREATE] ✓ Reload result:', reloadSuccess);
        
        if (reloadSuccess) {
          const outletNames = userOutlets
            .filter(o => selectedOutletsForProduct.includes(o.id))
            .map(o => o.name)
            .join(', ');
        
          console.log('[CREATE] ✓ Data refreshed successfully');
          resetProductForm();
          
          // Small delay before closing form and showing success
          await new Promise(resolve => setTimeout(resolve, 200));
          setIsLoading(false);
          setLoadingMessage('');
          
          setModal({
            isOpen: true,
            type: 'success',
            title: 'Berhasil!',
            message: `Produk "${newProduct.name}" berhasil ditambahkan ke: ${outletNames}. Halaman akan dimuat ulang...`,
            actions: [{ 
              label: 'OK', 
              type: 'primary',
              onClick: () => {
                console.log('[CREATE] User clicked OK, reloading page...');
                window.location.reload();
              }
            }]
          });
        } else {
          throw new Error('Gagal memperbarui daftar produk setelah create');
        }
      } catch (error) {
        console.error('[CREATE] Error:', error);
        setIsLoading(false);
        setLoadingMessage('');
        
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Gagal!',
          message: `Error: ${error.response?.data?.message || error.message || 'Create gagal'}`,
          actions: [{ label: 'OK', type: 'primary' }]
        });
      }
    }

    resetProductForm();
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      image: product.image
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = (id) => {
    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Konfirmasi Hapus',
      message: 'Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.',
      actions: [
        {
          label: 'Batal',
          type: 'secondary'
        },
        {
          label: 'Hapus',
          type: 'danger',
          onClick: async () => {
            console.log('[DELETE] ========== START DELETE ==========');
            console.log('[DELETE] Product ID:', id);
            setIsLoading(true);
            setLoadingMessage('Menghapus produk...');
            
            try {
              console.log('[DELETE] Sending delete request to backend');
              const result = await productAPI.delete(id);
              console.log('[DELETE] ✓ Backend response received:', result.success);
              
              if (result.success) {
                console.log('[DELETE] ✓ Delete successful, waiting for database to commit...');
                setLoadingMessage('Memperbarui daftar produk...');
                
                // IMPORTANT: Wait longer for database to fully commit
                console.log('[DELETE] Waiting 800ms for backend to persist...');
                await new Promise(resolve => setTimeout(resolve, 800));
                
                console.log('[DELETE] Now reloading products from backend...');
                const reloadSuccess = await reloadProducts(false);
                console.log('[DELETE] ✓ Reload result:', reloadSuccess);
                
                if (reloadSuccess) {
                  console.log('[DELETE] ✓ Data refreshed successfully');
                  
                  // Small delay before closing form and showing success
                  await new Promise(resolve => setTimeout(resolve, 200));
                  setIsLoading(false);
                  setLoadingMessage('');
                  
                  setModal({
                    isOpen: true,
                    type: 'success',
                    title: 'Berhasil!',
                    message: 'Produk berhasil dihapus. Halaman akan dimuat ulang...',
                    actions: [{ 
                      label: 'OK', 
                      type: 'primary',
                      onClick: () => {
                        console.log('[DELETE] User clicked OK, reloading page...');
                        window.location.reload();
                      }
                    }]
                  });
                  console.log('[DELETE] ========== END DELETE (SUCCESS) ==========');
                } else {
                  throw new Error('Gagal memperbarui daftar produk setelah delete');
                }
              } else {
                throw new Error(result.message || 'Delete failed');
              }
            } catch (error) {
              console.error('[DELETE] ❌ Error:', error);
              setIsLoading(false);
              setLoadingMessage('');
              console.log('[DELETE] ========== END DELETE (ERROR) ==========');
              
              setModal({
                isOpen: true,
                type: 'error',
                title: 'Gagal!',
                message: `Error: ${error.response?.data?.message || error.message || 'Delete gagal'}`,
                actions: [{ label: 'OK', type: 'primary' }]
              });
            }
          }
        }
      ]
    });
  };

  const resetProductForm = () => {
    setNewProduct({ name: '', price: '', stock: '', category: 'Kebutuhan Dapur', image: '' });
    setEditingProduct(null);
    setSelectedOutletsForProduct([]);
    setShowProductForm(false);
  };

  // Outlet switching
  const handleChangeOutlet = (outletId) => {
    setCurrentOutletId(outletId);
    resetProductForm();
  };

  // Get simple statistics
  const productStats = {
    total: outletProducts.length,
    outOfStock: outletProducts.filter(p => p.stock === 0).length,
    lowStock: outletProducts.filter(p => p.stock > 0 && p.stock < 5).length
  };

  return (
    <div className="admin-dashboard">
      <AlertModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        actions={modal.actions}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f0f0f0',
              borderTop: '4px solid #FF6B6B',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }} />
            <p style={{ margin: '0', color: '#333', fontSize: '16px', fontWeight: 'bold' }}>
              {loadingMessage || 'Loading...'}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🏪 Admin Dashboard</h1>
          <p>Kelola produk dan karyawan</p>
        </div>
        <div className="header-actions">
          <button 
            className="logout-btn" 
            onClick={() => {
              console.log('[MANUAL REFRESH] User clicked refresh button');
              reloadProducts(true);
            }}
            style={{ marginRight: '10px', backgroundColor: '#4ECDC4' }}
            title="Refresh data dari server"
          >
            🔄 Refresh
          </button>
          <button className="logout-btn" onClick={() => setLogoutModal(true)}>Keluar</button>
        </div>
      </div>

      {/* Outlet Selector - Show outlet info and buttons if multiple outlets */}
      {userOutlets && userOutlets.length > 0 && (
        <div className="outlet-selector" style={{ marginBottom: '20px', padding: '0 20px' }}>
          {userOutlets.length > 1 ? (
            // Multiple outlets: Show button selector
            <>
              {console.log('[AdminDashboard] Rendering outlet buttons for', userOutlets.length, 'outlets')}
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '15px 20px', 
                borderRadius: '8px',
                border: '2px solid #FF6B6B',
                borderLeft: '5px solid #FF6B6B'
              }}>
                <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block', color: '#333', fontSize: '14px' }}>
                  📍 Pilih Outlet Untuk Dikelola:
                </label>
                <div className="outlet-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {userOutlets.map(outlet => (
                    <button
                      key={outlet.id}
                      className={`outlet-btn ${currentOutletId === outlet.id ? 'active' : ''}`}
                      onClick={() => handleChangeOutlet(outlet.id)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '6px',
                        border: currentOutletId === outlet.id ? '2px solid #FF6B6B' : '2px solid #ddd',
                        backgroundColor: currentOutletId === outlet.id ? '#FFE0E0' : '#fff',
                        color: currentOutletId === outlet.id ? '#FF6B6B' : '#666',
                        fontWeight: currentOutletId === outlet.id ? 'bold' : 'normal',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontSize: '13px'
                      }}
                    >
                      {outlet.name} {currentOutletId === outlet.id && '✓'}
                    </button>
                  ))}
              </div>
              </div>
            </>
          ) : (
            // Single outlet: Show info box
            <div style={{ 
              backgroundColor: '#f0f9ff', 
              padding: '12px 16px', 
              borderRadius: '8px',
              border: '2px solid #4ECDC4',
              color: '#333',
              fontSize: '14px'
            }}>
              <span style={{ fontWeight: 'bold', color: '#4ECDC4', marginRight: '8px' }}>📍</span> 
              <span>Outlet Aktif: <strong>{userOutlets[0]?.name}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Produk
        </button>
        <button
          className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          👥 Karyawan
        </button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {activeTab === 'products' && (
          <div className="products-tab">
            {/* Tab Title with Outlet Info */}
            <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #f0f0f0' }}>
              <h2 style={{ margin: '0 0 5px 0', color: '#333' }}>
                📦 Daftar Produk {currentOutletData?.name && (
                  <span style={{ color: '#FF6B6B' }}>- {currentOutletData.name}</span>
                )}
              </h2>
              <p style={{ margin: '5px 0 0 0', color: '#999', fontSize: '14px' }}>
                Kelola produk untuk outlet {userOutlets && userOutlets.length > 1 ? 'ini' : currentOutletData?.name}
              </p>
            </div>

            {/* Header dengan Search & Add Button */}
            <div className="products-header">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
              <button
                className="add-product-btn"
                onClick={() => {
                  resetProductForm();
                  setShowProductForm(true);
                }}
              >
                ➕ Tambah Produk Baru
              </button>
            </div>

            {/* Product Form Modal */}
            {showProductForm && (
              <div className="product-form-modal">
                <div className="form-overlay" onClick={resetProductForm}></div>
                <div className="form-modal">
                  <h3>{editingProduct ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}</h3>
                  
                  <div className="form-group">
                    <label>Nama Produk</label>
                    <input
                      type="text"
                      placeholder="Nama produk"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Kategori</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      >
                        <option value="Kebutuhan Dapur">Kebutuhan Dapur</option>
                        <option value="Kebutuhan Rumah">Kebutuhan Rumah</option>
                        <option value="Makanan">Makanan</option>
                        <option value="Minuman">Minuman</option>
                        <option value="Rokok">Rokok</option>
                        <option value="Lain-lain">Lain-lain</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Harga (Rp)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Stok</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>URL Gambar Produk</label>
                    <input
                      type="text"
                      placeholder="https://contoh.com/gambar.jpg"
                      value={newProduct.image}
                      onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    />
                    <small style={{ color: '#718096', marginTop: '4px', display: 'block' }}>
                      💡 Paste URL gambar dari internet
                    </small>
                  </div>

                  {newProduct.image && (
                    <div className="form-group">
                      <label>Preview Gambar</label>
                      <div style={{ 
                        width: '100%', 
                        height: '150px', 
                        borderRadius: '8px', 
                        overflow: 'hidden', 
                        backgroundColor: '#f8faff',
                        border: '1px solid #e0e6ed'
                      }}>
                        <img 
                          src={newProduct.image} 
                          alt="Preview" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {!editingProduct && userOutlets && userOutlets.length > 1 && (
                    <div className="form-group">
                      <label>Pilih Outlet untuk Produk Ini</label>
                      <div className="outlet-checkboxes">
                        {userOutlets.map(outlet => (
                          <div key={outlet.id} className="checkbox-item">
                            <input
                              type="checkbox"
                              id={`outlet-${outlet.id}`}
                              checked={selectedOutletsForProduct.includes(outlet.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedOutletsForProduct([...selectedOutletsForProduct, outlet.id]);
                                } else {
                                  setSelectedOutletsForProduct(selectedOutletsForProduct.filter(id => id !== outlet.id));
                                }
                              }}
                            />
                            <label htmlFor={`outlet-${outlet.id}`}>{outlet.name}</label>
                          </div>
                        ))}
                      </div>
                      {selectedOutletsForProduct.length > 0 && (
                        <small style={{ color: '#48bb78', marginTop: '8px', display: 'block' }}>
                          ✓ Produk akan ditambahkan ke {selectedOutletsForProduct.length} outlet
                        </small>
                      )}
                    </div>
                  )}

                  <div className="form-actions">
                    <button className="btn-cancel" onClick={resetProductForm}>Batal</button>
                    <button className="btn-save" onClick={handleSaveProduct}>
                      {editingProduct ? 'Perbarui' : 'Simpan'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid (Card Layout) */}
            <div className="products-grid-container">
              {(() => {
                console.log('RENDERING PRODUCTS - filteredProducts.length:', filteredProducts.length);
                console.log('filteredProducts:', filteredProducts);
                console.log('all products:', products);
                console.log('currentOutletId:', currentOutletId);
                console.log('outletProducts:', outletProducts);
                return null;
              })()}
              {filteredProducts.length > 0 ? (
                <div className="products-grid">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className={`product-card ${product.stock === 0 ? 'out-of-stock' : product.stock < 5 ? 'low-stock' : ''}`}>
                      {/* Card Image */}
                      <div className="product-card-image">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=No+Image' }}
                        />
                      </div>

                      {/* Card Badge */}
                      <div className="product-card-badge">
                        <span className={`category-badge ${product.stock === 0 ? 'empty' : product.stock < 5 ? 'low' : 'ok'}`}>
                          {product.category}
                        </span>
                      </div>

                      {/* Card Info */}
                      <div className="product-card-info">
                        <h3>{product.name}</h3>
                        <div className="product-card-price">Rp {product.price.toLocaleString('id-ID')}</div>
                        
                        <div className="product-card-stock">
                          <div className="stock-label">Stok Tersedia</div>
                          <div className={`stock-display ${product.stock === 0 ? 'empty' : product.stock < 5 ? 'low' : 'ok'}`}>
                            {product.stock} unit
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="product-card-actions">
                        <button 
                          className="card-action-btn edit"
                          onClick={() => handleEditProduct(product)}
                          title="Edit"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="card-action-btn delete"
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Hapus"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-products-container">
                  <p className="no-products">📦 Belum ada produk</p>
                  <p className="no-products-subtitle">Tambahkan produk baru untuk memulai</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="employees-tab">
            {/* Tab Title with Outlet Info */}
            <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #f0f0f0' }}>
              <h2 style={{ margin: '0 0 5px 0', color: '#333' }}>
                👥 Daftar Karyawan {currentOutletData?.name && (
                  <span style={{ color: '#FF6B6B' }}>- {currentOutletData.name}</span>
                )}
              </h2>
              <p style={{ margin: '5px 0 0 0', color: '#999', fontSize: '14px' }}>
                Lihat karyawan yang bertugas di outlet {userOutlets && userOutlets.length > 1 ? 'ini' : currentOutletData?.name}
              </p>
            </div>
            
            <div className="employees-list">
              {outletEmployees.length > 0 ? (
                <div className="employees-grid">
                  {outletEmployees.map((emp) => (
                    <div key={emp.id} className="employee-card">
                      <div className="employee-card-header">
                        <h4>{emp.name}</h4>
                        <span className={`status-badge ${emp.status}`}>
                          {emp.status === 'active' ? '✅ Aktif' : '❌ Nonaktif'}
                        </span>
                      </div>
                      <div className="employee-details">
                        <p><strong>Email:</strong> {emp.email}</p>
                        <p><strong>Role:</strong> <span className={`role-badge role-${emp.role}`}>
                          {emp.role === 'admin' ? '👨‍💼 Admin' : '👨‍💻 Kasir'}
                        </span></p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <p>Belum ada karyawan di outlet ini</p>
                  {employees.length === 0 && <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>ℹ️ Tidak ada data karyawan. Buat karyawan melalui dashboard owner.</p>}
                  {employees.length > 0 && currentOutletId && <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>ℹ️ Total karyawan sistem: {employees.length}. Pilih outlet lain atau hubungi owner untuk assign karyawan.</p>}
                </div>
              )}
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

export default AdminDashboard;
