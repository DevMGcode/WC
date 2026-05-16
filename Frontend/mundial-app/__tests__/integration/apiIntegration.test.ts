import { apiClient } from '@/services/api';

describe('API Client - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    apiClient.clearAuth();
  });

  describe('Token Management', () => {
    it('should set and retrieve access token', () => {
      const token = 'jwt-token-xyz';
      apiClient.setAccessToken(token);

      expect(apiClient.getAccessToken()).toBe(token);
      expect(localStorage.getItem('authToken')).toBe(token);
    });

    it('should retrieve token from localStorage when memory is empty', () => {
      localStorage.setItem('authToken', 'stored-token');
      expect(apiClient.getAccessToken()).toBe('stored-token');
    });

    it('should return null when no token exists anywhere', () => {
      expect(apiClient.getAccessToken()).toBeNull();
    });

    it('should overwrite token on repeated setAccessToken calls', () => {
      apiClient.setAccessToken('first');
      apiClient.setAccessToken('second');

      expect(apiClient.getAccessToken()).toBe('second');
      expect(localStorage.getItem('authToken')).toBe('second');
    });
  });

  describe('Auth Cleanup', () => {
    it('should clear access token and both localStorage keys on clearAuth', () => {
      apiClient.setAccessToken('token-123');
      localStorage.setItem('refreshToken', 'refresh-token');

      apiClient.clearAuth();

      expect(apiClient.getAccessToken()).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it('should remain unauthenticated after clearAuth when localStorage already empty', () => {
      apiClient.clearAuth();
      expect(apiClient.getAccessToken()).toBeNull();
    });
  });

  describe('HTTP Method Surface', () => {
    it('should expose a get method', () => {
      expect(typeof apiClient.get).toBe('function');
    });

    it('should expose a post method', () => {
      expect(typeof apiClient.post).toBe('function');
    });

    it('should expose a put method', () => {
      expect(typeof apiClient.put).toBe('function');
    });

    it('should expose a delete method', () => {
      expect(typeof apiClient.delete).toBe('function');
    });
  });
});
