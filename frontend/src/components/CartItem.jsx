import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart, actionLoading } = useCart();

  const product = item.product;
  if (!product) return null;

  const isUpdating = actionLoading === product._id;
  const isMinQuantity = item.quantity <= 1;
  const isMaxQuantity = item.quantity >= product.stock;

  const itemTotal = (product.price || 0) * (item.quantity || 1);

  const handleDecrease = () => {
    if (isMinQuantity || isUpdating) return;
    updateQuantity(product._id, item.quantity - 1);
  };

  const handleIncrease = () => {
    if (isMaxQuantity || isUpdating) return;
    updateQuantity(product._id, item.quantity + 1);
  };

  const handleRemove = () => {
    if (isUpdating) return;
    removeFromCart(product._id);
  };

  return (
    <div
      className="product-card"
      id={`cart-item-${product._id}`}
      style={{
        display: 'flex',
        flexDirection: 'row',
        padding: '1.25rem',
        gap: '1.25rem',
        marginBottom: '1rem',
        alignItems: 'center',
      }}
    >
      {/* Product Image */}
      <div
        style={{
          width: '100px',
          height: '100px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          flexShrink: 0,
          background: '#000',
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60';
          }}
        />
      </div>

      {/* Product Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span className="badge badge-primary" style={{ fontSize: '0.7rem', marginBottom: '0.35rem' }}>
          {product.category}
        </span>
        <h4
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            marginBottom: '0.25rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <Link to={`/products/${product._id}`} style={{ color: 'var(--text-primary)' }}>
            {product.name}
          </Link>
        </h4>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          ₹{product.price.toLocaleString('en-IN')} each
        </div>

        {isMaxQuantity && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: 'var(--warning)',
              fontSize: '0.78rem',
              marginTop: '0.25rem',
            }}
          >
            <AlertCircle size={13} />
            <span>Max available stock reached ({product.stock})</span>
          </div>
        )}
      </div>

      {/* Quantity Controls [-] [qty] [+] */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--bg-input)',
          padding: '0.35rem 0.65rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        <button
          type="button"
          onClick={handleDecrease}
          disabled={isMinQuantity || isUpdating}
          id={`cart-decrease-${product._id}`}
          style={{
            background: 'none',
            border: 'none',
            color: isMinQuantity ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: isMinQuantity ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.25rem',
          }}
          title="Decrease quantity"
        >
          <Minus size={15} />
        </button>

        <span
          id={`cart-qty-${product._id}`}
          style={{
            fontWeight: 700,
            minWidth: '24px',
            textAlign: 'center',
            fontSize: '0.95rem',
          }}
        >
          {isUpdating ? '...' : item.quantity}
        </span>

        <button
          type="button"
          onClick={handleIncrease}
          disabled={isMaxQuantity || isUpdating}
          id={`cart-increase-${product._id}`}
          style={{
            background: 'none',
            border: 'none',
            color: isMaxQuantity ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: isMaxQuantity ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.25rem',
          }}
          title="Increase quantity"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Line Total Price */}
      <div style={{ minWidth: '100px', textAlign: 'right' }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          ₹{itemTotal.toLocaleString('en-IN')}
        </div>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={handleRemove}
        disabled={isUpdating}
        id={`cart-remove-${product._id}`}
        className="btn btn-danger btn-sm"
        style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
        title="Remove item"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default CartItem;
