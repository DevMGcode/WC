/**
 * Servicio de Autenticación
 * Maneja login, registro y tokens JWT
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING';
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: AuthUser;
    accessToken: string;
    refreshToken?: string;
  };
  message?: string;
}

export const authService = {
  /**
   * Login con email y password
   * Llamada directa al backend con JWT
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : null;

      if (!response.ok) {
        if (data?.message) {
          return { success: false, message: data.message };
        }

        if (response.status >= 500) {
          return {
            success: false,
            message: 'El servidor se esta reiniciando. Intenta de nuevo en unos segundos.',
          };
        }

        return {
          success: false,
          message: 'No se pudo iniciar sesion. Verifica tus credenciales.',
        };
      }

      if (!data) {
        return {
          success: false,
          message: 'Respuesta invalida del servidor',
        };
      }

      if (data.success && data.data?.accessToken) {
        // Guardar token en localStorage
        localStorage.setItem('authToken', data.data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor',
      };
    }
  },

  /**
   * Registro de nuevo usuario
   */
  async register(
    email: string,
    displayName: string,
    password: string
  ): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, displayName, password }),
      });

      const data = await response.json();

      if (data.success && data.data?.accessToken) {
        localStorage.setItem('authToken', data.data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor',
      };
    }
  },

  /**
   * Obtener usuario actual desde token
   */
  async getMe(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener usuario',
      };
    }
  },

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  /**
   * Obtener token guardado
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  },

  /**
   * Obtener usuario guardado
   */
  getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Verificar si está logueado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
