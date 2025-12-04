/**
 * TokenService - Servicio centralizado para gestión de tokens JWT
 * 
 * Responsabilidad única: Manejar todas las operaciones relacionadas con el token de autenticación
 * en localStorage, incluyendo almacenamiento, recuperación, validación y expiración.
 * 
 * @module TokenService
 */

export class TokenService {
  private static readonly TOKEN_KEY = 'authToken';
  private static readonly EXPIRES_KEY = 'authTokenExpiresAt';
  private static readonly ACTIVITY_KEY = 'lastActivity';

  /**
   * Obtiene el token JWT del localStorage
   * Valida automáticamente si el token ha expirado
   * 
   * @returns {string | null} El token si es válido, null si no existe o ha expirado
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const token = localStorage.getItem(this.TOKEN_KEY);
    const expiresAt = localStorage.getItem(this.EXPIRES_KEY);

    if (!token || !expiresAt) {
      this.removeToken();
      return null;
    }

    const expiresAtTime = Date.parse(expiresAt);
    if (Number.isNaN(expiresAtTime) || Date.now() >= expiresAtTime) {
      this.removeToken();
      return null;
    }

    return token;
  }

  /**
   * Almacena el token JWT y su fecha de expiración en localStorage
   * También actualiza el timestamp de última actividad
   * 
   * @param {string} token - El token JWT a almacenar
   * @param {string} expiresAt - Fecha de expiración en formato ISO string
   */
  static saveToken(token: string, expiresAt: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.EXPIRES_KEY, expiresAt);
    this.updateActivity();
  }

  /**
   * Elimina el token y todos los datos relacionados del localStorage
   */
  static removeToken(): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_KEY);
    localStorage.removeItem(this.ACTIVITY_KEY);
  }

  /**
   * Obtiene la fecha de expiración del token en milisegundos
   * 
   * @returns {number | null} Timestamp de expiración o null si no existe
   */
  static getExpiration(): number | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const expiresAt = localStorage.getItem(this.EXPIRES_KEY);
    if (!expiresAt) {
      return null;
    }

    const parsed = Date.parse(expiresAt);
    return Number.isNaN(parsed) ? null : parsed;
  }

  /**
   * Verifica si el token actual es válido (existe y no ha expirado)
   * 
   * @returns {boolean} true si el token es válido, false en caso contrario
   */
  static isValid(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const expiresAt = this.getExpiration();
    return expiresAt ? Date.now() < expiresAt : false;
  }

  /**
   * Actualiza el timestamp de última actividad del usuario
   * Usado para detectar inactividad y cerrar sesión automáticamente
   */
  static updateActivity(): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(this.ACTIVITY_KEY, Date.now().toString());
  }

  /**
   * Obtiene el timestamp de la última actividad del usuario
   * 
   * @returns {number | null} Timestamp de última actividad o null si no existe
   */
  static getLastActivity(): number | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const lastActivity = localStorage.getItem(this.ACTIVITY_KEY);
    if (!lastActivity) {
      return null;
    }

    const parsed = parseInt(lastActivity, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  /**
   * Verifica si el usuario ha estado inactivo por más tiempo del permitido
   * 
   * @param {number} maxInactiveTime - Tiempo máximo de inactividad en milisegundos (default: 15 minutos)
   * @returns {boolean} true si el usuario está inactivo, false en caso contrario
   */
  static isInactive(maxInactiveTime: number = 15 * 60 * 1000): boolean {
    const lastActivity = this.getLastActivity();
    if (!lastActivity) {
      return true;
    }

    return Date.now() - lastActivity > maxInactiveTime;
  }

  /**
   * Verifica si el token está próximo a expirar
   * 
   * @param {number} threshold - Tiempo en milisegundos antes de la expiración (default: 5 minutos)
   * @returns {boolean} true si el token expirará pronto, false en caso contrario
   */
  static isExpiringSoon(threshold: number = 5 * 60 * 1000): boolean {
    const expiresAt = this.getExpiration();
    if (!expiresAt) {
      return true;
    }

    return expiresAt - Date.now() < threshold;
  }

  /**
   * Limpia todos los datos de autenticación
   * Alias de removeToken() para mayor claridad semántica
   */
  static clear(): void {
    this.removeToken();
  }
}
