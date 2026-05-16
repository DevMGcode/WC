import apiClient from '@/services/api';

/**
 * Tests for ApiClient token management.
 * HTTP methods require a running server so they are tested in integration.
 */
describe('ApiClient — Token Management', () => {
  beforeEach(() => {
    localStorage.clear();
    apiClient.clearAuth();
  });

  it('setAccessToken stores the token in memory and in localStorage', () => {
    apiClient.setAccessToken('tok-abc');
    expect(apiClient.getAccessToken()).toBe('tok-abc');
    expect(localStorage.getItem('authToken')).toBe('tok-abc');
  });

  it('getAccessToken returns null when nothing is set', () => {
    expect(apiClient.getAccessToken()).toBeNull();
  });

  it('getAccessToken falls back to localStorage when memory is empty', () => {
    localStorage.setItem('authToken', 'stored-token');
    // Memory is empty (clearAuth was called in beforeEach), so it reads from localStorage
    expect(apiClient.getAccessToken()).toBe('stored-token');
  });

  it('clearAuth removes token from memory and removes both localStorage keys', () => {
    apiClient.setAccessToken('some-token');
    localStorage.setItem('refreshToken', 'refresh-123');

    apiClient.clearAuth();

    expect(apiClient.getAccessToken()).toBeNull();
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('calling setAccessToken twice updates both storages with the latest value', () => {
    apiClient.setAccessToken('first-token');
    apiClient.setAccessToken('second-token');

    expect(apiClient.getAccessToken()).toBe('second-token');
    expect(localStorage.getItem('authToken')).toBe('second-token');
  });

  it('HTTP methods exist as functions on the client', () => {
    expect(typeof apiClient.get).toBe('function');
    expect(typeof apiClient.post).toBe('function');
    expect(typeof apiClient.put).toBe('function');
    expect(typeof apiClient.delete).toBe('function');
  });
});
