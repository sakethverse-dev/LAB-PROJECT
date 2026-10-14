import express from 'express';
import {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  logoutCustomer,
  changePassword,
} from '../controllers/customer.controller.js';
import { protectCustomer } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// Protected routes
router.get('/me', protectCustomer, getCustomerProfile);
router.post('/logout', protectCustomer, logoutCustomer);
router.patch('/change-password', protectCustomer, changePassword);

export default router;
