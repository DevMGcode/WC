import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private isRefreshing = false;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token
    this.client.interceptors.request.use((config) => {
      const token = this.accessToken || localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para manejo de errores — intenta refrescar el token en 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const original = error.config as any;
        if (error.response?.status === 401 && !original?._retry && !this.isRefreshing) {
          original._retry = true;
          this.isRefreshing = true;
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const res = await fetch('/api/v1/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
              });
              if (res.ok) {
                const data = await res.json();
                if (data.success && data.data?.accessToken) {
                  this.setAccessToken(data.data.accessToken);
                  if (data.data.refreshToken) {
                    localStorage.setItem('refreshToken', data.data.refreshToken);
                  }
                  original.headers.Authorization = `Bearer ${data.data.accessToken}`;
                  return this.client(original);
                }
              }
            }
          } catch {
            // refresh failed — fall through to clearAuth
          } finally {
            this.isRefreshing = false;
          }
          this.clearAuth();
          window.location.href = '/es/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('authToken', token);
  }

  getAccessToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('authToken');
    }
    return this.accessToken;
  }

  clearAuth() {
    this.accessToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data.data as T;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data.data as T;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    return response.data.data as T;
  }

  async delete<T = void>(url: string, data?: any): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, { data });
    return response.data.data as T;
  }
}

export const apiClient = new ApiClient();

export default apiClient;
