import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Truck,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle,
  MapPin,
  Phone,
  User,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createPaymentOrderApi, verifyPaymentApi } from '../services/api';
import { loadRazorpayScript } from '../utils/loadRazorpay';

export const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, subtotal, shipping, grandTotal, totalItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Phone number is required';
    } else if (cleanPhone.length !== 10) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    const cleanPincode = formData.pincode.trim().replace(/\D/g, '');
    if (!cleanPincode) {
      newErrors.pincode = 'Pincode is required';
    } else if (cleanPincode.length !== 6) {
      newErrors.pincode = 'Pincode must contain 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setApiError('Your cart is empty. Please add items to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Ensure Razorpay checkout script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        setApiError('Unable to load Razorpay payment gateway. Please check your internet connection.');
        setIsSubmitting(false);
        return;
      }

      // 2. Call backend to create ShopKart order and Razorpay order
      const res = await createPaymentOrderApi({
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      });

      const { shopKartOrderId, razorpayOrderId, order_id, amount, currency, key } = res.data;
      const effectiveRzpOrderId = razorpayOrderId || order_id;
      const effectiveKey = key || import.meta.env.VITE_RAZORPAY_KEY_ID;

      // 3. Configure Razorpay Standard Checkout modal
      const options = {
        key: effectiveKey,
        amount: amount,
        currency: currency || 'INR',
        name: 'ShopKart',
        description: `Order #${shopKartOrderId}`,
        order_id: effectiveRzpOrderId,
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
          email: user?.email || '',
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setApiError('Payment cancelled: Checkout modal was closed.');
          },
        },
        handler: async function (response) {
          try {
            setIsVerifying(true);
            // 4. Send payment details to backend for signature verification
            const verifyRes = await verifyPaymentApi({
              shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              // 5. Clear global cart state and navigate to Order Success page
              clearCart();
              navigate(`/order-success/${shopKartOrderId}`, {
                state: { order: verifyRes.data.order },
                replace: true,
              });
            } else {
              setApiError(verifyRes.data?.message || 'Payment signature verification failed.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            setApiError(err.response?.data?.message || 'Payment verification failed on server.');
          } finally {
            setIsVerifying(false);
            setIsSubmitting(false);
          }
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', function (response) {
        console.error('Payment Failed:', response.error);
        setApiError(response.error?.description || 'Payment transaction failed. Please try again.');
        setIsSubmitting(false);
      });

      paymentObject.open();
    } catch (err) {
      console.error('Create order error:', err);
      setApiError(err.response?.data?.message || 'Failed to initiate order. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="state-box" id="checkout-empty-cart">
          <div className="state-icon" style={{ color: 'var(--primary)' }}>
            <ShoppingBag size={56} />
          </div>
          <h2 className="state-title">Your Cart is Empty</h2>
          <p className="state-desc" style={{ maxWidth: '420px', margin: '0.5rem auto 1.75rem' }}>
            You cannot proceed to checkout with an empty cart. Please add products to your cart first.
          </p>
          <Link to="/products" className="btn btn-primary" id="checkout-browse-btn">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Back Link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/cart"
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
          <span>Back to Cart</span>
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
          <ShieldCheck size={14} style={{ marginRight: '0.35rem' }} /> Secure Checkout
        </span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.25rem' }}>
          Checkout & Shipping
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.25rem' }}>
          Enter delivery address and review items before making payment via Razorpay.
        </p>
      </div>

      {/* Error Alert */}
      {apiError && (
        <div
          id="checkout-error-banner"
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#fca5a5',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{apiError}</span>
        </div>
      )}

      {/* 2-Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2.5rem',
          alignItems: 'start',
        }}
        className="checkout-layout"
      >
        <style>{`
          @media (min-width: 960px) {
            .checkout-layout {
              grid-template-columns: 1.6fr 1fr !important;
            }
          }
        `}</style>

        {/* Left Column: Shipping Details Form */}
        <div
          className="profile-card"
          style={{
            background: 'var(--bg-card)',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
            <MapPin size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Shipping Address</h2>
          </div>

          <form id="checkout-shipping-form" onSubmit={handlePlaceOrder}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {/* Full Name */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="shipping-fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Sharma"
                  className="input-field"
                  style={{ width: '100%', borderColor: errors.fullName ? 'var(--error)' : undefined }}
                />
                {errors.fullName && <span style={{ color: 'var(--error)', fontSize: '0.78rem' }}>{errors.fullName}</span>}
              </div>

              {/* Phone */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Phone Number (10 digits) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="shipping-phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  maxLength={10}
                  className="input-field"
                  style={{ width: '100%', borderColor: errors.phone ? 'var(--error)' : undefined }}
                />
                {errors.phone && <span style={{ color: 'var(--error)', fontSize: '0.78rem' }}>{errors.phone}</span>}
              </div>

              {/* Address Line 1 */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Flat, House no., Building, Street *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  id="shipping-addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="e.g. 22 MG Road, Koramangala"
                  className="input-field"
                  style={{ width: '100%', borderColor: errors.addressLine1 ? 'var(--error)' : undefined }}
                />
                {errors.addressLine1 && <span style={{ color: 'var(--error)', fontSize: '0.78rem' }}>{errors.addressLine1}</span>}
              </div>

              {/* City */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  id="shipping-city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Bengaluru"
                  className="input-field"
                  style={{ width: '100%', borderColor: errors.city ? 'var(--error)' : undefined }}
                />
                {errors.city && <span style={{ color: 'var(--error)', fontSize: '0.78rem' }}>{errors.city}</span>}
              </div>

              {/* State */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  id="shipping-state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Karnataka"
                  className="input-field"
                  style={{ width: '100%', borderColor: errors.state ? 'var(--error)' : undefined }}
                />
                {errors.state && <span style={{ color: 'var(--error)', fontSize: '0.78rem' }}>{errors.state}</span>}
              </div>

              {/* Pincode */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Pincode (6 digits) *
                </label>
                <input
                  type="text"
                  name="pincode"
                  id="shipping-pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="560001"
                  maxLength={6}
                  className="input-field"
                  style={{ width: '100%', borderColor: errors.pincode ? 'var(--error)' : undefined }}
                />
                {errors.pincode && <span style={{ color: 'var(--error)', fontSize: '0.78rem' }}>{errors.pincode}</span>}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="pay-razorpay-btn"
              disabled={isSubmitting || isVerifying}
              className="btn btn-primary btn-block"
              style={{
                padding: '1rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                marginTop: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {isSubmitting || isVerifying ? (
                <>
                  <Loader2 size={20} className="spinning" />
                  <span>{isVerifying ? 'Verifying Payment Signature...' : 'Connecting to Razorpay...'}</span>
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  <span>Pay ₹{grandTotal.toLocaleString('en-IN')} with Razorpay</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div
          className="profile-card"
          style={{
            background: 'var(--bg-card)',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            position: 'sticky',
            top: '90px',
          }}
        >
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
            Order Summary ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </h2>

          {/* Items List */}
          <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingRight: '0.25rem' }}>
            {cartItems.map((item) => {
              const product = item.product || {};
              const price = product.price || 0;
              const qty = item.quantity || 1;
              return (
                <div
                  key={product._id || item._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '0.75rem',
                  }}
                >
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                    alt={product.name}
                    style={{
                      width: '48px',
                      height: '48px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-card-hover)',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Qty: {qty} × ₹{price.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                    ₹{(price * qty).toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <span>Items Subtotal:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <span>Delivery Fee:</span>
              <span style={{ color: shipping === 0 ? 'var(--success)' : 'var(--text-primary)', fontWeight: 600 }}>
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '0.9rem',
                marginTop: '0.25rem',
              }}
            >
              <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>Total Payable:</span>
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

          {/* Trust Guarantees */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={16} color="var(--success)" />
              <span>Razorpay Verified 256-bit Encrypted Payment</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Truck size={16} color="var(--primary)" />
              <span>Free delivery on orders above ₹2,999</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
