import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/authStore';

// API配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const REQUEST_TIMEOUT = 10000;

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 统一添加 /api 前缀
    if (config.url && !config.url.startsWith('/api/')) {
      config.url = '/api' + config.url;
    }
    
    // 添加请求时间戳
    if (!config.params) {
      config.params = {};
    }
    config.params._t = Date.now();
    
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config;
    
    // 处理401未授权错误
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const { refreshToken, logout, setToken } = useAuthStore.getState();
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { token } = response.data;
          setToken(token);
          
          // 重试原请求
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // 刷新token失败，登出用户
          logout();
          window.location.href = '/login';
        }
      } else {
        // 没有refresh token，直接登出
        logout();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API响应类型 - 根据后端接口调整
export interface ApiResponse<T = any> {
  code: string; // 后端返回的是字符串类型的code，如"0000"
  msg: string;
  data: T;
  success?: boolean; // 前端添加的字段，用于统一处理
}

// 通用API方法
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.get(url, config).then((res: any) => res.data),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.post(url, data, config).then((res: any) => res.data),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.put(url, data, config).then((res: any) => res.data),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.delete(url, config).then((res: any) => res.data),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.patch(url, data, config).then((res: any) => res.data),
};

export default apiClient;
