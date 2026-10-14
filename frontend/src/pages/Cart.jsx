import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight, RefreshCw, AlertCircle, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

export const Cart = () => {
  const {
    cartItems,
    loading,
    error,
    totalItems,
    subtotal,
    shipping,
    grandTotal,
    refreshCart,
  } = useCart();

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
          <ShoppingCart size={14} style={{ marginRight: '0.35rem' }} /> Secure Cart
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.25rem' }}>
          My Shopping Cart
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '0.25rem' }}>
          Review your items, update quantities, and proceed to checkout.
        </p>
      </div>

      {/* State Handlers */}
      {loading && cartItems.length === 0 ? (
        <div className="state-box" id="cart-loading-state">
          <div className="spinner"></div>
          <h3 className="state-title">Loading your cart...</h3>
          <p className="state-desc">Retrieving your cart items from the server</p>
        </div>
      ) : error ? (
        <div className="state-box" id="cart-error-state">
          <div className="state-icon" style={{ color: 'var(--error)' }}>
            <AlertCircle size={48} />
          </div>
          <h3 className="state-title">Unable to load your cart.</h3>
          <p className="state-desc">{error}</p>
          <button onClick={refreshCart} className="btn btn-primary" id="cart-retry-btn">
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="state-box" id="cart-empty-state">
          <div className="state-icon" style={{ color: 'var(--primary)' }}>
            <ShoppingCart size={56} />
          </div>
          <h2 className="state-title">Your cart is empty 🛒</h2>
          <p className="state-desc" style={{ maxWidth: '420px', margin: '0.5rem auto 1.75rem' }}>
            Looks like you haven't added anything yet. Explore our product catalog and find great deals!
          </p>
          <Link to="/products" className="btn btn-primary" id="cart-browse-products-btn" style={{ padding: '0.85rem 1.75rem' }}>
            <ShoppingBag size={18} />
            <span>Browse Products</span>
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2.5rem',
            alignItems: 'start',
          }}
          className="cart-layout"
        >
          <style>{`
            @media (min-width: 960px) {
              .cart-layout {
                grid-template-columns: 2fr 1fr !important;
              }
            }
          `}</style>

          {/* Left Column: List of Cart Items */}
          <div id="cart-items-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                Cart Items (<strong>{totalItems}</strong> {totalItems === 1 ? 'unit' : 'units'})
              </span>
            </div>

            {cartItems.map((item) => (
              <CartItem key={item.product?._id || item._id} item={item} />
            ))}
          </div>

          {/* Right Column: Order Summary Card */}
          <div
            className="profile-card"
            style={{
              position: 'sticky',
              top: '90px',
              padding: '2rem',
              background: 'var(--bg-card)',
            }}
          >
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                <span>Items ({totalItems}):</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                <span>Shipping / Delivery:</span>
                <span style={{ color: shipping === 0 ? 'var(--success)' : 'var(--text-primary)', fontWeight: 600 }}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>

              {shipping > 0 && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Add ₹{(3000 - subtotal).toLocaleString('en-IN')} more to unlock FREE shipping!
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '1rem',
                  marginTop: '0.5rem',
                }}
              >
                <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>Grand Total:</span>
                <span
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    background: 'var(--primary-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              to="/checkout"
              className="btn btn-primary btn-block"
              id="proceed-checkout-btn"
              style={{ padding: '0.95rem', fontSize: '1.05rem', marginBottom: '1rem' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/products"
              className="btn btn-secondary btn-block btn-sm"
              style={{ textAlign: 'center' }}
            >
              Continue Shopping
            </Link>

            {/* Trust Assurances */}
            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <ShieldCheck size={16} color="var(--success)" />
                <span>SSL 256-Bit Encrypted Secure Checkout</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Truck size={16} color="var(--primary)" />
                <span>Express delivery in 2–4 business days</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
