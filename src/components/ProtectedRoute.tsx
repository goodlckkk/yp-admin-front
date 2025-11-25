import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { navigate } from '../utils/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = [],
  fallback 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, hasRole } = useAuth();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      navigate('/auth?sessionExpired=true');
      return;
    }

    // Si se requieren roles específicos, verificar
    if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
      // Mostrar mensaje de acceso denegado
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('show-notification', {
            detail: {
              type: 'error',
              message: 'No tienes permisos para acceder a esta página',
            },
          })
        );
      }
      
      // Redirigir al dashboard
      navigate('/dashboard');
      return;
    }

    setShouldRender(true);
  }, [isAuthenticated, isLoading, hasRole, requiredRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!shouldRender) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Componente para mostrar contenido solo si el usuario tiene ciertos roles
export function RoleGuard({ 
  children, 
  roles,
  fallback 
}: { 
  children: React.ReactNode; 
  roles: string[];
  fallback?: React.ReactNode;
}) {
  const { hasRole } = useAuth();

  if (!hasRole(roles)) {
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
}
