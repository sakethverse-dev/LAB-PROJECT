import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { getOrderByIdApi, updateOrderStatusApi } from '../services/api';

export const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOrderByIdApi(id);
      setOrder(res.data?.order);
    } catch (err) {
      console.error('Fetch order details error:', err);
      setError(err.response?.data?.message || 'Unable to retrieve order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusUpdating(true);
      const res = await updateOrderStatusApi(id, newStatus);
      if (res.data?.order) {
        setOrder(res.data.order);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <div className="state-box">
          <div className="spinner"></div>
          <h3 className="state-title">Loading order details...</h3>
          <p className="state-desc">Retrieving records from the server</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <div className="state-box">
          <div className="state-icon" style={{ color: 'var(--error)' }}>
            <AlertCircle size={48} />
          </div>
          <h3 className="state-title">Order Not Found</h3>
          <p className="state-desc">{error || 'This order does not exist or you do not have permission to view it.'}</p>
          <Link to="/orders" className="btn btn-primary">
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem', maxWidth: '880px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/orders"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to My Orders</span>
        </Link>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>
            <Package size={14} style={{ marginRight: '0.35rem' }} /> Order Summary
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '-0.02em', margin: '0.2rem 0' }}>
            #{order._id}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            <Calendar size={14} />
            <span>Placed on {formattedDate}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="badge badge-success" style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem', fontWeight: 700 }}>
            {order.paymentStatus}
          </span>
          <span className="badge badge-primary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem', fontWeight: 700 }}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Items Section */}
      <div
        className="profile-card"
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '2rem',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          Order Items ({order.items?.length || 0})
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {order.items?.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '1rem',
              }}
            >
              <img
                src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                alt={item.name}
                style={{
                  width: '64px',
                  height: '64px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card-hover)',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.25rem' }}>{item.name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Unit Price: ₹{item.price?.toLocaleString('en-IN')} &nbsp;|&nbsp; Quantity: {item.quantity}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total calculation row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <div style={{ minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <span>Order Subtotal:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <span>Shipping:</span>
              <span style={{ fontWeight: 600, color: 'var(--success)' }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '1.2rem', fontWeight: 800 }}>
              <span>Grand Total:</span>
              <span style={{ color: 'var(--primary)' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Info: Shipping & Payment Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* Shipping Address */}
        <div
          className="profile-card"
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
            <MapPin size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Shipping Details</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>
              {order.shippingAddress?.fullName}
            </strong>
            {order.shippingAddress?.addressLine1}<br />
            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}<br />
            Phone: <span style={{ color: 'var(--text-primary)' }}>{order.shippingAddress?.phone}</span>
          </p>
        </div>

        {/* Razorpay Payment Metadata */}
        <div
          className="profile-card"
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
            <CreditCard size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Razorpay Payment Details</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Payment Mode:</span>
              <strong>Razorpay Test Mode</strong>
            </div>
            {order.razorpayOrderId && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Razorpay Order ID:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{order.razorpayOrderId}</span>
              </div>
            )}
            {order.razorpayPaymentId && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Razorpay Payment ID:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--success)' }}>
                  {order.razorpayPaymentId}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Payment Status:</span>
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>{order.paymentStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lab 06 Bonus: Order Progression Tester */}
      <div
        className="profile-card"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed rgba(255, 255, 255, 0.25)',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
              🌟 Lab 06 Bonus: Order Status Progression
            </h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Update order status in real-time to test lifecycle milestones.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((st) => (
              <button
                key={st}
                disabled={statusUpdating || order.status === st}
                onClick={() => handleStatusChange(st)}
                className={`btn btn-sm ${order.status === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
