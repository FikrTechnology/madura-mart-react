// ==========================================
// Transaction Service
// Business logic untuk transaksi/orders
// ==========================================
import { AxiosError } from 'axios';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../constants/api';
import { handleApiError } from '../api/handleApiError';
import {
  Transaction,
  CreateTransactionData,
  ApiResponse,
  PaginatedResponse,
} from '../types';

interface TransactionServiceType {
  getAll: (
    outletId?: string | null
  ) => Promise<ApiResponse<Transaction[] | PaginatedResponse<Transaction>>>;
  getById: (id: string) => Promise<ApiResponse<Transaction>>;
  create: (
    transactionData: CreateTransactionData
  ) => Promise<ApiResponse<Transaction>>;
}

/**
 * Transaction service untuk handle semua operasi terkait transaksi/orders
 */
export const transactionService: TransactionServiceType = {
  /**
   * Get semua transaksi
   * @param outletId - Optional outlet ID untuk filter transaksi by outlet
   * @returns Promise dengan array of transactions atau paginated response
   */
  getAll: async (
    outletId = null
  ): Promise<ApiResponse<Transaction[] | PaginatedResponse<Transaction>>> => {
    try {
      const url = outletId
        ? API_ENDPOINTS.TRANSACTIONS.BY_OUTLET(outletId)
        : API_ENDPOINTS.TRANSACTIONS.LIST;

      const response = await axiosInstance.get<
        ApiResponse<Transaction[] | PaginatedResponse<Transaction>>
      >(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * Get transaksi by ID
   * @param id - Transaction ID
   * @returns Promise dengan transaction data
   */
  getById: async (id: string): Promise<ApiResponse<Transaction>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Transaction>>(
        API_ENDPOINTS.TRANSACTIONS.GET(id)
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  /**
   * Create transaksi baru
   * @param transactionData - Data transaksi untuk di-create
   * @returns Promise dengan newly created transaction
   */
  create: async (
    transactionData: CreateTransactionData
  ): Promise<ApiResponse<Transaction>> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Transaction>>(
        API_ENDPOINTS.TRANSACTIONS.CREATE,
        transactionData
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },
};
