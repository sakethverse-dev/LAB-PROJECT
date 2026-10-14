import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, ShoppingBag, ShieldCheck, Truck, MapPin } from 'lucide-react';
import { getOrderByIdApi } from '../services/api';

export const OrderSuccess = () => {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!order && id) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          const res = await getOrderByIdApi(id);
          setOrder(res.data?.order);
        } catch (err) {
          console.error('Fetch order error:', err);
          setError(err.response?.data?.message || 'Could not fetch order details.');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, order]);

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem 5rem', maxWidth: '800px' }}>
      {/* Success Card Header */}
      <div
        className="profile-card"
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '3rem 2rem',
          textAlign: 'center',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.8)',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.12)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--success)',
            marginBottom: '1.5rem',
          }}
        >
          <CheckCircle2 size={46} />
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Order Placed Successfully! 🎉
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
          Thank you for shopping with ShopKart. Your payment has been verified and your order is confirmed.
        </p>

        {/* Order Meta Pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1rem',
            background: 'var(--bg-card-hover)',
            borderRadius: 'var(--radius)',
            maxWidth: '560px',
            margin: '0 auto',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Order ID</span>
            <strong style={{ fontSize: '0.95rem', fontFamily: 'monospace', color: '#ffffff' }}>{id}</strong>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Payment Status</span>
            <span className="badge badge-success" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              {order?.paymentStatus || 'PAID'}
            </span>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Order Status</span>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              {order?.status || 'PLACED'}
            </span>
          </div>
        </div>
      </div>

      {/* Order Details Breakdown if loaded */}
      {order && (
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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            Purchased Items
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '0.75rem',
                }}
              >
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                  alt={item.name}
                  style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Delivery & Summary details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: 'var(--bg-card-hover)', padding: '1.25rem', borderRadius: 'var(--radius)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <MapPin size={15} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>Delivery Address</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5 }}>
                {order.shippingAddress?.fullName}<br />
                {order.shippingAddress?.addressLine1}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}<br />
                Phone: {order.shippingAddress?.phone}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Paid</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.2rem' }}>
                ₹{order.totalAmount?.toLocaleString('en-IN')}
              </div>
              {order.razorpayPaymentId && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '0.35rem' }}>
                  Ref: {order.razorpayPaymentId}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/orders" className="btn btn-primary" id="success-view-orders-btn" style={{ padding: '0.85rem 1.75rem' }}>
          <Package size={18} />
          <span>View My Orders</span>
        </Link>
        <Link to="/products" className="btn btn-secondary" id="success-continue-shopping-btn" style={{ padding: '0.85rem 1.75rem' }}>
          <ShoppingBag size={18} />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
