// ==========================================
// Outlet Service
// Business logic untuk outlets
// ==========================================
import { AxiosError } from 'axios';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../constants/api';
import { handleApiError } from '../api/handleApiError';
import { Outlet, ApiResponse, PaginatedResponse } from '../types';

interface OutletServiceType {
  getAll: () => Promise<ApiResponse<Outlet[] | PaginatedResponse<Outlet>>>;
  getById: (id: string) => Promise<ApiResponse<Outlet>>;
  create: (outletData: Partial<Outlet>) => Promise<ApiResponse<Outlet>>;
  update: (
    id: string,
    outletData: Partial<Outlet>
  ) => Promise<ApiResponse<Outlet>>;
  delete: (id: string) => Promise<ApiResponse<{ success: boolean }>>;
}

/**
 * Outlet service untuk handle semua operasi terkait outlets
 */
export const outletService: OutletServiceType = {
  /**
   * Get semua outlets
   * @returns Promise dengan array of outlets atau paginated response
   */
  getAll: async (): Promise<
    ApiResponse<Outlet[] | PaginatedResponse<Outlet>>
  > => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<Outlet[] | PaginatedResponse<Outlet>>
      >(API_ENDPOINTS.OUTLETS.LIST);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * Get outlet by ID
   * @param id - Outlet ID
   * @returns Promise dengan outlet data
   */
  getById: async (id: string): Promise<ApiResponse<Outlet>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Outlet>>(
        API_ENDPOINTS.OUTLETS.GET(id)
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * Create outlet baru
   * @param outletData - Data outlet untuk di-create
   * @returns Promise dengan newly created outlet
   */
  create: async (
    outletData: Partial<Outlet>
  ): Promise<ApiResponse<Outlet>> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Outlet>>(
        API_ENDPOINTS.OUTLETS.CREATE,
        outletData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * Update outlet
   * @param id - Outlet ID
   * @param outletData - Data outlet untuk di-update
   * @returns Promise dengan updated outlet
   */
  update: async (
    id: string,
    outletData: Partial<Outlet>
  ): Promise<ApiResponse<Outlet>> => {
    try {
      const response = await axiosInstance.put<ApiResponse<Outlet>>(
        API_ENDPOINTS.OUTLETS.UPDATE(id),
        outletData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * Delete outlet
   * @param id - Outlet ID
   * @returns Promise dengan success status
   */
  delete: async (
    id: string
  ): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await axiosInstance.delete<
        ApiResponse<{ success: boolean }>
      >(API_ENDPOINTS.OUTLETS.DELETE(id));
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },
};
