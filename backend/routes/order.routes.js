import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { protectCustomer } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All order routes are protected with JWT customer authentication
router.use(protectCustomer);

// Order creation & payment routes
router.post('/create-payment-order', createPaymentOrder);
router.post('/create-order', createPaymentOrder);
router.post('/verify-payment', verifyPayment);

// Order query & management routes
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);

export default router;
