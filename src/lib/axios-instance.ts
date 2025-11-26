import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Funciones de token locales para evitar importación circular
const TOKEN_KEY = 'authToken';

function getTokenLocal(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

function removeTokenLocal(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('authTokenExpiresAt');
    localStorage.removeItem('authLastActivity');
  }
}

// Crear instancia de Axios con configuración base
const axiosInstance = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL || 'https://api.yoparticipo.cl/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request - Añadir token automáticamente
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getTokenLocal();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response - Manejar errores globalmente
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 401:
          // Token inválido o expirado
          removeTokenLocal();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth';
          }
          break;
          
        case 403:
          // Sin permisos
          console.error('Acceso denegado: No tienes permisos para realizar esta acción');
          // Mostrar notificación al usuario
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('show-notification', {
                detail: {
                  type: 'error',
                  message: 'No tienes permisos para realizar esta acción',
                },
              })
            );
          }
          break;
          
        case 404:
          console.error('Recurso no encontrado');
          break;
          
        case 429:
          // Rate limit excedido
          console.error('Demasiadas solicitudes. Por favor, espera un momento.');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('show-notification', {
                detail: {
                  type: 'error',
                  message: 'Demasiadas solicitudes. Por favor, espera un momento.',
                },
              })
            );
          }
          break;
          
        case 500:
        case 502:
        case 503:
          console.error('Error del servidor. Por favor, intenta más tarde.');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('show-notification', {
                detail: {
                  type: 'error',
                  message: 'Error del servidor. Por favor, intenta más tarde.',
                },
              })
            );
          }
          break;
          
        default:
          console.error('Error en la solicitud:', error.message);
      }
    } else if (error.request) {
      // Error de red
      console.error('Error de conexión. Verifica tu conexión a internet.');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('show-notification', {
            detail: {
              type: 'error',
              message: 'Error de conexión. Verifica tu conexión a internet.',
            },
          })
        );
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
