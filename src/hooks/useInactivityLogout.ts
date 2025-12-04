/**
 * useInactivityLogout - Hook personalizado para manejar cierre de sesión por inactividad
 * 
 * Responsabilidad única: Detectar inactividad del usuario y cerrar sesión automáticamente
 * 
 * Uso:
 * ```tsx
 * // En el layout principal o componente raíz
 * useInactivityLogout(15); // 15 minutos de timeout
 * ```
 * 
 * @module useInactivityLogout
 */

import { useEffect } from 'react';
import { TokenService } from '../services/token.service';

/**
 * Hook para manejar el cierre de sesión automático por inactividad
 * 
 * Detecta eventos de usuario (mouse, teclado, scroll, touch) y reinicia
 * un temporizador. Si el usuario está inactivo por el tiempo especificado,
 * cierra la sesión automáticamente.
 * 
 * @param {number} timeoutMinutes - Tiempo de inactividad en minutos (default: 15)
 * 
 * @example
 * // Uso básico con timeout de 15 minutos
 * function App() {
 *   useInactivityLogout();
 *   return <div>...</div>;
 * }
 * 
 * @example
 * // Con timeout personalizado de 30 minutos
 * function App() {
 *   useInactivityLogout(30);
 *   return <div>...</div>;
 * }
 */
export function useInactivityLogout(timeoutMinutes: number = 15): void {
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;

    const timeoutMs = timeoutMinutes * 60 * 1000;
    let inactivityTimer: NodeJS.Timeout;

    /**
     * Reinicia el temporizador de inactividad
     * Se llama cada vez que el usuario interactúa con la página
     */
    const resetTimer = () => {
      // Limpiar temporizador anterior
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      
      // Actualizar timestamp de última actividad
      TokenService.updateActivity();
      
      // Crear nuevo temporizador
      inactivityTimer = setTimeout(() => {
        // Verificar si el token sigue siendo válido antes de cerrar sesión
        if (TokenService.isValid()) {
          console.log('Sesión cerrada por inactividad');
          
          // Remover token
          TokenService.removeToken();
          
          // Redirigir al login con mensaje de sesión expirada
          if (typeof window !== 'undefined') {
            window.location.href = '/auth?expired=true';
          }
        }
      }, timeoutMs);
    };

    /**
     * Eventos que indican actividad del usuario
     * Cualquiera de estos eventos reinicia el temporizador
     */
    const events = [
      'mousedown',    // Click del mouse
      'mousemove',    // Movimiento del mouse
      'keydown',      // Tecla presionada
      'scroll',       // Scroll de página
      'touchstart',   // Touch en dispositivos móviles
      'click'         // Click en cualquier elemento
    ];

    // Registrar listeners para todos los eventos
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Iniciar el temporizador al montar el componente
    resetTimer();

    /**
     * Limpieza al desmontar el componente
     * Remueve todos los listeners y limpia el temporizador
     */
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [timeoutMinutes]);
}
