import crypto from 'crypto';
import mongoose from 'mongoose';
import Order from '../models/order.model.js';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';
import razorpay from '../config/razorpay.js';

// @desc    Create a pending ShopKart order and Razorpay payment order
// @route   POST /orders/create-payment-order (also POST /orders/create-order, POST /api/create-order)
export const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // 1. Validate shipping address fields
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }

    const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'All shipping address fields are required and cannot be empty',
      });
    }

    // Phone format validation (10 digits)
    const phoneClean = phone.trim().replace(/\D/g, '');
    if (phoneClean.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be a valid 10-digit number',
      });
    }

    // Pincode validation (6 digits)
    const pincodeClean = pincode.trim().replace(/\D/g, '');
    if (pincodeClean.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Pincode must contain exactly 6 digits',
      });
    }

    // 2. Load authenticated user's cart
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'User session not found. Please log in again.',
      });
    }

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items before checking out.',
      });
    }

    // 3. Load latest product data and verify stock
    const orderItems = [];
    let calculatedTotal = 0;

    for (const cartItem of customer.cart) {
      const product = await Product.findById(cartItem.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'One or more products in your cart are no longer available.',
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${cartItem.quantity}.`,
        });
      }

      const itemTotal = product.price * cartItem.quantity;
      calculatedTotal += itemTotal;

      // Historical purchase-time snapshot
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });
    }

    // Total must be at least 1 Rupee / 100 paise for Razorpay
    const amountInPaise = Math.round(calculatedTotal * 100);
    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: 'Order total must be at least ₹1 (100 paise)',
      });
    }

    // 4. Create ShopKart Pending Order in MongoDB
    const shopKartOrder = new Order({
      user: customer._id,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phoneClean,
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincodeClean,
      },
      totalAmount: calculatedTotal,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT',
    });

    await shopKartOrder.save();

    // 5. Create Razorpay Order
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: shopKartOrder._id.toString(),
      });
    } catch (rzpErr) {
      console.error('Razorpay Order Creation Error:', rzpErr);
      // Mark the shopkart order as failed if Razorpay creation fails
      shopKartOrder.paymentStatus = 'FAILED';
      await shopKartOrder.save();

      return res.status(500).json({
        success: false,
        message: rzpErr.error?.description || rzpErr.message || 'Failed to initiate Razorpay payment order',
      });
    }

    // 6. Save Razorpay Order ID to ShopKart Order
    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    // 7. Return checkout data
    return res.status(201).json({
      success: true,
      message: 'Razorpay payment order created successfully',
      shopKartOrderId: shopKartOrder._id,
      order_id: razorpayOrder.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || 'INR',
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create Payment Order Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while preparing checkout order',
      error: error.message,
    });
  }
};

// @desc    Verify Razorpay payment signature and confirm order
// @route   POST /orders/verify-payment (also POST /api/verify-payment)
export const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
      payment_id,
      signature,
    } = req.body;

    const rzpOrderId = razorpay_order_id || order_id;
    const rzpPaymentId = razorpay_payment_id || payment_id;
    const rzpSignature = razorpay_signature || signature;

    // Check for missing required fields
    if (!rzpPaymentId || !rzpSignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields (payment_id and signature)',
      });
    }

    // Find the ShopKart order in MongoDB
    let order;
    if (shopKartOrderId && mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      order = await Order.findById(shopKartOrderId);
    } else if (rzpOrderId) {
      order = await Order.findOne({ razorpayOrderId: rzpOrderId });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found for verification',
      });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this order',
      });
    }

    // Verify HMAC-SHA256 signature
    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const trustedOrderId = order.razorpayOrderId || rzpOrderId;
    const signPayload = `${trustedOrderId}|${rzpPaymentId}`;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(signPayload)
      .digest('hex');

    if (expectedSignature !== rzpSignature) {
      // Signature mismatch: return 400, do NOT mark as paid, do NOT clear cart
      order.paymentStatus = 'FAILED';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature mismatch',
      });
    }

    // Signature verified! Confirm Order and Mark Paid
    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = rzpPaymentId;
    order.razorpaySignature = rzpSignature;
    await order.save();

    // Clear User Cart in MongoDB
    const customer = await Customer.findById(req.user._id);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    // Deduct stock from products
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order placed successfully 🎉',
      order,
    });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying payment',
      error: error.message,
    });
  }
};

// @desc    Get authenticated user's order history
// @route   GET /orders (also GET /api/orders)
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get User Orders Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching orders',
      error: error.message,
    });
  }
};

// @desc    Get single order details by ID
// @route   GET /orders/:id (also GET /api/orders/:id)
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format',
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not own this order',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get Order By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching order details',
      error: error.message,
    });
  }
};

// @desc    Update order status (Bonus challenge)
// @route   PATCH /orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format',
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating order status',
      error: error.message,
    });
  }
};
