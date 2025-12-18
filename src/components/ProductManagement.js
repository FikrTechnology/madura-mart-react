import React, { useState } from 'react';
import '../styles/ProductManagement.css';
import AlertModal from './AlertModal';

const ProductManagement = ({ products, setProducts, currentOutlet, onLogout, onSwitchOutlet, userOutlets }) => {
  const [activeTab, setActiveTab] = useState('list');
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '', actions: [] });
  const [editingId, setEditingId] = useState(null);
  const [showOutletPicker, setShowOutletPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Kebutuhan Dapur',
    stock: '',
    image: ''
  });

  const outletProducts = products.filter(p => p.outlet_id === currentOutlet.id);

  const categories = [
    'Kebutuhan Dapur',
    'Kebutuhan Rumah',
    'Makanan',
    'Minuman',
    'Rokok',
    'Lain-lain'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseInt(value) || 0 : value
    }));
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image
    });
    setImagePreview(product.image);
    setActiveTab('form');
  };

  const handleSave = () => {
    if (editingId) {
      // Update
      setProducts(products.map(p =>
        p.id === editingId
          ? { ...p, ...formData }
          : p
      ));
    } else {
      // Add new
      const newProduct = {
        id: Math.max(...products.map(p => p.id)) + 1,
        outlet_id: currentOutlet.id,
        ...formData,
        image: formData.image || 'https://images.unsplash.com/photo-1599599810694-b308981df39e?w=300&h=300&fit=crop'
      };
      setProducts([...products, newProduct]);
    }

    setEditingId(null);
    setFormData({ name: '', price: '', category: 'Kebutuhan Dapur', stock: '', image: '' });
    setImagePreview(null);
    setActiveTab('list');
  };

  const handleDelete = (id) => {
    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Konfirmasi Hapus',
      message: 'Apakah Anda yakin ingin menghapus produk ini?',
      actions: [
        { label: 'Batal', type: 'secondary' },
        {
          label: 'Hapus',
          type: 'danger',
          onClick: () => {
            setProducts(products.filter(p => p.id !== id));
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

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', price: '', category: 'Kebutuhan Dapur', stock: '', image: '' });
    setImagePreview(null);
    setActiveTab('list');
  };

  const handleStockAdjustment = (id, adjustment) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const newStock = Math.max(0, p.stock + adjustment);
        return { ...p, stock: newStock };
      }
      return p;
    }));
  };

  const handleOutletSwitch = (outletId) => {
    if (onSwitchOutlet) {
      onSwitchOutlet(outletId);
      setShowOutletPicker(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result);
            setFormData(prev => ({
              ...prev,
              image: reader.result
            }));
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  return (
    <div className="product-management">
      <AlertModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        actions={modal.actions}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />

      {/* Outlet Picker Modal */}
      {showOutletPicker && userOutlets && userOutlets.length > 0 && (
        <div className="outlet-picker-overlay">
          <div className="outlet-picker-modal">
            <div className="outlet-picker-header">
              <h2>Ganti Outlet</h2>
              <button 
                className="outlet-picker-close"
                onClick={() => setShowOutletPicker(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="outlet-picker-list">
              {userOutlets.map(outlet => (
                <div
                  key={outlet.id}
                  className={`outlet-picker-item ${outlet.id === currentOutlet.id ? 'active' : ''}`}
                  onClick={() => handleOutletSwitch(outlet.id)}
                >
                  <div className="outlet-picker-icon">🏪</div>
                  <div className="outlet-picker-info">
                    <h3>{outlet.name}</h3>
                    <p>{outlet.address}</p>
                  </div>
                  {outlet.id === currentOutlet.id && <div className="outlet-picker-badge">✓ Aktif</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pm-header">
        <div>
          <h1>📦 Manajemen Produk</h1>
          <p className="outlet-info">Outlet: <strong>{currentOutlet.name}</strong></p>
        </div>
        <div className="pm-header-actions">
          {userOutlets && userOutlets.length > 1 && (
            <button 
              className="switch-outlet-btn" 
              onClick={() => setShowOutletPicker(true)}
            >
              🏪 Ganti Outlet
            </button>
          )}
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="pm-tabs">
        <button
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 Daftar Produk ({outletProducts.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => { setActiveTab('form'); setEditingId(null); }}
        >
          ➕ {editingId ? 'Edit' : 'Tambah'} Produk
        </button>
      </div>

      {/* Content */}
      <div className="pm-content">
        {activeTab === 'list' ? (
          <div className="products-list">
            {outletProducts.length === 0 ? (
              <div className="no-products-container">
                <p className="no-products">📦 Belum ada produk</p>
                <p className="no-products-subtitle">Tambahkan produk baru untuk memulai</p>
              </div>
            ) : (
              <div className="products-grid">
                {outletProducts.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-card-header">
                      <div className="product-id">#{product.id}</div>
                      <span className="badge">{product.category}</span>
                    </div>

                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                    </div>

                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <div className="product-price">Rp {product.price.toLocaleString('id-ID')}</div>
                      
                      <div className="stock-section">
                        <div className="stock-label">Stok</div>
                        <div className="stock-control">
                          <button
                            className="stock-btn"
                            onClick={() => handleStockAdjustment(product.id, -1)}
                            disabled={product.stock === 0}
                          >
                            −
                          </button>
                          <span className={`stock-value ${product.stock === 0 ? 'empty' : product.stock < 5 ? 'low' : ''}`}>
                            {product.stock}
                          </span>
                          <button
                            className="stock-btn"
                            onClick={() => handleStockAdjustment(product.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="product-actions">
                      <button className="edit-btn" onClick={() => handleEdit(product)}>✏️ Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(product.id)}>🗑️ Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="product-form">
            <h2>{editingId ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}</h2>

            <div className="form-group">
              <label>Nama Produk</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Contoh: Beras Premium 5kg"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Harga (Rp)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="75000"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Stok</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="25"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Foto Produk</label>
              <div className="image-upload-container" onPaste={handleImagePaste}>
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <label className="image-upload-label">
                      🖼️ Ubah Foto
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="image-upload-label">
                    📷 Pilih Foto
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '8px', textAlign: 'center' }}>
                💡 Atau paste gambar yang di-copy (Ctrl+V)
              </p>
            </div>

            <div className="form-group">
              <label>Kategori</label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button className="save-btn" onClick={handleSave}>✓ Simpan</button>
              <button className="cancel-btn" onClick={handleCancel}>✗ Batal</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
