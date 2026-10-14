import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import {
  getCartApi,
  addToCartApi,
  updateCartQuantityApi,
  removeFromCartApi,
} from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // stores productId currently being modified

  // Fetch authenticated user's cart from backend
  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await getCartApi();
      if (res.data && Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Fetch Cart Error:", err);
      setError(err.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  // Sync cart when user authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated, user?._id]);

  // Add a product to cart (or increment quantity)
  const addToCart = async (productId) => {
    try {
      setActionLoading(productId);
      const res = await addToCartApi(productId);
      if (res.data && Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
      }
      return {
        success: true,
        message: res.data?.message || "Product added to cart",
      };
    } catch (err) {
      console.error("Add to cart error:", err);
      const msg =
        err.response?.data?.message || "Failed to add product to cart";
      return { success: false, message: msg };
    } finally {
      setActionLoading(null);
    }
  };

  //why global cart state is needed

  // Update quantity of an item
  const updateQuantity = async (productId, newQuantity) => {
    try {
      setActionLoading(productId);
      const res = await updateCartQuantityApi(productId, newQuantity);
      if (res.data && Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
      }
      return { success: true, message: "Quantity updated" };
    } catch (err) {
      console.error("Update quantity error:", err);
      const msg = err.response?.data?.message || "Failed to update quantity";
      return { success: false, message: msg };
    } finally {
      setActionLoading(null);
    }
  };

  // Remove a product from cart
  const removeFromCart = async (productId) => {
    try {
      setActionLoading(productId);
      const res = await removeFromCartApi(productId);
      if (res.data && Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
      } else {
        // Fallback local filter
        setCartItems((prev) =>
          prev.filter(
            (item) => (item.product?._id || item.product) !== productId,
          ),
        );
      }
      return { success: true, message: "Item removed from cart" };
    } catch (err) {
      console.error("Remove from cart error:", err);
      const msg = err.response?.data?.message || "Failed to remove product";
      return { success: false, message: msg };
    } finally {
      setActionLoading(null);
    }
  };

  // Derived Values calculated dynamically (not duplicated in database)
  const totalItems = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + price * (item.quantity || 1);
    }, 0);
  }, [cartItems]);

  const shipping = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal > 2999 ? 0 : 149; // Free shipping over ₹2,999
  }, [subtotal]);

  const grandTotal = useMemo(() => {
    return subtotal + shipping;
  }, [subtotal, shipping]);

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        actionLoading,
        totalItems,
        subtotal,
        shipping,
        grandTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
