import { describe, it, expect, beforeEach } from 'vitest';
import { tokenService } from '../../auth/tokenService';

describe('tokenService', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('access token', () => {
    it('should store and retrieve access token', () => {
      const token = 'test.access.token';
      tokenService.setToken(token);
      expect(tokenService.getToken()).toBe(token);
    });

    it('should return null when no access token exists', () => {
      expect(tokenService.getToken()).toBeNull();
    });
  });

  describe('refresh token', () => {
    it('should store and retrieve refresh token', () => {
      const token = 'test.refresh.token';
      tokenService.setRefreshToken(token);
      expect(tokenService.getRefreshToken()).toBe(token);
    });

    it('should return null when no refresh token exists', () => {
      expect(tokenService.getRefreshToken()).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('should remove both tokens', () => {
      tokenService.setToken('access.token');
      tokenService.setRefreshToken('refresh.token');
      
      tokenService.clearTokens();
      
      expect(tokenService.getToken()).toBeNull();
      expect(tokenService.getRefreshToken()).toBeNull();
    });
  });
});