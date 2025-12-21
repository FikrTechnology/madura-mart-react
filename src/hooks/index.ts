/**
 * Custom Hooks untuk React
 * Lokasi: src/hooks/index.ts
 * 
 * Gunakan hooks ini di components untuk akses API dengan mudah
 */

import { useState, useCallback, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import {
  authAPI,
  outletAPI,
  userAPI,
  productAPI,
  transactionAPI,
  ApiResponse,
  User,
  Outlet,
  Product,
  Transaction,
  TransactionItem,
} from '../services/api';

// ==========================================
// USEAUTH HOOK
// ==========================================
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('madura_user');
    const storedToken = localStorage.getItem('madura_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(email, password);
      if (response.success && response.data) {
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('madura_user', JSON.stringify(user));
        localStorage.setItem('madura_token', token);
        return response;
      }
      throw new Error(response.error || 'Login gagal');
    } catch (err) {
      const message = err instanceof AxiosError ? err.response?.data?.error || err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register removed - not supported by backend API

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authAPI.logout();
      setUser(null);
      setToken(null);
      localStorage.removeItem('madura_user');
      localStorage.removeItem('madura_token');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };
};

// ==========================================
// USEOUTLET HOOK
// ==========================================
export const useOutlet = () => {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [currentOutlet, setCurrentOutlet] = useState<Outlet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOutlets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await outletAPI.getAll();
      if (response.success && response.data) {
        setOutlets(response.data);
      }
    } catch (err) {
      const message = err instanceof AxiosError ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getOutlet = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await outletAPI.getById(id);
      if (response.success && response.data) {
        setCurrentOutlet(response.data);
        return response.data;
      }
    } catch (err) {
      const message = err instanceof AxiosError ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    outlets,
    currentOutlet,
    loading,
    error,
    fetchOutlets,
    getOutlet,
  };
};

// ==========================================
// USEPRODUCT HOOK
// ==========================================
export const useProduct = (outletId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = outletId
        ? await productAPI.getAll({ outletId })
        : await productAPI.getAll();

      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (err) {
      const message = err instanceof AxiosError ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [outletId]);

  const updateProductStock = useCallback(async (productId: string, quantity: number) => {
    try {
      const response = await productAPI.updateStock(productId, { quantity, type: 'set' });
      if (response.success && response.data) {
        setProducts((prev: Product[]) =>
          prev.map((p: Product) => (p.id === productId ? response.data! : p))
        );
        return response.data;
      }
    } catch (err) {
      const message = err instanceof AxiosError ? err.message : String(err);
      setError(message);
      throw err;
    }
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    updateProductStock,
  };
};

// ==========================================
// USETRANSACTION HOOK (untuk checkout)
// ==========================================
export interface CartItem {
  product_id: string;
  product_name?: string;
  quantity: number;
  price: number;
}

export const useTransaction = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useCallback((item: CartItem) => {
    setCartItems((prev: CartItem[]) => {
      const existing = prev.find((p: CartItem) => p.product_id === item.product_id);
      if (existing) {
        return prev.map((p: CartItem) =>
          p.product_id === item.product_id
            ? { ...p, quantity: p.quantity + item.quantity }
            : p
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev: CartItem[]) => prev.filter((item: CartItem) => item.product_id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems((prev: CartItem[]) =>
        prev.map((item: CartItem) =>
          item.product_id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const checkout = useCallback(
    async (
      outletId: string,
      paymentMethod: 'tunai' | 'transfer' | 'e-wallet' = 'tunai',
      discount?: { amount?: number; percent?: number },
      tax?: number
    ) => {
      setLoading(true);
      setError(null);
      try {
        if (cartItems.length === 0) {
          throw new Error('Keranjang masih kosong');
        }

        const response = await transactionAPI.create({
          outlet_id: outletId,
          payment_method: paymentMethod,
          discount_amount: discount?.amount,
          discount_percent: discount?.percent,
          tax,
          items: cartItems,
        });

        if (response.success && response.data) {
          clearCart();
          return response.data;
        }
        throw new Error(response.error || 'Checkout gagal');
      } catch (err) {
        const message = err instanceof AxiosError ? err.response?.data?.error || err.message : String(err);
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [cartItems, clearCart]
  );

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  return {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    checkout,
    getTotalPrice,
  };
};

// ==========================================
// USEUSER HOOK
// ==========================================
export const useUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userAPI.getAll();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (err) {
      const message = err instanceof AxiosError ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUsersByOutlet = useCallback(async (outletId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userAPI.getAll({ outlet_id: outletId });
      if (response.success && response.data) {
        setUsers(response.data);
        return response.data;
      }
    } catch (err) {
      const message = err instanceof AxiosError ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    getUsersByOutlet,
  };
};
