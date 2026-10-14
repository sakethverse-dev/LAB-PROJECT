import axios from 'axios';

// Calculate dynamic backend base URL matching current host/IP
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return 'http://localhost:5000';
};

// Base API instance configured with credentials to send & receive HttpOnly cookies
const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // Crucial for HttpOnly cookie authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists in localStorage (vital fallback for cross-domain deployments)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('shopkart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Customer Authentication APIs
export const registerCustomerApi = (data) => api.post('/customers/register', data);
export const loginCustomerApi = (data) => api.post('/customers/login', data);
export const getCustomerProfileApi = () => api.get('/customers/me');
export const logoutCustomerApi = () => api.post('/customers/logout');
export const changePasswordApi = (data) => api.patch('/customers/change-password', data);

// Product Discovery APIs
export const getAllProductsApi = (params) => api.get('/products', { params });
export const getProductByIdApi = (id) => api.get(`/products/${id}`);
export const createProductApi = (data) => api.post('/products', data);

// Wishlist APIs (Lab 04)
export const addToWishlistApi = (productId) => api.post(`/wishlist/${productId}`);
export const getWishlistApi = () => api.get('/wishlist');
export const removeFromWishlistApi = (productId) => api.delete(`/wishlist/${productId}`);
export const toggleWishlistApi = (productId) => api.patch(`/wishlist/${productId}/toggle`);

// Shopping Cart APIs (Lab 05)
export const addToCartApi = (productId) => api.post(`/cart/${productId}`);
export const getCartApi = () => api.get('/cart');
export const updateCartQuantityApi = (productId, quantity) => api.patch(`/cart/${productId}`, { quantity });
export const removeFromCartApi = (productId) => api.delete(`/cart/${productId}`);

// Orders & Razorpay Checkout APIs (Lab 06)
export const createPaymentOrderApi = (data) => api.post('/orders/create-payment-order', data);
export const verifyPaymentApi = (data) => api.post('/orders/verify-payment', data);
export const getUserOrdersApi = () => api.get('/orders');
export const getOrderByIdApi = (id) => api.get(`/orders/${id}`);
export const updateOrderStatusApi = (id, status) => api.patch(`/orders/${id}/status`, { status });

export default api;
