/**
 * Integration test para AuthContext (provider + useAuth hook).
 *
 * Cubre el ciclo de vida completo:
 *   1. Estado inicial: user=null, loading=true → tras useEffect loading=false
 *   2. login OK: user pasa a estar autenticado, isAuthenticated=true
 *   3. login KO: error queda en context con el mensaje del backend
 *   4. logout: limpia user, isAuthenticated=false, localStorage limpio
 *   5. Restaura sesión cuando hay authToken + user en localStorage al montar
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth';

// Componente de prueba que expone el contexto al DOM.
function AuthProbe() {
  const { user, loading, isAuthenticated, login, logout, error } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user ? user.email : 'none'}</span>
      <span data-testid="error">{error || 'none'}</span>
      <button onClick={() => login('admin@example.com', 'admin')}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('al montar sin token: loading pasa de true→false con user=null', async () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('al montar con sesión persistida en localStorage, restaura el user', async () => {
    localStorage.setItem('authToken', 'tok-x');
    localStorage.setItem('user', JSON.stringify({
      id: '2', email: 'admin@example.com', displayName: 'Admin', status: 'ACTIVE', createdAt: '2026-05-26'
    }));

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('admin@example.com');
  });

  it('login OK actualiza el contexto a authenticated=true', async () => {
    jest.spyOn(authService, 'login').mockResolvedValue({
      success: true,
      data: {
        user: { id: '2', email: 'admin@example.com', displayName: 'Admin', status: 'ACTIVE', createdAt: '2026-05-26' },
        accessToken: 'access', refreshToken: 'refresh'
      }
    } as any);

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    await act(async () => {
      screen.getByText('login').click();
    });

    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'));
    expect(screen.getByTestId('user')).toHaveTextContent('admin@example.com');
    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });

  it('login KO con "Credenciales inválidas" (Fix A) deja error en el contexto', async () => {
    jest.spyOn(authService, 'login').mockResolvedValue({
      success: false,
      message: 'Credenciales inválidas'
    } as any);

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    await act(async () => {
      screen.getByText('login').click();
    });

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('Credenciales inválidas'));
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('logout limpia user, authenticated y localStorage', async () => {
    localStorage.setItem('authToken', 'tok');
    localStorage.setItem('user', JSON.stringify({
      id: '1', email: 'x@x.com', displayName: 'X', status: 'ACTIVE', createdAt: '2026-05-26'
    }));

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'));

    await act(async () => {
      screen.getByText('logout').click();
    });

    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('false'));
    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
