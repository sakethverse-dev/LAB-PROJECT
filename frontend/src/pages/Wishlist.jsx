import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, RefreshCw, AlertCircle, ShoppingBag } from 'lucide-react';
import { getWishlistApi, removeFromWishlistApi } from '../services/api';
import WishlistCard from '../components/WishlistCard';

export const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getWishlistApi();
      if (res.data && Array.isArray(res.data.wishlist)) {
        setWishlist(res.data.wishlist);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error('Fetch Wishlist Error:', err);
      setError('Unable to load wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlistApi(productId);
      // Update state immediately without page reload
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
      setNotice('Product removed from wishlist');
      setTimeout(() => {
        setNotice('');
      }, 2500);
    } catch (err) {
      console.error('Remove item error:', err);
      setError(err.response?.data?.message || 'Failed to remove product from wishlist');
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-primary">
            <Heart size={14} style={{ marginRight: '0.35rem' }} fill="currentColor" /> Saved Collection
          </span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.25rem' }}>
          My Wishlist
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '0.25rem' }}>
          {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved for later
        </p>
      </div>

      {notice && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <span>{notice}</span>
        </div>
      )}

      {/* State Handlers */}
      {loading ? (
        <div className="state-box" id="wishlist-loading-state">
          <div className="spinner"></div>
          <h3 className="state-title">Loading your wishlist...</h3>
          <p className="state-desc">Retrieving your saved items from the server</p>
        </div>
      ) : error ? (
        <div className="state-box" id="wishlist-error-state">
          <div className="state-icon" style={{ color: 'var(--error)' }}>
            <AlertCircle size={48} />
          </div>
          <h3 className="state-title">Something went wrong.</h3>
          <p className="state-desc">{error}</p>
          <button onClick={fetchWishlist} className="btn btn-primary" id="wishlist-retry-btn">
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="state-box" id="wishlist-empty-state">
          <div className="state-icon" style={{ color: '#f43f5e' }}>
            <Heart size={52} />
          </div>
          <h2 className="state-title">Your wishlist is empty ❤️</h2>
          <p className="state-desc" style={{ maxWidth: '420px', margin: '0.5rem auto 1.75rem' }}>
            Save products you love while browsing our catalog and find them here whenever you're ready.
          </p>
          <Link to="/products" className="btn btn-primary" id="browse-products-btn" style={{ padding: '0.85rem 1.75rem' }}>
            <ShoppingBag size={18} />
            <span>Browse Products</span>
          </Link>
        </div>
      ) : (
        <div className="products-grid" id="wishlist-container">
          {wishlist.map((product) => (
            <WishlistCard
              key={product._id}
              product={product}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
