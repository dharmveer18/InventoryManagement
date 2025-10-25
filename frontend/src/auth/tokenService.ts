// src/auth/tokenService.ts
const TOKEN_KEY = 'access';
const REFRESH_KEY = 'refresh';

export const tokenService = {
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  setToken: (token: string) => {
    if (!token || typeof token !== 'string') return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
  
  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_KEY);
  },
  
  setRefreshToken: (token: string) => {
    localStorage.setItem(REFRESH_KEY, token);
  },
  
  removeRefreshToken: () => {
    localStorage.removeItem(REFRESH_KEY);
  },
  
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
};