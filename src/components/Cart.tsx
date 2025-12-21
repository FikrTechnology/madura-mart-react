import React, { FC, useState } from 'react';
import '../styles/Cart.css';
import { Product } from '../types';

interface CartItem extends Product {
  quantity: number;
}

interface CartProps {
  items: CartItem[];
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  onPlaceOrder: () => void;
}

/**
 * Shopping Cart Sidebar Component
 * Menampilkan items di cart, summary, dan checkout actions
 */
const Cart: FC<CartProps> = ({
  items,
  onRemoveItem,
  onUpdateQuantity,
  onClearCart,
  onPlaceOrder,
}) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.1); // PPN 10%
  const total = subtotal + tax;

  return (
    <aside className="cart-sidebar">
      {/* Cart Header */}
      <div className="cart-header">
        <h2>🛒 Keranjang</h2>
        <span className="cart-count">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <div className="empty-icon">📦</div>
          <p>Keranjang masih kosong</p>
          <p className="empty-subtitle">Tambahkan produk untuk memulai</p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>

                <div className="cart-item-header">
                  <h4>{item.name}</h4>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="remove-btn"
                  >
                    ✕
                  </button>
                </div>

                <p className="cart-item-price">
                  Rp {item.price.toLocaleString('id-ID')}
                </p>

                <div className="cart-item-footer">
                  <span className="qty-label">
                    Qty: <strong>{item.quantity}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="summary-row">
              <span>Pajak (10%):</span>
              <span>Rp {tax.toLocaleString('id-ID')}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="cart-actions">
            <button className="clear-cart-btn" onClick={onClearCart}>
              Bersihkan
            </button>
            <button className="place-order-btn" onClick={onPlaceOrder}>
              Place an Order
            </button>
          </div>
        </>
      )}
    </aside>
  );
};

export default Cart;
