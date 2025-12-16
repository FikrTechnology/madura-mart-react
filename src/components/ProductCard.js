import React from 'react';
import '../styles/ProductCard.css';

const ProductCard = ({ product, onAddToCart, onUpdateQuantity, cartItems }) => {
  const cartItem = cartItems.find(item => item.id === product.id);
  const isSelected = cartItem ? true : false;

  const handleAddClick = () => {
    onAddToCart(product);
  };

  const handleQuantityChange = (newQty) => {
    if (newQty > 0) {
      onUpdateQuantity(product.id, newQty);
    } else if (newQty === 0) {
      // Remove from cart if qty becomes 0
      onUpdateQuantity(product.id, 0);
    }
  };

  return (
    <div className={`product-card ${isSelected ? 'selected' : ''}`}>
      {/* Selected Tag */}
      {isSelected && <div className="selected-tag">Terpilih</div>}

      <div className="product-image">
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
              className="add-to-cart-btn"
              onClick={handleAddClick}
            >
              + Add to Cart
            </button>
          ) : (
            <div className="qty-control">
              <button
                className="qty-btn-small"
                onClick={() => handleQuantityChange(cartItem.quantity - 1)}
              >
                −
              </button>
              <span className="qty-display">{cartItem.quantity}</span>
              <button
                className="qty-btn-small"
                onClick={() => handleQuantityChange(cartItem.quantity + 1)}
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
