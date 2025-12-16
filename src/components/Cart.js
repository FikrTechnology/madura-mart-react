import React, { useState } from 'react';
import '../styles/Cart.css';

const Cart = ({ items, onRemoveItem, onUpdateQuantity, onClearCart, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.1); // PPN 10%
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (!amountPaid || parseFloat(amountPaid) < total) {
      alert('Jumlah pembayaran tidak valid!');
      return;
    }

    const change = parseFloat(amountPaid) - total;
    alert(
      `Transaksi Berhasil!\n\nSubtotal: Rp ${subtotal.toLocaleString('id-ID')}\nPajak: Rp ${tax.toLocaleString('id-ID')}\nTotal: Rp ${total.toLocaleString('id-ID')}\nDibayar: Rp ${parseFloat(amountPaid).toLocaleString('id-ID')}\nKembali: Rp ${change.toLocaleString('id-ID')}`
    );
    
    // Reset cart
    onClearCart();
    setAmountPaid('');
    onClose();
  };

  return (
    <aside className="cart-sidebar">
      <div className="cart-header">
        <h2>Keranjang Belanja</h2>
        <button className="cart-close-btn" onClick={onClose}>✕</button>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <p>Keranjang masih kosong</p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p>Rp {item.price.toLocaleString('id-ID')}</p>
                </div>

                <div className="cart-item-quantity">
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="qty-btn"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value))}
                    className="qty-input"
                  />
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-subtotal">
                  Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                </div>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="remove-btn"
                >
                  🗑️
                </button>
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

          {/* Payment Section */}
          <div className="payment-section">
            <div className="payment-method">
              <label>Metode Pembayaran:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Tunai</option>
                <option value="card">Kartu</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            <div className="amount-paid">
              <label>Jumlah Dibayar:</label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="Masukkan jumlah"
              />
            </div>

            {amountPaid && (
              <div className="change-display">
                Kembalian: Rp {(Math.max(0, parseFloat(amountPaid) - total)).toLocaleString('id-ID')}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="cart-actions">
            <button className="clear-cart-btn" onClick={onClearCart}>
              Bersihkan Keranjang
            </button>
            <button className="checkout-btn" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        </>
      )}
    </aside>
  );
};

export default Cart;
