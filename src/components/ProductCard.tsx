import React, { FC } from 'react';
import '../styles/ProductCard.css';
import { Product } from '../types';

export interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  cartItems: Array<{ id: string; quantity: number }>;
}

/**
 * Product Card Component
 * Menampilkan card produk dengan info harga, stok, dan kontrol quantity
 */
const ProductCard: FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onUpdateQuantity,
  cartItems,
}) => {
  const cartItem = cartItems.find((item) => item.id === product.id);
  const isSelected = cartItem ? true : false;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  /**
   * Handle add to cart button click
   */
  const handleAddClick = (): void => {
    onAddToCart(product);
  };

  /**
   * Handle quantity change
   */
  const handleQuantityChange = (newQty: number): void => {
    if (newQty > 0) {
      onUpdateQuantity(product.id, newQty);
    } else if (newQty === 0) {
      // Remove from cart if qty becomes 0
      onUpdateQuantity(product.id, 0);
    }
  };

  return (
    <div
      className={`product-card ${isSelected ? 'selected' : ''} ${
        isOutOfStock ? 'out-of-stock' : ''
      }`}
    >
      {/* Selected Tag */}
      {isSelected && <div className="selected-tag">Terpilih</div>}

      {/* Stock Badge */}
      <div
        className={`stock-badge ${
          isOutOfStock ? 'empty' : isLowStock ? 'low' : 'available'
        }`}
      >
        {isOutOfStock ? 'Habis' : `Stok: ${product.stock}`}
      </div>

      <div className={`product-image ${isOutOfStock ? 'disabled' : ''}`}>
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        <div className="product-price">
          Rp {product.price.toLocaleString('id-ID')}
        </div>

        <div className="product-footer">
          {!isSelected ? (
            <button
              className={`add-to-cart-btn ${isOutOfStock ? 'disabled' : ''}`}
              onClick={handleAddClick}
              disabled={isOutOfStock}
            >
              + Add to Cart
            </button>
          ) : (
            <div className="qty-control">
              <button
                className="qty-btn-small"
                onClick={() => handleQuantityChange(cartItem!.quantity - 1)}
              >
                −
              </button>
              <span className="qty-display">{cartItem!.quantity}</span>
              <button
                className="qty-btn-small"
                onClick={() => handleQuantityChange(cartItem!.quantity + 1)}
                disabled={cartItem!.quantity >= product.stock}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
