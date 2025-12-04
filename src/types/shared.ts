/**
 * Tipos compartidos de la aplicación
 * 
 * Centraliza todos los tipos TypeScript que se usan en múltiples lugares
 * para evitar duplicación y facilitar el mantenimiento.
 * 
 * @module types/shared
 */

/**
 * Tipo para estados de carga
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Tipo para respuestas paginadas de la API
 */
export interface PaginatedResponse<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/**
 * Tipo para filtros de paginación
 */
export interface PaginationFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Tipo para respuestas de error de la API
 */
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: Record<string, any>;
}

/**
 * Tipo para opciones de select/dropdown
 */
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * Tipo para notificaciones/toasts
 */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

/**
 * Tipo para coordenadas geográficas
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Tipo para direcciones
 */
export interface Address {
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  coordinates?: Coordinates;
}

/**
 * Tipo para información de contacto
 */
export interface ContactInfo {
  email?: string;
  phone?: string;
  alternativePhone?: string;
  address?: Address;
}

/**
 * Tipo para metadatos de auditoría
 */
export interface AuditMetadata {
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Tipo para entidades con ID
 */
export interface Entity {
  id: string;
}

/**
 * Tipo para entidades con timestamps
 */
export interface TimestampedEntity extends Entity, AuditMetadata {}

/**
 * Tipo para estados de ensayos clínicos (según feedback)
 */
export type TrialStatus = 'PREPARATION' | 'RECRUITING' | 'FOLLOW_UP' | 'CLOSED';

/**
 * Tipo para género/sexo
 */
export type Gender = 'Masculino' | 'Femenino' | 'Otro' | 'Prefiero no decir';

/**
 * Tipo para estados de postulación de pacientes
 */
export type PatientIntakeStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

/**
 * Tipo para roles de usuario
 */
export type UserRole = 'admin' | 'researcher' | 'coordinator' | 'viewer';

/**
 * Tipo para permisos
 */
export type Permission = 
  | 'trials:read'
  | 'trials:write'
  | 'trials:delete'
  | 'patients:read'
  | 'patients:write'
  | 'patients:delete'
  | 'users:read'
  | 'users:write'
  | 'users:delete';

/**
 * Tipo para información de usuario autenticado
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  avatar?: string;
}

/**
 * Tipo para tokens de autenticación
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
}

/**
 * Tipo para respuesta de login
 */
export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

/**
 * Tipo para filtros de búsqueda
 */
export interface SearchFilters extends PaginationFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Tipo para estadísticas generales
 */
export interface Statistics {
  total: number;
  active: number;
  completed: number;
  pending: number;
  [key: string]: number;
}

/**
 * Tipo para archivos subidos
 */
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

/**
 * Tipo para validación de formularios
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Tipo para resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Tipo helper para hacer propiedades opcionales
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Tipo helper para hacer propiedades requeridas
 */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Tipo helper para valores de un objeto
 */
export type ValueOf<T> = T[keyof T];

/**
 * Tipo helper para claves de un objeto
 */
export type KeyOf<T> = keyof T;

/**
 * Tipo helper para promesas
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Tipo helper para funciones asíncronas
 */
export type AsyncFunction<T = void> = (...args: any[]) => Promise<T>;

/**
 * Tipo helper para callbacks
 */
export type Callback<T = void> = (value: T) => void;

/**
 * Tipo helper para event handlers
 */
export type EventHandler<T = Event> = (event: T) => void;
