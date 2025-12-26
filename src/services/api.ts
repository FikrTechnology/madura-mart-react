/**
 * React API Client untuk Madura Mart Backend
 * 
 * Lokasi: src/services/api.ts
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'cashier';
  status: 'active' | 'inactive' | 'suspended';
  phone?: string;
  profile_image?: string;
  outlet_ids?: string[];
  outletIds?: string[];
  created_at: string;
  updated_at: string;
}

export interface Outlet {
  id: string;
  name: string;
  owner: string;
  address: string;
  phone: string;
  email?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  outlet_id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost_price?: number;
  stock: number;
  min_stock?: number;
  sku?: string;
  barcode?: string;
  image?: string;
  status: 'active' | 'inactive' | 'discontinued';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  outlet_id: string;
  cashier_id: string;
  payment_method: 'cash' | 'card' | 'transfer' | 'check' | 'other';
  subtotal: number;
  discount_amount?: number;
  discount_percent?: number;
  tax?: number;
  total: number;
  notes?: string;
  receipt_number?: string;
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  created_at: string;
}

// Create API Instance
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk tambah token ke header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('madura_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk handle error response
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('madura_token');
      localStorage.removeItem('madura_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ==========================================
// AUTH SERVICES
// ==========================================
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post<ApiResponse<{ 
      user: User; 
      token: string;
      refreshToken: string;
      expiresIn: number;
    }>>(
      '/auth/login',
      { email, password }
    );
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post<ApiResponse>('/auth/logout');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post<ApiResponse<{ 
      token: string; 
      expiresIn: number;
    }>>('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// ==========================================
// OUTLET SERVICES
// ==========================================
export const outletAPI = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    // Set default values if not provided
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const status = params?.status ?? 'active';

    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    queryParams.append('status', status);

    const response = await apiClient.get<ApiResponse<Outlet[]>>(
      `/outlets?${queryParams.toString()}`
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Outlet>>(`/outlets/${id}`);
    return response.data;
  },

  create: async (data: Partial<Outlet>) => {
    const response = await apiClient.post<ApiResponse<Outlet>>('/outlets', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Outlet>) => {
    const response = await apiClient.put<ApiResponse<Outlet>>(`/outlets/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse>(`/outlets/${id}`);
    return response.data;
  },
};

// ==========================================
// USER SERVICES
// ==========================================
export const userAPI = {
  getAll: async (params?: { page?: number; limit?: number; role?: string; outlet_id?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    // Set default values
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.outlet_id) queryParams.append('outlet_id', params.outlet_id);
    if (params?.status) queryParams.append('status', params.status ?? 'active');

    const response = await apiClient.get<ApiResponse<User[]>>(
      `/users?${queryParams.toString()}`
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  create: async (data: Partial<User> & { password?: string; outlet_ids?: string[] }) => {
    const response = await apiClient.post<ApiResponse<User>>('/users', data);
    return response.data;
  },

  update: async (id: string, data: Partial<User>) => {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse>(`/users/${id}`);
    return response.data;
  },

  changePassword: async (data: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    const response = await apiClient.post<ApiResponse>('/users/change-password', data);
    return response.data;
  },

  assignToOutlet: async (userId: string, outletId: string) => {
    const response = await apiClient.post<ApiResponse>('/users/assign-outlet', {
      userId,
      outletId
    });
    return response.data;
  },
};

// ==========================================
// PRODUCT SERVICES
// ==========================================
export const productAPI = {
  getAll: async (params?: { page?: number; limit?: number; outletId?: string; category?: string; status?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    // Set default values
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (params?.outletId) queryParams.append('outletId', params.outletId);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status ?? 'active');
    if (params?.search) queryParams.append('search', params.search);

    const response = await apiClient.get<ApiResponse<Product[]>>(
      `/products?${queryParams.toString()}`
    );
    
    // Ensure data is always an array
    let data = response.data.data || [];
    if (!Array.isArray(data)) {
      // Convert object with numeric keys to array
      data = Object.values(data);
    }
    
    return {
      ...response.data,
      data: data
    };
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  create: async (data: Partial<Product> & { outletId?: string; outlet_ids?: string[] }) => {
    const response = await apiClient.post<ApiResponse<Product>>('/products', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Product>) => {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data;
  },

  updateStock: async (id: string, data: { quantity: number; type?: 'set' | 'add' | 'subtract' }) => {
    const response = await apiClient.put<ApiResponse<Product>>(
      `/products/${id}/stock`,
      data
    );
    return response.data;
  },

  getLowStock: async (outletId: string) => {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `/products/alerts/low-stock?outletId=${outletId}`
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse>(`/products/${id}`);
    return response.data;
  },
};

// ==========================================
// TRANSACTION SERVICES
// ==========================================
export const transactionAPI = {
  getAll: async (params?: { page?: number; limit?: number; outletId?: string; status?: string; cashierId?: string }) => {
    const queryParams = new URLSearchParams();
    // Set default values
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (params?.outletId) queryParams.append('outletId', params.outletId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.cashierId) queryParams.append('cashierId', params.cashierId);

    const response = await apiClient.get<ApiResponse<Transaction[]>>(
      `/transactions?${queryParams.toString()}`
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Transaction & { items: TransactionItem[] }>>(
      `/transactions/${id}`
    );
    return response.data;
  },

  create: async (data: {
    outlet_id: string;
    payment_method: 'tunai' | 'transfer' | 'e-wallet';
    items: Array<{ product_id: string; product_name?: string; quantity: number; price: number }>;
    discount_amount?: number;
    discount_percent?: number;
    tax?: number;
    notes?: string;
  }) => {
    const response = await apiClient.post<ApiResponse<Transaction & { items: TransactionItem[] }>>(
      '/transactions',
      data
    );
    return response.data;
  },

  getReceipt: async (transactionId: string) => {
    const response = await apiClient.get<ApiResponse<Transaction & { items: TransactionItem[] }>>(
      `/transactions/${transactionId}/receipt`
    );
    return response.data;
  },

  getByDateRange: async (params: { outletId: string; startDate: string; endDate: string }) => {
    const queryParams = new URLSearchParams({
      outletId: params.outletId,
      startDate: params.startDate,
      endDate: params.endDate
    });

    const response = await apiClient.get<ApiResponse<Transaction[]>>(
      `/transactions/date-range?${queryParams.toString()}`
    );
    return response.data;
  },

  updateStatus: async (transactionId: string, status: 'completed' | 'pending' | 'cancelled' | 'refunded') => {
    const response = await apiClient.put<ApiResponse<Transaction>>(
      `/transactions/${transactionId}/status`,
      { status }
    );
    return response.data;
  },
};

// ==========================================
// DASHBOARD SERVICES
// ==========================================
export const dashboardAPI = {
  owner: {
    getOverview: async (outletId?: string) => {
      const queryParams = new URLSearchParams();
      if (outletId) queryParams.append('outletId', outletId);

      const response = await apiClient.get<ApiResponse>(
        `/dashboard/owner/overview?${queryParams.toString()}`
      );
      return response.data;
    },

    getInventory: async (outletId?: string) => {
      const queryParams = new URLSearchParams();
      if (outletId) queryParams.append('outletId', outletId);

      const response = await apiClient.get<ApiResponse>(
        `/dashboard/owner/inventory?${queryParams.toString()}`
      );
      return response.data;
    },

    getSalesReport: async (params?: { outletId?: string; startDate?: string; endDate?: string; period?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.outletId) queryParams.append('outletId', params.outletId);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.period) queryParams.append('period', params.period);

      const response = await apiClient.get<ApiResponse>(
        `/dashboard/owner/reports/sales?${queryParams.toString()}`
      );
      return response.data;
    },

    getTopProducts: async (params?: { outletId?: string; limit?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.outletId) queryParams.append('outletId', params.outletId);
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiClient.get<ApiResponse>(
        `/dashboard/owner/top-products?${queryParams.toString()}`
      );
      return response.data;
    },
  },

  admin: {
    getOverview: async () => {
      const response = await apiClient.get<ApiResponse>(
        `/dashboard/admin/overview`
      );
      return response.data;
    },

    getProducts: async (params?: { page?: number; limit?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiClient.get<ApiResponse>(
        `/dashboard/admin/products?${queryParams.toString()}`
      );
      return response.data;
    },

    getEmployees: async (params?: { page?: number; limit?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiClient.get<ApiResponse>(
        `/dashboard/admin/employees?${queryParams.toString()}`
      );
      return response.data;
    },
  },

  cashier: {
    getDailySummary: async (outletId?: string) => {
      const queryParams = new URLSearchParams();
      if (outletId) queryParams.append('outletId', outletId);

      const response = await apiClient.get<ApiResponse>(
        `/dashboard/cashier/daily-summary?${queryParams.toString()}`
      );
      return response.data;
    },
  },
};

export default apiClient;
