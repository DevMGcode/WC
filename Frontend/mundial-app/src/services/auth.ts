/**
 * Servicio de Autenticación
 * Maneja login, registro y tokens JWT
 */

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING';
  createdAt: string;
  // Campos de monetización — requieren migración en backend
  country?:      string; // ISO 3166-1 alpha-2, ej. "CO"
  isPremium?:    boolean;
  premiumUntil?: string | null;
}

export interface AuthResponse {
  success: boolean;
  emailVerificationRequired?: boolean;
  data?: {
    user: AuthUser;
    accessToken: string;
    refreshToken?: string;
  };
  message?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : null;

      if (!response.ok) {
        if (data?.message === 'EMAIL_NOT_VERIFIED') {
          return { success: false, message: 'Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.' };
        }
        if (data?.message) return { success: false, message: data.message };
        if (response.status >= 500) {
          return { success: false, message: 'El servidor se está reiniciando. Intenta de nuevo en unos segundos.' };
        }
        return { success: false, message: 'No se pudo iniciar sesión. Verifica tus credenciales.' };
      }

      if (!data) return { success: false, message: 'Respuesta inválida del servidor' };

      if (data.success && data.data?.accessToken) {
        localStorage.setItem('authToken', data.data.accessToken);
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data;
    } catch {
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  },

  async register(req: RegisterRequest): Promise<AuthResponse> {
    try {
      // 1. Create the user account
      const registerResponse = await fetch('/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: req.username,
          email: req.email,
          password: req.password,
          firstName: req.firstName,
          lastName: req.lastName,
        }),
      });

      const contentType = registerResponse.headers.get('content-type') || '';
      const registerData = contentType.includes('application/json')
        ? await registerResponse.json()
        : null;

      if (!registerResponse.ok || !registerData?.success) {
        return {
          success: false,
          message: registerData?.message || 'No se pudo crear la cuenta.',
        };
      }

      const emailVerified = registerData?.data?.emailVerified === true;
      return {
        success: true,
        emailVerificationRequired: !emailVerified,
        message: emailVerified
          ? '¡Cuenta creada! Inicia sesión con tus credenciales.'
          : 'Cuenta creada. Revisa tu correo y haz clic en el enlace de verificación para activarla.',
      };
    } catch {
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  },

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;

      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (data.success && data.data?.accessToken) {
        localStorage.setItem('authToken', data.data.accessToken);
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }
        return data.data.accessToken;
      }
      return null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  },

  getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
