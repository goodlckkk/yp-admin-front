/**
 * AuthGuardService - Servicio centralizado para protección de rutas
 * 
 * Responsabilidad única: Verificar autenticación y manejar redirecciones
 * cuando el usuario no está autenticado o la sesión ha expirado.
 * 
 * @module AuthGuardService
 */

import { TokenService } from './token.service';

export class AuthGuardService {
  private static readonly LOGIN_PATH = '/auth';
  private static readonly INACTIVITY_TIMEOUT = 24 * 60 * 60 * 1000; // 24 horas

  /**
   * Verifica si el usuario está autenticado
   * Si no lo está, redirige al login
   * 
   * @throws {Error} Si el usuario no está autenticado
   */
  static requireAuth(): void {
    const token = TokenService.getToken();
    
    if (!token || !TokenService.isValid()) {
      this.redirectToLogin();
      throw new Error('Unauthorized - No valid token');
    }

    // Verificar inactividad
    if (TokenService.isInactive(this.INACTIVITY_TIMEOUT)) {
      this.handleInactivity();
      throw new Error('Session expired due to inactivity');
    }

    // Actualizar actividad
    TokenService.updateActivity();
  }

  /**
   * Verifica autenticación sin lanzar error
   * Útil para verificaciones condicionales
   * 
   * @returns {boolean} true si está autenticado, false en caso contrario
   */
  static isAuthenticated(): boolean {
    try {
      this.requireAuth();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Redirige al usuario a la página de login
   * Limpia el token antes de redirigir
   */
  static redirectToLogin(): void {
    TokenService.clear();
    
    if (typeof window !== 'undefined') {
      window.location.href = this.LOGIN_PATH;
    }
  }

  /**
   * Maneja el caso de inactividad del usuario
   * Muestra mensaje opcional y redirige al login
   */
  static handleInactivity(): void {
    TokenService.clear();
    
    if (typeof window !== 'undefined') {
      // Opcional: Mostrar mensaje de sesión expirada
      sessionStorage.setItem('sessionExpired', 'true');
      window.location.href = this.LOGIN_PATH;
    }
  }

  /**
   * Verifica si el token está próximo a expirar
   * Útil para mostrar advertencias al usuario
   * 
   * @param {number} threshold - Tiempo en ms antes de expiración (default: 5 min)
   * @returns {boolean} true si expirará pronto
   */
  static isExpiringSoon(threshold: number = 5 * 60 * 1000): boolean {
    return TokenService.isExpiringSoon(threshold);
  }

  /**
   * Obtiene el tiempo restante hasta la expiración del token
   * 
   * @returns {number | null} Milisegundos hasta expiración o null si no hay token
   */
  static getTimeUntilExpiration(): number | null {
    const expiresAt = TokenService.getExpiration();
    if (!expiresAt) {
      return null;
    }

    const remaining = expiresAt - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Obtiene el tiempo de inactividad actual
   * 
   * @returns {number | null} Milisegundos de inactividad o null si no hay actividad registrada
   */
  static getInactivityTime(): number | null {
    const lastActivity = TokenService.getLastActivity();
    if (!lastActivity) {
      return null;
    }

    return Date.now() - lastActivity;
  }

  /**
   * Verifica si hay un mensaje de sesión expirada
   * Útil para mostrar notificaciones en la página de login
   * 
   * @returns {boolean} true si la sesión expiró por inactividad
   */
  static hasSessionExpired(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const expired = sessionStorage.getItem('sessionExpired');
    if (expired === 'true') {
      sessionStorage.removeItem('sessionExpired');
      return true;
    }

    return false;
  }
}
