import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth, AuthContext } from '@/contexts/AuthContext';
import { authService } from '@/services/auth';

jest.mock('@/services/auth', () => ({
  authService: {
    getToken: jest.fn(),
    getUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: jest.fn(),
  },
}));

const mockedAuth = authService as jest.Mocked<typeof authService>;

function TestConsumer() {
  const { user, isAuthenticated, loading, error } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user ? user.email : 'none'}</span>
      <span data-testid="error">{error ?? 'none'}</span>
    </div>
  );
}

function LoginConsumer() {
  const { login, user, error } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.email : 'none'}</span>
      <span data-testid="error">{error ?? 'none'}</span>
      <button onClick={() => login('a@b.com', 'pass')}>Login</button>
    </div>
  );
}

function LogoutConsumer() {
  const { logout, user } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.email : 'none'}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAuth.getToken.mockReturnValue(null);
    mockedAuth.getUser.mockReturnValue(null);
    localStorage.clear();
  });

  describe('Context structure', () => {
    it('exports AuthContext with Provider and Consumer', () => {
      expect(AuthContext).toBeDefined();
      expect(AuthContext.Provider).toBeDefined();
      expect(AuthContext.Consumer).toBeDefined();
    });

    it('useAuth throws when used outside AuthProvider', () => {
      const originalConsoleError = console.error;
      console.error = jest.fn();

      expect(() => render(<TestConsumer />)).toThrow('useAuth debe usarse dentro de un AuthProvider');

      console.error = originalConsoleError;
    });
  });

  describe('Initial state', () => {
    it('renders with no user when localStorage is empty', async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('none');
    });

    it('restores user from localStorage on mount', async () => {
      const savedUser = { id: '1', email: 'saved@example.com', displayName: 'Saved', status: 'ACTIVE' as const, createdAt: '2026-01-01' };
      mockedAuth.getToken.mockReturnValue('valid-token');
      mockedAuth.getUser.mockReturnValue(savedUser);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
      expect(screen.getByTestId('user').textContent).toBe('saved@example.com');
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });
  });

  describe('Login', () => {
    it('sets user and isAuthenticated on successful login', async () => {
      const user = { id: '1', email: 'a@b.com', displayName: 'A', status: 'ACTIVE' as const, createdAt: '2026-01-01' };
      mockedAuth.login.mockResolvedValueOnce({ success: true, data: { user, accessToken: 'tok' } });

      render(
        <AuthProvider>
          <LoginConsumer />
        </AuthProvider>
      );

      await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('none'));

      await act(async () => {
        screen.getByText('Login').click();
      });

      await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('a@b.com'));
    });

    it('sets error message on failed login', async () => {
      mockedAuth.login.mockResolvedValueOnce({ success: false, message: 'Credenciales inválidas' });

      render(
        <AuthProvider>
          <LoginConsumer />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByText('Login').click();
      });

      await waitFor(() => expect(screen.getByTestId('error').textContent).toBe('Credenciales inválidas'));
      expect(screen.getByTestId('user').textContent).toBe('none');
    });
  });

  describe('Logout', () => {
    it('clears user on logout', async () => {
      const user = { id: '1', email: 'a@b.com', displayName: 'A', status: 'ACTIVE' as const, createdAt: '2026-01-01' };
      mockedAuth.getToken.mockReturnValue('valid-token');
      mockedAuth.getUser.mockReturnValue(user);

      render(
        <AuthProvider>
          <LogoutConsumer />
        </AuthProvider>
      );

      await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('a@b.com'));

      act(() => {
        screen.getByText('Logout').click();
      });

      await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('none'));
      expect(mockedAuth.logout).toHaveBeenCalledTimes(1);
    });
  });
});
