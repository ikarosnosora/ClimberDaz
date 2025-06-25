import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ERROR_MESSAGES } from './constants';
import { showError, showSuccess } from './notifications';
import type { ApiResponse, ApiError } from '../types/common';
import config from '../services/api/config';

/**
 * Unified API Utilities
 * Consolidates functionality from apiUtils.ts, apiRequest.ts, and apiErrorHandler.ts
 * Provides consistent error handling and response processing
 */

// Configure axios defaults
axios.defaults.baseURL = config.baseUrl;
axios.defaults.timeout = 10000;

// Types
export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Improved API Error class with proper typing
export class ApiErrorClass extends Error implements ApiError {
  public status: number;
  public code?: string;
  public details?: Record<string, unknown>;
  public config?: AxiosRequestConfig;

  constructor(
    message: string, 
    status: number = 0, 
    details?: Record<string, unknown>, 
    config?: AxiosRequestConfig,
    code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.config = config;
    this.code = code;
  }
}

// Improved response interface with headers
export interface ApiResponseWithHeaders<T = unknown> extends ApiResponse<T> {
  headers?: Record<string, string>;
}

// Token management
export const TokenManager = {
  getToken: () => localStorage.getItem('climberdaz_token'),
  setToken: (token: string) => localStorage.setItem('climberdaz_token', token),
  removeToken: () => localStorage.removeItem('climberdaz_token'),
  isTokenValid: () => {
    const token = TokenManager.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
};

// API Configuration
const getAuthHeaders = (token?: string): Record<string, string> => {
  const authToken = token || TokenManager.getToken();
  return {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
  };
};

// Axios interceptors for automatic token management
axios.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken();
    if (token && TokenManager.isTokenValid()) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      TokenManager.removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const createQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else if (value instanceof Date) {
        searchParams.append(key, value.toISOString());
      } else if (typeof value === 'object') {
        searchParams.append(key, JSON.stringify(value));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString();
};

const createUrlWithParams = (
  baseUrl: string,
  params?: Record<string, unknown>
): string => {
  if (!params || Object.keys(params).length === 0) return baseUrl;
  
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) => value !== undefined && value !== null && value !== ''
    )
  );

  const queryString = createQueryString(filteredParams);
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

// Error handling
const createApiError = (error: unknown): ApiErrorClass => {
  if (error instanceof ApiErrorClass) {
    return error;
  }
  
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 0;
    const message = error.response?.data?.message || error.message || ERROR_MESSAGES.SERVER_ERROR;
    const details = error.response?.data?.details || {};
    
    return new ApiErrorClass(message, status, details, error.config);
  }
  
  if (error instanceof Error) {
    return new ApiErrorClass(error.message || ERROR_MESSAGES.SERVER_ERROR, 0);
  }

  return new ApiErrorClass(ERROR_MESSAGES.SERVER_ERROR, 0);
};

const getErrorMessage = (error: ApiError): string => {
  switch (error.status) {
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 422:
      return ERROR_MESSAGES.VALIDATION_ERROR;
    case 500:
    case 502:
    case 503:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return error.message || ERROR_MESSAGES.SERVER_ERROR;
  }
};

// Response Handling
const extractPaginationData = (headers: Record<string, string>): PaginationData | null => {
  const total = headers['x-total-count'] ? parseInt(headers['x-total-count'], 10) : 0;
  const page = headers['x-page'] ? parseInt(headers['x-page'], 10) : 1;
  const limit = headers['x-page-size'] ? parseInt(headers['x-page-size'], 10) : 10;
  const totalPages = headers['x-total-pages'] ? parseInt(headers['x-total-pages'], 10) : 1;

  return total > 0 ? { total, page, limit, totalPages } : null;
};

// Core API request functions
export const apiRequest = {
  get: async <T>(url: string, params?: Record<string, unknown>, options?: AxiosRequestConfig): Promise<T> => {
    try {
      const fullUrl = createUrlWithParams(url, params);
      const response: AxiosResponse<T> = await axios.get(fullUrl, {
        ...options,
        headers: { ...getAuthHeaders(), ...options?.headers }
      });
      return response.data;
    } catch (error) {
      throw createApiError(error);
    }
  },

  post: async <T>(url: string, data?: unknown, options?: AxiosRequestConfig): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await axios.post(url, data, {
        ...options,
        headers: { ...getAuthHeaders(), ...options?.headers }
      });
      return response.data;
    } catch (error) {
      throw createApiError(error);
    }
  },

  put: async <T>(url: string, data?: unknown, options?: AxiosRequestConfig): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await axios.put(url, data, {
        ...options,
        headers: { ...getAuthHeaders(), ...options?.headers }
      });
      return response.data;
    } catch (error) {
      throw createApiError(error);
    }
  },

  patch: async <T>(url: string, data?: unknown, options?: AxiosRequestConfig): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await axios.patch(url, data, {
        ...options,
        headers: { ...getAuthHeaders(), ...options?.headers }
      });
      return response.data;
    } catch (error) {
      throw createApiError(error);
    }
  },

  delete: async <T>(url: string, options?: AxiosRequestConfig): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await axios.delete(url, {
        ...options,
        headers: { ...getAuthHeaders(), ...options?.headers }
      });
      return response.data;
    } catch (error) {
      throw createApiError(error);
    }
  }
};

// Response processing with proper typing
const handleApiResponse = <T>(
  response: ApiResponseWithHeaders<T>,
  options: {
    successMessage?: string;
    showSuccess?: boolean;
    includePagination?: boolean;
  } = {}
): { data: T; pagination?: PaginationData | null } => {
  const { successMessage, showSuccess: shouldShowSuccess = false, includePagination = false } = options;
  
  if (shouldShowSuccess && successMessage) {
    showSuccess(successMessage);
  }

  const result: { data: T; pagination?: PaginationData | null } = { data: response.data };
  
  if (includePagination && response.headers) {
    result.pagination = extractPaginationData(response.headers);
  }
  
  return result;
};

// React Hook for API Requests
interface UseApiRequestOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  successMessage?: string;
  showSuccess?: boolean;
  showError?: boolean;
}

export const useApiRequest = <T, Args extends unknown[]>(
  apiFunction: (...args: Args) => Promise<T>,
  options: UseApiRequestOptions<T> = {}
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const {
    onSuccess,
    onError,
    successMessage,
    showSuccess: shouldShowSuccess = false,
    showError: shouldShowError = true,
  } = options;

  const request = useCallback(
    async (...args: Args): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiFunction(...args);
        setData(response);
        
        if (onSuccess) {
          onSuccess(response);
        }
        
        if (shouldShowSuccess && successMessage) {
          showSuccess(successMessage);
        }
        
        return response;
      } catch (err) {
        const apiError = createApiError(err);
        setError(apiError);
        
        if (onError) {
          onError(apiError);
        }
        
        if (shouldShowError) {
          showError(getErrorMessage(apiError));
        }
        
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, onSuccess, onError, successMessage, shouldShowSuccess, shouldShowError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    request,
    reset,
    isLoading,
    data,
    error,
  };
};

export { createApiError, getErrorMessage, handleApiResponse, createUrlWithParams }; 