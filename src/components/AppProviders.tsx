/**
 * AppProviders
 * 
 * Componente que envuelve toda la aplicación con los providers necesarios.
 * Incluye:
 * - ToastProvider: Sistema de notificaciones
 * - ToastContainer: Renderizado de notificaciones
 * 
 * Este componente debe envolver el contenido principal de cada página.
 */

import type { ReactNode } from 'react';
import { ToastProvider } from '../contexts/ToastContext';
import { ToastContainer } from './ui/ToastContainer';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}
