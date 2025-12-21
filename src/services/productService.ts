// ==========================================
// Product Service
// Business logic untuk products
// ==========================================
import { AxiosError } from 'axios';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../constants/api';
import { handleApiError } from '../api/handleApiError';
import {
  Product,
  CreateProductData,
  UpdateProductData,
  ApiResponse,
  PaginatedResponse,
} from '../types';

interface ProductServiceType {
  getAll: (
    outletId?: string | null
  ) => Promise<ApiResponse<Product[] | PaginatedResponse<Product>>>;
  getById: (id: string) => Promise<ApiResponse<Product>>;
  create: (productData: CreateProductData) => Promise<ApiResponse<Product>>;
  update: (
    id: string,
    productData: UpdateProductData
  ) => Promise<ApiResponse<Product>>;
  delete: (id: string) => Promise<ApiResponse<{ success: boolean }>>;
}

/**
 * Product service untuk handle semua operasi terkait products
 */
export const productService: ProductServiceType = {
  /**
   * Get semua products
   * @param outletId - Optional outlet ID untuk filter products by outlet
   * @returns Promise dengan array of products atau paginated response
   */
  getAll: async (
    outletId = null
  ): Promise<ApiResponse<Product[] | PaginatedResponse<Product>>> => {
    try {
      const url = outletId
        ? API_ENDPOINTS.PRODUCTS.BY_OUTLET(outletId)
        : API_ENDPOINTS.PRODUCTS.LIST;

      const response = await axiosInstance.get<
        ApiResponse<Product[] | PaginatedResponse<Product>>
      >(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * Get product by ID
   * @param id - Product ID
   * @returns Promise dengan product data
   */
  getById: async (id: string): Promise<ApiResponse<Product>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Product>>(
        API_ENDPOINTS.PRODUCTS.UPDATE(id)
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * Create product baru
   * @param productData - Data produk untuk di-create
   * @returns Promise dengan newly created product
   */
  create: async (
    productData: CreateProductData
  ): Promise<ApiResponse<Product>> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Product>>(
        API_ENDPOINTS.PRODUCTS.CREATE,
        productData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * Update product
   * @param id - Product ID
   * @param productData - Data produk untuk di-update
   * @returns Promise dengan updated product
   */
  update: async (
    id: string,
    productData: UpdateProductData
  ): Promise<ApiResponse<Product>> => {
    try {
      const response = await axiosInstance.put<ApiResponse<Product>>(
        API_ENDPOINTS.PRODUCTS.UPDATE(id),
        productData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * Delete product
   * @param id - Product ID
   * @returns Promise dengan success status
   */
  delete: async (
    id: string
  ): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await axiosInstance.delete<
        ApiResponse<{ success: boolean }>
      >(API_ENDPOINTS.PRODUCTS.DELETE(id));
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },
};
