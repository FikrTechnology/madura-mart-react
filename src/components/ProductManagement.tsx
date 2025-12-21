import React, { useState, FC, ChangeEvent, FormEvent } from 'react';
import '../styles/ProductManagement.css';
import AlertModal, { AlertAction } from './AlertModal';
import { Product, Outlet } from '../types';
import { productAPI } from '../services/api';

interface ProductManagementProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
  currentOutlet: Outlet | null;
  onLogout: () => void;
  onSwitchOutlet: (outletId: string) => void;
  userOutlets: Outlet[];
}

interface FormData {
  name: string;
  price: number | string;
  category: string;
  stock: number | string;
  image: string;
}

interface AlertState {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  actions: AlertAction[];
}

/**
 * Product Management Component
 * Untuk create, read, update, delete products per outlet
 */
const ProductManagement: FC<ProductManagementProps> = ({
  products,
  setProducts,
  currentOutlet,
  onLogout,
  onSwitchOutlet,
  userOutlets,
}) => {
  const [activeTab, setActiveTab] = useState<string>('list');
  const [modal, setModal] = useState<AlertState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    actions: [],
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showOutletPicker, setShowOutletPicker] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: '',
    category: 'Kebutuhan Dapur',
    stock: '',
    image: '',
  });

  const outletProducts = products.filter(
    (p) => p.outletId === currentOutlet?.id
  );

  const categories = [
    'Kebutuhan Dapur',
    'Kebutuhan Rumah',
    'Makanan',
    'Minuman',
    'Rokok',
    'Lain-lain',
  ];

  /**
   * Handle form input change
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'price' || name === 'stock'
          ? parseInt(value) || 0
          : value,
    }));
  };

  /**
   * Handle edit product
   */
  const handleEdit = (product: Product): void => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image || '',
    });
    setImagePreview(product.image || null);
    setActiveTab('form');
  };

  /**
   * Handle save product (create atau update)
   */
  const handleSave = (): void => {
    if (!currentOutlet || !formData.name || !formData.price || !formData.stock) {
      setModal({
        isOpen: true,
        type: 'warning',
        title: 'Validasi Error',
        message: 'Semua field harus diisi',
        actions: [],
      });
      return;
    }

    if (editingId) {
      // Update
      setProducts(
        products.map((p) =>
          p.id === editingId
            ? {
                ...p,
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
              }
            : p
        )
      );
    } else {
      // Add new
      const newProduct: Product = {
        id: `prod_${Date.now()}`,
        outletId: currentOutlet.id,
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        stock: Number(formData.stock),
        image:
          formData.image ||
          'https://images.unsplash.com/photo-1599599810694-b308981df39e?w=300&h=300&fit=crop',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProducts([...products, newProduct]);
    }

    setEditingId(null);
    setFormData({
      name: '',
      price: '',
      category: 'Kebutuhan Dapur',
      stock: '',
      image: '',
    });
    setImagePreview(null);
    setActiveTab('list');

    setModal({
      isOpen: true,
      type: 'success',
      title: 'Berhasil!',
      message: editingId
        ? 'Produk berhasil diupdate'
        : 'Produk berhasil ditambahkan',
      actions: [],
    });
  };

  /**
   * Handle delete product
   */
  const handleDelete = (id: string): void => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Konfirmasi Hapus',
      message: `Apakah Anda yakin ingin menghapus "${product.name}"?`,
      actions: [
        {
          label: 'Hapus',
          type: 'danger',
          onClick: async () => {
            try {
              // Delete from backend first
              await productAPI.delete(id);
              
              // Then remove from state
              setProducts(products.filter((p) => p.id !== id));
              setModal({
                isOpen: true,
                type: 'success',
                title: 'Berhasil!',
                message: 'Produk berhasil dihapus dari database!',
                actions: [],
              });
            } catch (error) {
              console.error('Error deleting product:', error);
              const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus produk dari database';
              setModal({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: errorMessage,
                actions: [{ label: 'OK', type: 'primary' }],
              });
            }
          },
        },
      ],
    });
  };

  /**
   * Handle cancel form
   */
  const handleCancel = (): void => {
    setEditingId(null);
    setFormData({
      name: '',
      price: '',
      category: 'Kebutuhan Dapur',
      stock: '',
      image: '',
    });
    setImagePreview(null);
    setActiveTab('list');
  };

  return (
    <div className="product-management-container">
      {/* Header */}
      <div className="pm-header">
        <h1>📦 Product Management</h1>
        <div className="header-actions">
          <div className="outlet-selector">
            <p>Outlet: <strong>{currentOutlet?.name}</strong></p>
            {userOutlets.length > 1 && (
              <button onClick={() => setShowOutletPicker(true)}>
                Switch Outlet
              </button>
            )}
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="pm-tabs">
        <button
          className={`tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 Product List ({outletProducts.length})
        </button>
        <button
          className={`tab ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: '',
              price: '',
              category: 'Kebutuhan Dapur',
              stock: '',
              image: '',
            });
            setActiveTab('form');
          }}
        >
          ➕ {editingId ? 'Edit' : 'Add'} Product
        </button>
      </div>

      {/* Content */}
      <div className="pm-content">
        {activeTab === 'list' && (
          <div className="products-list">
            {outletProducts.length === 0 ? (
              <p>Belum ada produk untuk outlet ini</p>
            ) : (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Stok</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {outletProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>Rp {product.price.toLocaleString('id-ID')}</td>
                      <td>{product.stock}</td>
                      <td>
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'form' && (
          <div className="product-form">
            <div className="form-group">
              <label>Nama Produk</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama produk"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Kategori</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Harga</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Stok</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://..."
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="image-preview"
                />
              )}
            </div>
            <div className="form-actions">
              <button className="btn-save" onClick={handleSave}>
                {editingId ? 'Update' : 'Add'} Product
              </button>
              <button className="btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, isOpen: false })}
        actions={modal.actions}
      />
    </div>
  );
};

export default ProductManagement;
