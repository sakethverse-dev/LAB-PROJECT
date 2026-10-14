import jwt from 'jsonwebtoken';
import Customer from '../models/customer.model.js';

export const protectCustomer = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Optional header fallback: Authorization: Bearer <token>
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided. Please log in.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shopkart_secret_key_2029');
    const customer = await Customer.findById(decoded.id).select('-password');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Customer no longer exists.',
      });
    }

    req.user = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token.',
    });
  }
};
