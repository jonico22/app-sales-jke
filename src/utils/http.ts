import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { api } from '@/lib/axios';

/**
 * Generic response type
 * You can adjust this to match your backend's standard response envelope
 * e.g., interface ApiResponse<T> { success: boolean; data: T; message: string; }
 */
export type ApiResponse<T> = T; 

export const http = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response: AxiosResponse<T> = await api.get(url, config);
    return response.data;
  },

  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response: AxiosResponse<T> = await api.post(url, data, config);
    return response.data;
  },

  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response: AxiosResponse<T> = await api.put(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response: AxiosResponse<T> = await api.delete(url, config);
    return response.data;
  },
  
  patch: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response: AxiosResponse<T> = await api.patch(url, data, config);
    return response.data;
  },
};
