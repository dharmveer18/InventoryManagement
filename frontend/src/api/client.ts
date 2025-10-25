import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokenService } from "../auth/tokenService";
import { refreshToken } from "../auth/auth";
import { emitAuthEvent } from "../auth/authEvents";

const API_ROOT = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to all requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenService.getToken();
    if (token && config.headers && typeof token === 'string' && token.length > 0) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // If there's no config or it's already retried, reject
    if (!originalRequest || (originalRequest as any)._retry) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Attempt refresh for any 401 error if we have a refresh token
      if (tokenService.getRefreshToken()) {
        // Don't retry if we don't have a refresh token
        console.log("Token expired, attempting refresh...");
        if (!tokenService.getRefreshToken()) {
          console.log("No refresh token available, emitting unauthorized event");
          tokenService.clearTokens();
          emitAuthEvent('UNAUTHORIZED');
          return Promise.reject(error);
        }

        try {
          (originalRequest as any)._retry = true;

          // Try to refresh the token
          const newToken = await refreshToken();
          console.log("Token refreshed successfully:", newToken);
          // Retry the original request with new token
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, clear tokens and reject
          tokenService.clearTokens();
          emitAuthEvent('UNAUTHORIZED');
          return Promise.reject(refreshError);
        }
      } else {
        // For other 401 errors (invalid token, no token, etc.), emit unauthorized event
        console.log('401 error - clearing tokens');
        tokenService.clearTokens();
        emitAuthEvent('UNAUTHORIZED');
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
