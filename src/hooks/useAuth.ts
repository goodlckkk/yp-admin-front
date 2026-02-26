import { useState, useEffect } from 'react';
import { getToken } from '../lib/api';

export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'MODERATOR' | 'DOCTOR' | 'PATIENT' | 'INSTITUTION';
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    
    if (token) {
      // Decodificar el token JWT para obtener la información del usuario
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        });
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    
    setIsLoading(false);
  }, []);

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  };

  const isAdmin = (): boolean => {
    return user?.role === 'ADMIN';
  };

  const isDoctor = (): boolean => {
    return user?.role === 'DOCTOR';
  };

  const isPatient = (): boolean => {
    return user?.role === 'PATIENT';
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasRole,
    isAdmin,
    isDoctor,
    isPatient,
  };
}
