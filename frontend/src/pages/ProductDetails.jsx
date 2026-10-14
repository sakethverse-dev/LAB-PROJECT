import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, CheckCircle2, AlertCircle, Shield, Truck, RotateCcw, Heart } from 'lucide-react';
import { getProductByIdApi, toggleWishlistApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartAdding, setCartAdding] = useState(false);
  const [cartNotice, setCartNotice] = useState('');
  const [cartNoticeType, setCartNoticeType] = useState('success');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const [wishlistNotice, setWishlistNotice] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getProductByIdApi(id);
        if (res.data?.product) {
          setProduct(res.data.product);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Fetch Product Details Error:', err);
        setError(err.response?.data?.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { message: 'Please log in to add products to your cart.' },
      });
      return;
    }

    if (!product || product.stock <= 0) return;

    try {
      setCartAdding(true);
      const res = await addToCart(id);
      if (res.success) {
        setCartNotice(`Added 1 × "${product.name}" to your cart! 🛒`);
        setCartNoticeType('success');
      } else {
        setCartNotice(res.message);
        setCartNoticeType('error');
      }
      setTimeout(() => {
        setCartNotice('');
      }, 3500);
    } catch (err) {
      console.error('Cart add error:', err);
      setCartNotice('Failed to add product to cart');
      setCartNoticeType('error');
      setTimeout(() => {
        setCartNotice('');
      }, 3500);
    } finally {
      setCartAdding(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { message: 'Please log in to save products to your wishlist.' },
      });
      return;
    }

    if (wishlistSaving) return;

    try {
      setWishlistSaving(true);
      const res = await toggleWishlistApi(id);
      setIsWishlisted(res.data.saved);
      setWishlistNotice(res.data.saved ? 'Added to Wishlist ❤️' : 'Removed from Wishlist');
      setTimeout(() => {
        setWishlistNotice('');
      }, 3000);
    } catch (err) {
      console.error('Wishlist error:', err);
      setWishlistNotice(err.response?.data?.message || 'Unable to update wishlist');
      setTimeout(() => {
        setWishlistNotice('');
      }, 3000);
    } finally {
      setWishlistSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container details-wrapper">
        <div className="state-box">
          <div className="spinner"></div>
          <h3 className="state-title">Loading product details...</h3>
          <p className="state-desc">Fetching specifications from the server</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container details-wrapper">
        <div className="state-box">
          <div className="state-icon" style={{ color: 'var(--error)' }}>
            <AlertCircle size={48} />
          </div>
          <h3 className="state-title">Product Not Found</h3>
          <p className="state-desc">{error || 'The requested product does not exist or has been removed.'}</p>
          <Link to="/products" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Back to All Products</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="container details-wrapper">
      {/* Back Button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </button>
      </div>

      {/* Product Details Card */}
      <div className="details-grid">
        {/* Large Product Image */}
        <div className="details-image-container">
          <img
            src={product.image}
            alt={product.name}
            className="details-image"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60';
            }}
          />
        </div>

        {/* Product Information */}
        <div className="details-info">
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
              {product.category}
            </span>
            <h1 className="details-title">{product.name}</h1>
          </div>

          <div className="details-price">
            ₹{product.price.toLocaleString('en-IN')}
          </div>

          <p className="details-desc">{product.description}</p>

          {/* Stock Status Indicator */}
          <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Inventory Status</span>
              {isOutOfStock ? (
                <span className="badge badge-danger">Out of Stock</span>
              ) : (
                <span className="badge badge-success">{product.stock} units available</span>
              )}
            </div>
          </div>

          {/* Add to Cart & Wishlist Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleAddToCart}
                className="btn btn-primary"
                id="add-to-cart-btn"
                style={{ flex: 2, padding: '0.95rem 1.5rem', fontSize: '1.05rem' }}
                disabled={isOutOfStock || cartAdding}
              >
                <ShoppingCart size={20} />
                <span>
                  {cartAdding
                    ? 'Adding to Cart...'
                    : isOutOfStock
                    ? 'Currently Unavailable'
                    : 'Add to Shopping Cart'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleWishlistToggle}
                disabled={wishlistSaving}
                className={`btn ${isWishlisted ? 'btn-danger' : 'btn-secondary'}`}
                id="details-wishlist-toggle-btn"
                style={{ flex: 1, padding: '0.95rem 1rem', fontSize: '0.98rem' }}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                <span>{wishlistSaving ? '...' : isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
              </button>
            </div>

            {cartNotice && (
              <div
                className={`alert ${cartNoticeType === 'error' ? 'alert-danger' : 'alert-success'}`}
                style={{ margin: 0 }}
              >
                {cartNoticeType === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                <span>{cartNotice}</span>
              </div>
            )}

            {wishlistNotice && (
              <div className="alert alert-success" style={{ margin: 0 }}>
                <Heart size={18} fill="currentColor" />
                <span>{wishlistNotice}</span>
              </div>
            )}
          </div>

          {/* Value Props & Assurance */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: 'auto' }}>
            <div style={{ textAlign: 'center' }}>
              <Truck size={20} color="var(--primary)" style={{ margin: '0 auto 0.25rem' }} />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Express Shipping</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Shield size={20} color="var(--primary)" style={{ margin: '0 auto 0.25rem' }} />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>1-Year Warranty</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <RotateCcw size={20} color="var(--primary)" style={{ margin: '0 auto 0.25rem' }} />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>7-Day Returns</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
