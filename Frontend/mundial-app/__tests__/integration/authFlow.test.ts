import { authService } from '@/services/auth';

global.fetch = jest.fn();

describe('Auth Service - Deep Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        success: true,
        data: {
          accessToken: 'valid-jwt-token-12345',
          user: { id: '1', email: 'user@example.com', displayName: 'John Doe', status: 'ACTIVE', createdAt: '2026-05-11' },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await authService.login('user@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(localStorage.getItem('authToken')).toBe('valid-jwt-token-12345');
    });

    it('should handle login with invalid credentials', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ success: false, message: 'Invalid credentials' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await authService.login('user@example.com', 'wrongpassword');
      expect(result.success).toBe(false);
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.login('user@example.com', 'password');
      expect(result.success).toBe(false);
      expect(result.message).toContain('conexión');
    });

    it('should return server-restart message on 500 error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: undefined }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await authService.login('user@example.com', 'password');
      expect(result.success).toBe(false);
      expect(result.message).toContain('reiniciando');
    });
  });

  describe('Register Flow', () => {
    it('should register new user and auto-login', async () => {
      const mockRegisterResponse = { success: true };
      const mockLoginResponse = {
        success: true,
        data: {
          accessToken: 'jwt-token',
          user: { id: '2', email: 'newuser@example.com', displayName: 'New User', status: 'ACTIVE', createdAt: '2026-05-11' },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegisterResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await authService.register({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'secure123',
        firstName: 'New',
        lastName: 'User',
      });

      // register now returns emailVerificationRequired — no auto-login
      expect(result.success).toBe(true);
      expect(result.emailVerificationRequired).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle registration errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ success: false, message: 'El email ya existe' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await authService.register({
        username: 'existing',
        email: 'existing@example.com',
        password: 'secure123',
        firstName: 'Existing',
        lastName: 'User',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBeTruthy();
    });

    it('should handle network error during registration', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.register({
        username: 'user',
        email: 'user@example.com',
        password: 'pass123',
        firstName: 'User',
        lastName: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('conexión');
    });
  });

  describe('Token Management', () => {
    it('should set and retrieve tokens', () => {
      const token = 'test-token-12345';
      localStorage.setItem('authToken', token);

      expect(authService.getToken()).toBe(token);
    });

    it('should return null when no token exists', () => {
      localStorage.clear();
      expect(authService.getToken()).toBe(null);
    });

    it('should check authentication status', () => {
      localStorage.clear();
      expect(authService.isAuthenticated()).toBe(false);

      localStorage.setItem('authToken', 'valid-token');
      expect(authService.isAuthenticated()).toBe(true);
    });
  });

  describe('User Data Management', () => {
    it('should retrieve stored user', () => {
      const mockUser = { id: '1', email: 'test@example.com', displayName: 'Test User', status: 'ACTIVE', createdAt: '2026-05-11' };
      localStorage.setItem('user', JSON.stringify(mockUser));

      expect(authService.getUser()).toEqual(mockUser);
    });

    it('should return null when no user stored', () => {
      localStorage.clear();
      expect(authService.getUser()).toBe(null);
    });

    it('should throw on corrupted user JSON', () => {
      localStorage.setItem('user', 'invalid-json{]');
      expect(() => authService.getUser()).toThrow();
    });
  });

  describe('Logout Flow', () => {
    it('should clear auth data on logout', () => {
      localStorage.setItem('authToken', 'token-123');
      localStorage.setItem('user', '{"id":"1"}');

      authService.logout();

      expect(localStorage.getItem('authToken')).toBe(null);
      expect(localStorage.getItem('user')).toBe(null);
    });

    it('should indicate unauthenticated after logout', () => {
      localStorage.setItem('authToken', 'token-123');
      authService.logout();

      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});
