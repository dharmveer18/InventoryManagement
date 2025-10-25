import api from "../api/client";
import { tokenService } from "./tokenService";

export type Me = { 
  id: number; 
  username: string; 
  role: "admin"|"manager"|"viewer"; 
  perms: string[] 
};

export async function login(username: string, password: string) {
  try {
    const { data } = await api.post("/token/", { username, password });
    
    // Validate response
    if (!data.access || !data.refresh || data.status !== 'success') {
      console.error('Invalid login response:', data);
      throw new Error(data.detail || 'Invalid login response from server');
    }

    tokenService.setToken(data.access);
    tokenService.setRefreshToken(data.refresh);
    
    // Verify tokens were stored
    const storedAccess = tokenService.getToken();
    const storedRefresh = tokenService.getRefreshToken();
    
    if (!storedAccess || !storedRefresh) {
      console.error('Tokens not stored properly after login');
      throw new Error('Failed to store authentication tokens');
    }

    return true;
  } catch (error) {
    console.error('Login error:', error);
    tokenService.clearTokens(); // Clean up any partial tokens
    throw error;
  }
}

export async function logout() {
  try {
    // Optional: Call backend to invalidate token
    // await api.post("/logout/");
    tokenService.clearTokens();
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}

export type AuthError = {
  message: string;
  code: 'token_not_found' | 'token_expired' | 'network_error' | 'invalid_response';
};

export async function refreshToken() {
  try {
    const refresh = tokenService.getRefreshToken();
    if (!refresh) {
      console.warn('Refresh token not found in storage');
      throw { 
        message: 'No refresh token available',
        code: 'token_not_found'
      } as AuthError;
    }

    const { data } = await api.post("/token/refresh/", { refresh })
      .catch(error => {
        if (error.response?.status === 401) {
          throw { 
            message: 'Refresh token expired',
            code: 'token_expired'
          } as AuthError;
        }
        throw { 
          message: 'Network error during token refresh',
          code: 'network_error'
        } as AuthError;
      });

    if (!data?.access) {
      console.error('Invalid response from refresh endpoint:', data);
      throw { 
        message: 'Invalid refresh response',
        code: 'invalid_response'
      } as AuthError;
    }

    tokenService.setToken(data.access);
    return data.access;
  } catch (error) {
    // Clear tokens on any refresh failure
    tokenService.clearTokens();
    console.error('Token refresh failed:', (error as AuthError).message);
    throw error;
  }
}

export async function getMe(): Promise<Me> {
  const { data } = await api.get<Me>("/me/");
  return data;
}
