/**
 * useInactivityLogout - Hook ÚNICO para manejar cierre de sesión por inactividad
 * 
 * Este es el ÚNICO sistema que controla la inactividad. No duplicar en otros servicios.
 * El JWT tiene una expiración larga (8h). Este hook cierra sesión tras 1 hora sin actividad.
 * 
 * Uso:
 * ```tsx
 * // En el dashboard (componente raíz autenticado)
 * useInactivityLogout(60); // 60 minutos
 * ```
 * 
 * @module useInactivityLogout
 */

import { useEffect, useRef, useCallback } from 'react';
import { TokenService } from '../services/token.service';

/**
 * Hook para manejar el cierre de sesión automático por inactividad
 * 
 * Detecta eventos de usuario (mouse, teclado, scroll, touch) y reinicia
 * un temporizador. Si el usuario está inactivo por el tiempo especificado,
 * cierra la sesión automáticamente.
 * 
 * mousemove se procesa con throttle (1 evento cada 30s) para no sobrecargar
 * el navegador con escrituras a localStorage en cada pixel que mueve el ratón.
 * 
 * @param {number} timeoutMinutes - Tiempo de inactividad en minutos (default: 60)
 */
export function useInactivityLogout(timeoutMinutes: number = 60): void {
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMouseMoveProcess = useRef<number>(0);

  const handleLogout = useCallback(() => {
    if (TokenService.isValid()) {
      console.log(`[Inactividad] Sesión cerrada tras ${timeoutMinutes} min sin actividad`);
      TokenService.removeToken();
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('sessionExpired', 'true');
        window.location.href = '/auth?expired=true';
      }
    }
  }, [timeoutMinutes]);

  const resetTimer = useCallback(() => {
    // Limpiar temporizador anterior
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    
    // Actualizar timestamp de última actividad
    TokenService.updateActivity();
    
    // Crear nuevo temporizador
    inactivityTimer.current = setTimeout(handleLogout, timeoutMinutes * 60 * 1000);
  }, [timeoutMinutes, handleLogout]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    /**
     * Handler con throttle para mousemove (cada 30 segundos máximo)
     * Esto evita miles de escrituras a localStorage por segundo
     */
    const handleMouseMove = () => {
      const now = Date.now();
      if (now - lastMouseMoveProcess.current > 30_000) {
        lastMouseMoveProcess.current = now;
        resetTimer();
      }
    };

    /**
     * Handler directo para eventos de interacción clara
     * (click, tecla, scroll, touch) — siempre resetean el timer
     */
    const handleDirectActivity = () => {
      resetTimer();
    };

    // Eventos que siempre resetean el timer inmediatamente
    const directEvents = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    // mousemove con throttle separado
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Eventos directos
    directEvents.forEach(event => {
      window.addEventListener(event, handleDirectActivity, { passive: true });
    });

    // Iniciar el temporizador al montar
    resetTimer();

    // Limpieza al desmontar
    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      directEvents.forEach(event => {
        window.removeEventListener(event, handleDirectActivity);
      });
    };
  }, [resetTimer]);
}
