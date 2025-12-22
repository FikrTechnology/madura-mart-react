// @ts-nocheck
import React, { useState, useEffect } from 'react';
import '../styles/AdminDashboard.css';
import AlertModal from './AlertModal';
import { userAPI } from '../services/api';

const AdminDashboard = ({ onLogout, currentOutlet, products, setProducts, userOutlets }) => {
  const [activeTab, setActiveTab] = useState('products');
  // Initialize with currentOutlet?.id, fallback to first userOutlet
  const [currentOutletId, setCurrentOutletId] = useState(() => {
    return currentOutlet?.id || userOutlets?.[0]?.id;
  });
  
  // Modal state
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '', actions: [] });
  const [logoutModal, setLogoutModal] = useState(false);
  
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

  // Get current outlet
  const currentOutletData = outlets.find(o => o.id === currentOutletId) || currentOutlet;

  // Get outlet-specific products
  const outletProducts = products.filter(p => p.outlet_id === currentOutletId);
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
  const handleSaveProduct = () => {
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
      const updatedProducts = products.map(p =>
        p.id === editingProduct.id
          ? {
              ...editingProduct,
              name: newProduct.name,
              price: parseFloat(newProduct.price),
              stock: parseInt(newProduct.stock),
              category: newProduct.category,
              image: newProduct.image
            }
          : p
      );
      setProducts(updatedProducts);
      localStorage.setItem('madura_products', JSON.stringify(updatedProducts));
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Berhasil!',
        message: 'Produk berhasil diperbarui',
        actions: [{ label: 'OK', type: 'primary' }]
      });
    } else {
      // Add new product to multiple outlets
      const newProducts = selectedOutletsForProduct.map(outletId => ({
        id: Date.now().toString() + '_' + outletId,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        category: newProduct.category,
        image: newProduct.image,
        outlet_id: outletId,
        createdAt: new Date().toISOString()
      }));
      const updatedProducts = [...products, ...newProducts];
      setProducts(updatedProducts);
      localStorage.setItem('madura_products', JSON.stringify(updatedProducts));
      
      const outletNames = userOutlets
        .filter(o => selectedOutletsForProduct.includes(o.id))
        .map(o => o.name)
        .join(', ');
      
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Berhasil!',
        message: `Produk berhasil ditambahkan ke: ${outletNames}`,
        actions: [{ label: 'OK', type: 'primary' }]
      });
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
          onClick: () => {
            const updatedProducts = products.filter(p => p.id !== id);
            setProducts(updatedProducts);
            localStorage.setItem('madura_products', JSON.stringify(updatedProducts));
            setModal({
              isOpen: true,
              type: 'success',
              title: 'Berhasil!',
              message: 'Produk berhasil dihapus',
              actions: [{ label: 'OK', type: 'primary' }]
            });
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

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🏪 Admin Dashboard</h1>
          <p>Kelola produk dan karyawan</p>
        </div>
        <div className="header-actions">
          <button className="logout-btn" onClick={() => setLogoutModal(true)}>Keluar</button>
        </div>
      </div>

      {/* Outlet Selector - Only show if multiple outlets */}
      {userOutlets && userOutlets.length > 1 && (
        <div className="outlet-selector" style={{ marginBottom: '20px' }}>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px 20px', 
            borderRadius: '8px',
            border: '2px solid #FF6B6B',
            borderLeft: '5px solid #FF6B6B'
          }}>
            <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block', color: '#333' }}>
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
                    transition: 'all 0.3s ease'
                  }}
                >
                  {outlet.name} {currentOutletId === outlet.id && '✓'}
                </button>
              ))}
            </div>
          </div>
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
