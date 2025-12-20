// ==========================================
// Transaction Service
// Business logic untuk transaksi/orders
// ==========================================
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../constants/api';
import { handleApiError } from '../api/handleApiError';

export const transactionService = {
  /**
   * Get semua transaksi
   */
  getAll: async (outletId = null) => {
    try {
      const url = outletId
        ? API_ENDPOINTS.TRANSACTIONS.BY_OUTLET(outletId)
        : API_ENDPOINTS.TRANSACTIONS.LIST;
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get transaksi by ID
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.TRANSACTIONS.GET(id)
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create transaksi baru
   */
  create: async (transactionData) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.TRANSACTIONS.CREATE,
        transactionData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};
