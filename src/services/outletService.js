// ==========================================
// Outlet Service
// Business logic untuk outlets
// ==========================================
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../constants/api';
import { handleApiError } from '../api/handleApiError';

export const outletService = {
  /**
   * Get semua outlets
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.OUTLETS.LIST);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get outlet by ID
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.OUTLETS.GET(id)
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create outlet baru
   */
  create: async (outletData) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.OUTLETS.CREATE,
        outletData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update outlet
   */
  update: async (id, outletData) => {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.OUTLETS.UPDATE(id),
        outletData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};
