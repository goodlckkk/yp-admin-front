/**
 * useRequireAuth - Hook personalizado para proteger componentes
 * 
 * Responsabilidad única: Verificar autenticación al montar el componente
 * y redirigir al login si el usuario no está autenticado.
 * 
 * NOTA: La inactividad la controla exclusivamente useInactivityLogout.
 * Este hook solo verifica que el token JWT sea válido (no expirado).
 * 
 * Uso:
 * ```tsx
 * function ProtectedComponent() {
 *   useRequireAuth();
 *   // ... resto del componente
 * }
 * ```
 * 
 * @module useRequireAuth
 */

import { useEffect } from 'react';
import { TokenService } from '../services/token.service';

/**
 * Hook que verifica autenticación al montar el componente
 * Redirige automáticamente al login si no hay sesión válida (token expirado o ausente)
 * 
 * Hace un chequeo periódico cada 5 minutos para detectar si el JWT expiró.
 * NO controla inactividad — eso lo hace useInactivityLogout.
 */
export function useRequireAuth(): void {
  useEffect(() => {
    // Verificar al montar
    if (!TokenService.isValid()) {
      TokenService.clear();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    }
  }, []);

  // Chequeo periódico de validez del token (cada 5 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!TokenService.isValid()) {
        TokenService.clear();
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('sessionExpired', 'true');
          window.location.href = '/auth?expired=true';
        }
      }
    }, 5 * 60 * 1000); // Cada 5 minutos

    return () => clearInterval(interval);
  }, []);
}
