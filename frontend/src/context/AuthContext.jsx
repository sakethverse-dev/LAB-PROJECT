import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCustomerProfileApi, loginCustomerApi, logoutCustomerApi, registerCustomerApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on initial load
  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await getCustomerProfileApi();
      if (res.data && res.data._id) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await loginCustomerApi({ email, password });
    if (res.data?.token) {
      localStorage.setItem('shopkart_token', res.data.token);
    }
    if (res.data?.customer) {
      setUser(res.data.customer);
    } else {
      await checkAuth();
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await registerCustomerApi(userData);
    return res.data;
  };

  const logout = async () => {
    try {
      await logoutCustomerApi();
    } catch (err) {
      console.warn('Logout request completed with notice:', err.message);
    } finally {
      localStorage.removeItem('shopkart_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
