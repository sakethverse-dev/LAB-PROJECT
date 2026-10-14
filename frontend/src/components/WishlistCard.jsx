import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

export const WishlistCard = ({ product, onRemove }) => {
  const [removing, setRemoving] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleRemoveClick = async () => {
    try {
      setRemoving(true);
      await onRemove(product._id);
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="product-card" id={`wishlist-card-${product._id}`}>
      {/* Product Image & Category Badge */}
      <div className="product-image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60';
          }}
        />
        <span className="badge badge-primary product-category-tag">
          {product.category}
        </span>
      </div>

      {/* Product Content */}
      <div className="product-content">
        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>

        <div style={{ marginTop: '0.25rem', marginBottom: '1rem' }}>
          <div className="product-price">
            ₹{product.price.toLocaleString('en-IN')}
          </div>
          <div
            className="stock-indicator"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginTop: '0.25rem',
            }}
          >
            {isOutOfStock ? (
              <span style={{ color: 'var(--error)' }}>
                <AlertCircle size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Out of stock
              </span>
            ) : isLowStock ? (
              <span style={{ color: 'var(--warning)' }}>
                <AlertCircle size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Only {product.stock} left
              </span>
            ) : (
              <span style={{ color: 'var(--success)' }}>
                <CheckCircle2 size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {product.stock} in stock
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
          <Link
            to={`/products/${product._id}`}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
            id={`wishlist-view-${product._id}`}
          >
            <Eye size={14} />
            <span>View Details</span>
          </Link>

          <button
            onClick={handleRemoveClick}
            disabled={removing}
            className="btn btn-danger btn-sm"
            id={`wishlist-remove-${product._id}`}
            title="Remove from Wishlist"
          >
            <Trash2 size={14} />
            <span>{removing ? '...' : 'Remove'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
