import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (res, customerId) => {
  const token = jwt.sign(
    { id: customerId },
    process.env.JWT_SECRET || 'shopkart_secret_key_2029',
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true, // Prevents XSS attacks, cannot be read via client JS
    secure: process.env.NODE_ENV === 'production', // Use secure in production (HTTPS)
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Cross-origin cookie support in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });

  return token;
};
