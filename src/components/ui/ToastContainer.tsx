/**
 * Componente ToastContainer
 * 
 * Muestra las notificaciones toast en la esquina superior derecha.
 * Se integra con el ToastContext para mostrar notificaciones globales.
 * 
 * Características:
 * - Animaciones de entrada/salida
 * - Iconos según tipo de notificación
 * - Auto-dismiss configurable
 * - Botón de cierre manual
 */

import { useToast } from '../../contexts/ToastContext';
import type { ToastType } from '../../contexts/ToastContext';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const toastIcons: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconStyles: Record<ToastType, string> = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.type];
        
        return (
          <div
            key={toast.id}
            className={`
              flex items-start gap-3 p-4 rounded-lg border shadow-lg
              animate-in slide-in-from-right duration-300
              ${toastStyles[toast.type]}
            `}
          >
            <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconStyles[toast.type]}`} />
            
            <p className="flex-1 text-sm font-medium">
              {toast.message}
            </p>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
