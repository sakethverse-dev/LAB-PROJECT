import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Calendar,
  CreditCard,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  Clock,
  Truck,
} from 'lucide-react';
import { getUserOrdersApi } from '../services/api';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUserOrdersApi();
      if (res.data && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.response?.data?.message || 'Unable to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'badge-success';
      case 'SHIPPED':
      case 'CONFIRMED':
        return 'badge-primary';
      case 'PLACED':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
          <Package size={14} style={{ marginRight: '0.35rem' }} /> Order History
        </span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.25rem' }}>
          My Orders
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.25rem' }}>
          Track past and active purchases, check delivery addresses and view payment receipts.
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="state-box" id="orders-loading-state">
          <div className="spinner"></div>
          <h3 className="state-title">Loading your orders...</h3>
          <p className="state-desc">Fetching your purchase history from the database</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="state-box" id="orders-error-state">
          <div className="state-icon" style={{ color: 'var(--error)' }}>
            <AlertCircle size={48} />
          </div>
          <h3 className="state-title">Could not load orders</h3>
          <p className="state-desc">{error}</p>
          <button onClick={fetchOrders} className="btn btn-primary" id="orders-retry-btn">
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="state-box" id="orders-empty-state">
          <div className="state-icon" style={{ color: 'var(--primary)' }}>
            <Package size={56} />
          </div>
          <h2 className="state-title">You have not placed any orders yet</h2>
          <p className="state-desc" style={{ maxWidth: '420px', margin: '0.5rem auto 1.75rem' }}>
            When you complete checkout and make payments, your confirmed orders will appear here.
          </p>
          <Link to="/products" className="btn btn-primary" id="orders-start-shopping-btn" style={{ padding: '0.85rem 1.75rem' }}>
            <ShoppingBag size={18} />
            <span>Start Shopping</span>
          </Link>
        </div>
      ) : (
        /* Order Cards List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }} id="orders-list">
          {orders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={order._id}
                className="profile-card"
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  padding: '1.75rem',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Order Top Bar */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        padding: '0.5rem',
                        background: 'var(--bg-card-hover)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--primary)',
                      }}
                    >
                      <Package size={22} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Order ID</span>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }}>
                        #{order._id}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <Calendar size={15} />
                      <span>{formattedDate}</span>
                    </div>

                    <span className={`badge ${getStatusBadgeClass(order.status)}`} style={{ fontWeight: 700, fontSize: '0.78rem' }}>
                      {order.status}
                    </span>

                    <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`} style={{ fontWeight: 700, fontSize: '0.78rem' }}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                          alt={item.name}
                          style={{
                            width: '40px',
                            height: '40px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-card-hover)',
                          }}
                        />
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{item.name}</span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginLeft: '0.5rem' }}>
                            × {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom Bar: Total & View Details Link */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '1rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Total Amount: </span>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginLeft: '0.35rem' }}>
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <Link
                    to={`/orders/${order._id}`}
                    className="btn btn-secondary btn-sm"
                    id={`view-order-${order._id}-btn`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <span>View Details</span>
                    <ChevronRight size={15} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
