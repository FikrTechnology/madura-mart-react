// ==========================================
// API Error Handler
// ==========================================
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants/api';

/**
 * Parse API error dan return user-friendly message
 * @param {Error} error - Axios error object
 * @returns {Object} - { message, status, data }
 */
export const handleApiError = (error) => {
  // Network error - no response from server
  if (!error.response) {
    return {
      message: ERROR_MESSAGES.NETWORK_ERROR,
      status: null,
      data: error.message
    };
  }

  // Server response dengan error
  const { status, data } = error.response;
  
  let message = ERROR_MESSAGES.UNKNOWN;

  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      message = data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
      break;
    case HTTP_STATUS.UNAUTHORIZED:
      message = ERROR_MESSAGES.UNAUTHORIZED;
      break;
    case HTTP_STATUS.FORBIDDEN:
      message = ERROR_MESSAGES.FORBIDDEN;
      break;
    case HTTP_STATUS.NOT_FOUND:
      message = ERROR_MESSAGES.NOT_FOUND;
      break;
    case HTTP_STATUS.SERVER_ERROR:
      message = ERROR_MESSAGES.SERVER_ERROR;
      break;
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      message = 'Service sedang tidak tersedia. Silakan coba lagi nanti.';
      break;
    default:
      message = data?.message || ERROR_MESSAGES.UNKNOWN;
  }

  return {
    message,
    status,
    data: data?.errors || data
  };
};
