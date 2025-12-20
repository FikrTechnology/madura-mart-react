// ==========================================
// Product Service
// Business logic untuk products
// ==========================================
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../constants/api';
import { handleApiError } from '../api/handleApiError';

export const productService = {
  /**
   * Get semua products
   */
  getAll: async (outletId = null) => {
    try {
      const url = outletId 
        ? API_ENDPOINTS.PRODUCTS.BY_OUTLET(outletId)
        : API_ENDPOINTS.PRODUCTS.LIST;
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get product by ID
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.PRODUCTS.UPDATE(id)
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create product baru
   */
  create: async (productData) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.PRODUCTS.CREATE,
        productData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update product
   */
  update: async (id, productData) => {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.PRODUCTS.UPDATE(id),
        productData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete product
   */
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(
        API_ENDPOINTS.PRODUCTS.DELETE(id)
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};
