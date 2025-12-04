/**
 * Hook para mostrar notificaciones toast
 * 
 * Proporciona una función showToast para mostrar mensajes
 * de éxito, error, info o warning al usuario.
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export function useToast() {
  const showToast = (message: string, type: ToastType = 'info') => {
    // Por ahora usar alert nativo
    // En producción podrías usar una librería como react-hot-toast o sonner
    const emoji = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️',
    }[type];

    alert(`${emoji} ${message}`);
  };

  return { showToast };
}
