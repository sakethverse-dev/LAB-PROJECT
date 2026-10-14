import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, LogIn, UserPlus, Compass, Heart, ShoppingCart, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <ShoppingBag size={20} />
          </div>
          <span>ShopKart</span>
        </Link>

        {/* Navigation Links */}
        <nav className="nav-links">
          <NavLink
            to="/products"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Compass size={18} />
            <span>Discover</span>
          </NavLink>
          <NavLink
            to="/wishlist"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            id="nav-wishlist-link"
          >
            <Heart size={18} />
            <span>Wishlist</span>
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            id="nav-cart-link"
            style={{ position: 'relative' }}
          >
            <ShoppingCart size={18} />
            <span>Cart</span>
            {isAuthenticated && totalItems > 0 && (
              <span
                id="navbar-cart-badge"
                style={{
                  background: '#ffffff',
                  color: '#000000',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  marginLeft: '0.2rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1.2,
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.35)',
                }}
              >
                {totalItems}
              </span>
            )}
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to="/orders"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              id="nav-orders-link"
            >
              <Package size={18} />
              <span>Orders</span>
            </NavLink>
          )}
          <NavLink
            to="/home"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <User size={18} />
            <span>Dashboard</span>
          </NavLink>
        </nav>

        {/* Auth CTA & Profile Area */}
        <div className="nav-auth">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Link to="/home" className="badge badge-primary" style={{ padding: '0.4rem 0.85rem', textTransform: 'none', fontWeight: 600 }}>
                {user.fullName}
              </Link>
              <button
                id="logout-button"
                onClick={handleLogout}
                className="btn btn-danger btn-sm"
                title="Log out from ShopKart"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" id="nav-login-btn">
                <LogIn size={15} />
                <span>Login</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="nav-register-btn">
                <UserPlus size={15} />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
