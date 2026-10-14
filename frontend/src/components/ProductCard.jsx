import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Heart, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import { toggleWishlistApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product, initialIsWishlisted = false, onWishlistChange }) => {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [saving, setSaving] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', {
        state: { message: 'Please log in to save products to your wishlist.' },
      });
      return;
    }

    if (saving) return; // Prevent duplicate rapid clicks

    try {
      setSaving(true);
      setFeedback({ text: '', type: '' });

      const res = await toggleWishlistApi(product._id);
      const saved = res.data.saved;
      setIsWishlisted(saved);

      if (saved) {
        setFeedback({ text: 'Added to Wishlist ♥', type: 'success' });
      } else {
        setFeedback({ text: 'Removed from Wishlist', type: 'info' });
      }

      if (onWishlistChange) {
        onWishlistChange(product._id, saved);
      }

      setTimeout(() => {
        setFeedback({ text: '', type: '' });
      }, 2500);
    } catch (err) {
      console.error('Wishlist action failed:', err);
      setFeedback({
        text: err.response?.data?.message || 'Unable to save product. Please try again.',
        type: 'error',
      });
      setTimeout(() => {
        setFeedback({ text: '', type: '' });
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', {
        state: { message: 'Please log in to add products to your cart.' },
      });
      return;
    }

    if (isOutOfStock) return;

    try {
      setCartLoading(true);
      setFeedback({ text: '', type: '' });
      const result = await addToCart(product._id);

      if (result.success) {
        setFeedback({ text: 'Added to Cart 🛒', type: 'success' });
      } else {
        setFeedback({ text: result.message, type: 'error' });
      }

      setTimeout(() => {
        setFeedback({ text: '', type: '' });
      }, 2500);
    } catch (err) {
      console.error('Add to cart failed:', err);
      setFeedback({ text: 'Failed to add to cart', type: 'error' });
      setTimeout(() => {
        setFeedback({ text: '', type: '' });
      }, 3000);
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <div className="product-card" id={`product-card-${product._id}`}>
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

        {/* Heart / Wishlist Action Button Overlay */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={saving}
          id={`wishlist-toggle-${product._id}`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            border: isWishlisted ? '1px solid rgba(244, 63, 94, 0.6)' : '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: isWishlisted ? '#f43f5e' : '#cbd5e1',
          }}
        >
          <Heart
            size={18}
            fill={isWishlisted ? '#f43f5e' : 'none'}
            color={isWishlisted ? '#f43f5e' : '#cbd5e1'}
          />
        </button>
      </div>

      {/* Product Details */}
      <div className="product-content">
        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>

        <p className="product-desc-snippet">{product.description}</p>

        {/* Feedback Message Toast */}
        {feedback.text && (
          <div
            style={{
              fontSize: '0.78rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              marginBottom: '0.5rem',
              background:
                feedback.type === 'success'
                  ? 'rgba(34, 197, 94, 0.15)'
                  : feedback.type === 'error'
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(255, 255, 255, 0.12)',
              color:
                feedback.type === 'success'
                  ? '#86efac'
                  : feedback.type === 'error'
                  ? '#fca5a5'
                  : '#f4f4f5',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 size={13} />
            ) : (
              <AlertCircle size={13} />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Price */}
        <div className="product-footer">
          <div>
            <div className="product-price">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
            {isOutOfStock && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  marginTop: '0.2rem',
                }}
              >
                <span style={{ color: 'var(--error)', fontSize: '0.8rem' }}>
                  <AlertCircle size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Out of stock
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <Link
              to={`/products/${product._id}`}
              className="btn btn-secondary btn-sm"
              id={`view-details-${product._id}`}
              title="View Specifications"
            >
              <Eye size={14} />
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={cartLoading || isOutOfStock}
              className="btn btn-primary btn-sm"
              id={`add-to-cart-${product._id}`}
              title={isOutOfStock ? 'Out of stock' : 'Add to Cart'}
              style={{ padding: '0.35rem 0.65rem' }}
            >
              <ShoppingCart size={14} />
              <span>{cartLoading ? '...' : 'Add'}</span>
            </button>

            <button
              onClick={handleWishlistToggle}
              disabled={saving}
              className={`btn btn-sm ${isWishlisted ? 'btn-danger' : 'btn-secondary'}`}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              style={{ padding: '0.35rem 0.65rem' }}
            >
              <Heart
                size={14}
                fill={isWishlisted ? 'currentColor' : 'none'}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
