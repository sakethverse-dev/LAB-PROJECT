import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, ShieldCheck, KeyRound, ShoppingBag, LogOut, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { changePasswordApi } from '../services/api';

export const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Change Password Modal State (Bonus Challenge)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });

    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    try {
      setUpdatingPassword(true);
      await changePasswordApi({ oldPassword, newPassword });
      setPasswordMsg({ text: 'Password updated successfully!', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMsg({ text: '', type: '' });
      }, 1500);
    } catch (err) {
      setPasswordMsg({
        text: err.response?.data?.message || 'Failed to update password',
        type: 'error',
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-success" style={{ marginBottom: '0.75rem' }}>
          <ShieldCheck size={14} style={{ marginRight: '0.35rem' }} /> Authenticated Session
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.5rem' }}>
          Welcome back, {user.fullName}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '0.25rem' }}>
          Manage your ShopKart account profile, credentials, and explore the product catalog.
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar">{initials}</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {user.fullName}
          </h2>
          <span className="badge badge-primary">Verified Customer</span>

          <div style={{ marginTop: '1.75rem' }}>
            <div className="profile-info-item">
              <Mail size={18} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</div>
                <strong>{user.email}</strong>
              </div>
            </div>

            <div className="profile-info-item">
              <Phone size={18} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone Number</div>
                <strong>{user.phone}</strong>
              </div>
            </div>

            <div className="profile-info-item">
              <Calendar size={18} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Member Since</div>
                <strong>{formattedDate}</strong>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="btn btn-secondary btn-block"
              id="change-password-modal-btn"
            >
              <KeyRound size={16} />
              <span>Change Password</span>
            </button>

            <button
              onClick={handleLogout}
              className="btn btn-danger btn-block"
              id="profile-logout-btn"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Quick Actions & Discovery Teaser */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>
              Product Catalog Ready
            </span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Explore ShopKart Catalog
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Discover cutting-edge electronics, fashion essentials, best-selling engineering books, and modern home decor. Filter by category, search live, and inspect real product details.
            </p>

            <Link to="/products" className="btn btn-primary" id="explore-catalog-btn" style={{ padding: '0.85rem 1.75rem' }}>
              <ShoppingBag size={18} />
              <span>Browse All Products</span>
            </Link>
          </div>

          {/* Security & Token Info Badge */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
            }}
          >
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--success)" /> Security & Session Information
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Your session is secured with an <strong>HttpOnly JWT cookie</strong>. Client-side JavaScript cannot access the token, effectively preventing Cross-Site Scripting (XSS) credential theft.
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Modal (Bonus) */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={20} color="var(--primary)" /> Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {passwordMsg.text && (
              <div className={`alert alert-${passwordMsg.type === 'success' ? 'success' : 'error'}`}>
                {passwordMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input no-icon"
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (min 6 chars)</label>
                <input
                  type="password"
                  className="form-input no-icon"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input no-icon"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={updatingPassword}
                >
                  {updatingPassword ? 'Updating...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
