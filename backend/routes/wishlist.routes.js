import express from 'express';
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
} from '../controllers/wishlist.controller.js';
import { protectCustomer } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All wishlist endpoints are protected and require a valid authenticated session
router.use(protectCustomer);

router.post('/:productId', addToWishlist);
router.get('/', getWishlist);
router.delete('/:productId', removeFromWishlist);
router.patch('/:productId/toggle', toggleWishlist);

export default router;
