import React from 'react';
import '../styles/ProductCard.css';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        <span className="product-category">{product.category}</span>
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        
        <div className="product-footer">
          <div className="product-price">
            Rp {product.price.toLocaleString('id-ID')}
          </div>
          <button
            className="add-to-cart-btn"
            onClick={() => onAddToCart(product)}
          >
            + Keranjang
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
