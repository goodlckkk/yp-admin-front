/**
 * Configuración global de la aplicación
 * 
 * Centraliza todas las constantes de configuración para facilitar
 * el mantenimiento y evitar valores hardcodeados en el código.
 * 
 * @module config
 */

/**
 * Configuración de la API
 */
export const API_CONFIG = {
  /** URL base de la API */
  BASE_URL: import.meta.env.PUBLIC_API_URL ?? 'https://api.yoparticipo.cl/api',
  
  /** Timeout para peticiones HTTP (en milisegundos) */
  TIMEOUT: 10000,
  
  /** Número máximo de reintentos para peticiones fallidas */
  MAX_RETRIES: 3,
} as const;

/**
 * Configuración de autenticación
 */
export const AUTH_CONFIG = {
  /** Clave para almacenar el token en localStorage */
  TOKEN_KEY: 'authToken',
  
  /** Clave para almacenar la expiración del token */
  TOKEN_EXPIRES_KEY: 'authTokenExpiresAt',
  
  /** Clave para almacenar la última actividad */
  LAST_ACTIVITY_KEY: 'authLastActivity',
  
  /** Tiempo de inactividad antes de cerrar sesión (en minutos) */
  INACTIVITY_TIMEOUT: 15,
  
  /** Tiempo antes de la expiración para mostrar advertencia (en minutos) */
  EXPIRATION_WARNING_TIME: 5,
  
  /** Ruta de login */
  LOGIN_PATH: '/auth',
  
  /** Ruta después de login exitoso */
  DEFAULT_REDIRECT: '/dashboard',
} as const;

/**
 * Configuración de paginación
 */
export const PAGINATION_CONFIG = {
  /** Número de items por página por defecto */
  DEFAULT_PAGE_SIZE: 10,
  
  /** Opciones de tamaño de página */
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  
  /** Número máximo de páginas a mostrar en el paginador */
  MAX_PAGES_SHOWN: 5,
} as const;

/**
 * Configuración de validación de formularios
 */
export const VALIDATION_CONFIG = {
  /** Longitud mínima de contraseña */
  MIN_PASSWORD_LENGTH: 8,
  
  /** Longitud máxima de contraseña */
  MAX_PASSWORD_LENGTH: 128,
  
  /** Patrón de email válido */
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  /** Patrón de RUT chileno válido */
  RUT_PATTERN: /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]{1}$/,
  
  /** Patrón de teléfono chileno */
  PHONE_PATTERN: /^(\+?56)?[2-9]\d{8}$/,
} as const;

/**
 * Configuración de notificaciones/toasts
 */
export const TOAST_CONFIG = {
  /** Duración por defecto de las notificaciones (en milisegundos) */
  DEFAULT_DURATION: 5000,
  
  /** Duración de notificaciones de éxito */
  SUCCESS_DURATION: 3000,
  
  /** Duración de notificaciones de error */
  ERROR_DURATION: 7000,
  
  /** Posición por defecto de las notificaciones */
  DEFAULT_POSITION: 'top-right' as const,
} as const;

/**
 * Configuración de estados de ensayos clínicos (según feedback)
 */
export const TRIAL_STATUS = {
  /** En preparación - Estudio en fase de planificación */
  PREPARATION: 'PREPARATION',
  
  /** Reclutamiento activo - Buscando participantes */
  RECRUITING: 'RECRUITING',
  
  /** En seguimiento - Estudio en curso con pacientes */
  FOLLOW_UP: 'FOLLOW_UP',
  
  /** Cerrado - Estudio finalizado */
  CLOSED: 'CLOSED',
} as const;

/**
 * Etiquetas legibles para estados de ensayos
 */
export const TRIAL_STATUS_LABELS: Record<string, string> = {
  [TRIAL_STATUS.PREPARATION]: 'En Preparación',
  [TRIAL_STATUS.RECRUITING]: 'Reclutamiento Activo',
  [TRIAL_STATUS.FOLLOW_UP]: 'En Seguimiento',
  [TRIAL_STATUS.CLOSED]: 'Cerrado',
} as const;

/**
 * Configuración de género/sexo
 */
export const GENDER_CONFIG = {
  /** Opciones válidas de género */
  OPTIONS: ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'] as const,
  
  /** Valores para la API */
  API_VALUES: {
    MALE: 'Masculino',
    FEMALE: 'Femenino',
    OTHER: 'Otro',
    PREFER_NOT_TO_SAY: 'Prefiero no decir',
  } as const,
} as const;

/**
 * Configuración de regiones de Chile
 */
export const REGIONS = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana',
  "O'Higgins",
  'Maule',
  'Ñuble',
  'Biobío',
  'Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes',
] as const;

/**
 * Configuración de ciudades principales
 */
export const CITIES = [
  'Santiago',
  'Valparaíso',
  'Viña del Mar',
  'Concepción',
  'La Serena',
  'Antofagasta',
  'Temuco',
  'Rancagua',
  'Talca',
  'Arica',
  'Chillán',
  'Iquique',
  'Puerto Montt',
  'Coyhaique',
  'Punta Arenas',
] as const;

/**
 * Configuración de archivos
 */
export const FILE_CONFIG = {
  /** Tamaño máximo de archivo en bytes (5MB) */
  MAX_SIZE: 5 * 1024 * 1024,
  
  /** Tipos de archivo permitidos para imágenes */
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  
  /** Tipos de archivo permitidos para documentos */
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

/**
 * Exportar toda la configuración como un objeto único
 */
export const CONFIG = {
  api: API_CONFIG,
  auth: AUTH_CONFIG,
  pagination: PAGINATION_CONFIG,
  validation: VALIDATION_CONFIG,
  toast: TOAST_CONFIG,
  trialStatus: TRIAL_STATUS,
  trialStatusLabels: TRIAL_STATUS_LABELS,
  gender: GENDER_CONFIG,
  regions: REGIONS,
  cities: CITIES,
  file: FILE_CONFIG,
} as const;

export default CONFIG;
