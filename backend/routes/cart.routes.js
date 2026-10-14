import express from 'express';
import {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
} from '../controllers/cart.controller.js';
import { protectCustomer } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All cart endpoints are protected and require user authentication
router.use(protectCustomer);

router.post('/', addToCart);
router.post('/:productId', addToCart);
router.get('/', getCart);
router.patch('/:productId', updateQuantity);
router.delete('/:productId', removeFromCart);

export default router;
