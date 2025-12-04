/**
 * useRequireAuth - Hook personalizado para proteger componentes
 * 
 * Responsabilidad única: Verificar autenticación al montar el componente
 * y redirigir al login si el usuario no está autenticado.
 * 
 * Uso:
 * ```tsx
 * function ProtectedComponent() {
 *   useRequireAuth(); // Una sola línea
 *   // ... resto del componente
 * }
 * ```
 * 
 * @module useRequireAuth
 */

import { useEffect } from 'react';
import { AuthGuardService } from '../services/auth-guard.service';

/**
 * Hook que verifica autenticación al montar el componente
 * Redirige automáticamente al login si no hay sesión válida
 * 
 * @param {boolean} checkInactivity - Si debe verificar inactividad (default: true)
 */
export function useRequireAuth(checkInactivity: boolean = true): void {
  useEffect(() => {
    try {
      AuthGuardService.requireAuth();
    } catch (error) {
      // El AuthGuardService ya maneja la redirección
      console.error('Authentication required:', error);
    }
  }, []);

  // Verificar inactividad periódicamente si está habilitado
  useEffect(() => {
    if (!checkInactivity) {
      return;
    }

    const interval = setInterval(() => {
      try {
        AuthGuardService.requireAuth();
      } catch (error) {
        // El AuthGuardService ya maneja la redirección
        console.error('Session expired:', error);
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [checkInactivity]);
}
