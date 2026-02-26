import { login as apiLogin, getToken, removeToken, saveToken, getTokenExpiration, updateLastActivityTimestamp } from '../lib/api';
import type { LoginPayload, LoginResponse } from '../lib/api';

const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutos antes de que expire
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutos de inactividad

class AuthService {
  private refreshTimeout: number | null = null;
  private inactivityTimeout: number | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<LoginResponse | null> | null = null;

  constructor() {
    // Inicializar manejadores de eventos para detectar actividad del usuario
    if (typeof window !== 'undefined') {
      // Eventos que indican actividad del usuario
      const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      activityEvents.forEach(event => {
        window.addEventListener(event, this.resetInactivityTimer, false);
      });

      // Iniciar el temporizador de inactividad
      this.resetInactivityTimer();
    }
  }

  /**
   * Iniciar sesión
   */
  public async login(credentials: LoginPayload): Promise<LoginResponse> {
    try {
      const response = await apiLogin(credentials);
      this.setSession(response);
      return response;
    } catch (error) {
      this.clearSession();
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  public logout(redirectTo: string = '/auth'): void {
    this.clearSession();
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  public isAuthenticated(): boolean {
    const token = getToken();
    if (!token) return false;

    const expiresAt = getTokenExpiration();
    return expiresAt ? Date.now() < expiresAt : false;
  }

  /**
   * Obtener el token de autenticación
   * Si el token está por expirar, intenta renovarlo
   */
  public async getAuthToken(): Promise<string | null> {
    if (!this.isAuthenticated()) {
      return null;
    }

    // Verificar si el token está por expirar
    const expiresAt = getTokenExpiration();
    if (expiresAt && (expiresAt - Date.now() < TOKEN_REFRESH_THRESHOLD)) {
      // Si ya hay una renovación en curso, devolver esa promesa
      if (this.isRefreshing && this.refreshPromise) {
        const response = await this.refreshPromise;
        return response?.access_token || null;
      }
      
      // Intentar renovar el token
      await this.refreshToken();
    }

    return getToken();
  }

  /**
   * Renovar el token de autenticación
   */
  private async refreshToken(): Promise<LoginResponse | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = new Promise(async (resolve, reject) => {
      try {
        // Aquí deberías implementar la lógica para renovar el token
        // Por ahora, simplemente devolvemos null ya que necesitaríamos un endpoint de refresh
        this.isRefreshing = false;
        this.refreshPromise = null;
        resolve(null);
      } catch (error) {
        this.clearSession();
        this.isRefreshing = false;
        this.refreshPromise = null;
        reject(error);
      }
    });

    return this.refreshPromise;
  }

  /**
   * Establecer la sesión del usuario
   */
  private setSession(authResult: LoginResponse): void {
    // Guardar el token y la fecha de expiración
    saveToken(authResult.access_token, authResult.expires_at);
    
    // Programar la renovación del token
    this.scheduleTokenRefresh();
    
    // Reiniciar el temporizador de inactividad
    this.resetInactivityTimer();
  }

  /**
   * Limpiar la sesión
   */
  private clearSession(): void {
    // Limpiar timeouts
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
    
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }
    
    // Eliminar el token
    removeToken();
  }

  /**
   * Programar la renovación del token
   */
  private scheduleTokenRefresh(): void {
    const expiresAt = getTokenExpiration();
    if (!expiresAt) return;

    // Calcular cuándo renovar el token (5 minutos antes de que expire)
    const timeout = expiresAt - Date.now() - TOKEN_REFRESH_THRESHOLD;
    
    if (timeout > 0) {
      // Limpiar el timeout anterior si existe
      if (this.refreshTimeout) {
        clearTimeout(this.refreshTimeout);
      }
      
      // Programar la renovación
      this.refreshTimeout = window.setTimeout(async () => {
        await this.refreshToken();
      }, timeout);
    }
  }

  /**
   * Reiniciar el temporizador de inactividad
   */
  private resetInactivityTimer = (): void => {
    // Limpiar el timeout anterior
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
    
    // Programar el cierre de sesión por inactividad
    this.inactivityTimeout = window.setTimeout(() => {
      if (this.isAuthenticated()) {
        this.logout('/auth');
      }
    }, SESSION_TIMEOUT);
    
    // Actualizar la marca de tiempo de la última actividad
    updateLastActivityTimestamp();
  };
}

export const authService = new AuthService();

// Tipos de error de autenticación
export enum AuthError {
  UNAUTHORIZED = 'UNAUTHORIZED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNKNOWN = 'UNKNOWN',
}

// Función para manejar errores de autenticación
export function handleAuthError(error: unknown): { message: string; type: AuthError } {
  if (error instanceof Error) {
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return { message: 'No autorizado. Por favor, inicia sesión nuevamente.', type: AuthError.UNAUTHORIZED };
    }
    
    if (error.message.includes('Network Error')) {
      return { message: 'Error de conexión. Por favor, verifica tu conexión a internet.', type: AuthError.NETWORK_ERROR };
    }
  }
  
  return { message: 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.', type: AuthError.UNKNOWN };
}
