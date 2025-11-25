import axiosInstance from './axios-instance';

// Temporalmente hardcodeado para producción
const API_BASE_URL = import.meta.env.PUBLIC_API_URL ?? "http://Yoparticipo-api-env.eba-pynyf7cb.sa-east-1.elasticbeanstalk.com/api";

const TOKEN_KEY = 'authToken';
const TOKEN_EXPIRES_KEY = 'authTokenExpiresAt';
const LAST_ACTIVITY_KEY = 'authLastActivity';

// Token management
export function saveToken(token: string, expiresAt: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRES_KEY, expiresAt);
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem(TOKEN_KEY);
  const expiresAt = localStorage.getItem(TOKEN_EXPIRES_KEY);

  if (!token || !expiresAt) {
    removeToken();
    return null;
  }

  const expiresAtTime = Date.parse(expiresAt);
  if (Number.isNaN(expiresAtTime) || Date.now() >= expiresAtTime) {
    removeToken();
    return null;
  }

  return token;
}

export function getTokenExpiration(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const expiresAt = localStorage.getItem(TOKEN_EXPIRES_KEY);
  if (!expiresAt) {
    return null;
  }
  const expiresAtTime = Date.parse(expiresAt);
  return Number.isNaN(expiresAtTime) ? null : expiresAtTime;
}

export function updateLastActivityTimestamp() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }
}

export function getLastActivityTimestamp(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const value = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  }
}

export interface CreatePatientIntakePayload {
  nombres?: string;
  apellidos?: string;
  rut?: string;
  fechaNacimiento?: string;
  sexo?: string;
  telefono?: string;
  email?: string;
  region?: string;
  comuna?: string;
  direccion?: string;
  condicionPrincipal?: string;
  descripcionCondicion?: string;
  medicamentosActuales?: string;
  alergias?: string;
  cirugiasPrevias?: string;
  aceptaTerminos?: boolean;
  aceptaPrivacidad?: boolean;
  trialId?: string;
}

export interface PatientIntake extends CreatePatientIntakePayload {
  id: string;
  createdAt?: string;
  trial?: Trial | null;
  status?: 'RECEIVED' | 'REVIEWING' | 'CONTACTED' | 'DISCARDED';
}

// Función base para hacer requests HTTP
async function makeRequest<TResponse>(
  input: string,
  init?: RequestInit,
  includeAuth: boolean = false
): Promise<TResponse> {
  const headers: any = { ...init?.headers };
  
  if (includeAuth) {
    const token = getToken();
    if (!token) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
      throw new Error('No autenticado');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await axiosInstance.request({
      url: input,
      method: (init?.method as any) || 'GET',
      data: init?.body ? JSON.parse(init.body as string) : undefined,
      headers,
    });

    // Actualizar timestamp de actividad si hay autenticación
    if (includeAuth) {
      updateLastActivityTimestamp();
    }

    return response.data;
  } catch (error: any) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Algo salió mal';
    
    // Crear error con contexto
    const enhancedError: any = new Error(`${status ? `${status} - ` : ''}${message}`);
    enhancedError.status = status;
    enhancedError.response = error.response;
    
    // Si es 401 y requiere auth, redirigir al login
    if (includeAuth && status === 401) {
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    throw enhancedError;
  }
}

// Request sin autenticación
export async function request<TResponse>(
  input: string,
  init?: RequestInit
): Promise<TResponse> {
  return makeRequest<TResponse>(input, init, false);
}

// Request con autenticación
export async function fetchWithAuth<TResponse>(
  input: string,
  init?: RequestInit
): Promise<TResponse> {
  return makeRequest<TResponse>(input, init, true);
}

export async function createPatientIntake(payload: CreatePatientIntakePayload) {
  return request(`/patient-intakes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPatientIntakes(): Promise<PatientIntake[]> {
  return fetchWithAuth<PatientIntake[]>(`/patient-intakes`);
}

export async function getPatientIntakesByTrial(trialId: string): Promise<PatientIntake[]> {
  return fetchWithAuth<PatientIntake[]>(`/patient-intakes/trial/${trialId}`);
}

export async function getSponsors(): Promise<Sponsor[]> {
	return fetchWithAuth<Sponsor[]>(`/sponsors`);
}

export interface Sponsor {
  id: string;
  name: string;
}

export type TrialStatus = 'RECRUITING' | 'ACTIVE' | 'CLOSED' | 'DRAFT';

export interface Trial {
  id: string;
  title: string;
  public_description: string;
  status: TrialStatus;
  clinic_city: string;
  sponsor: Sponsor;
  created_at: string;
  updated_at: string;
  start_date?: string;
  end_date?: string;
  target_participants?: number;
  current_participants?: number;
  inclusion_criteria?: Record<string, unknown> | null;
}

export interface TrialsResponse {
  data: Trial[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface TrialsFilterParams {
  status?: TrialStatus;
  search?: string;
  city?: string;
  startDateFrom?: string;
  startDateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'status' | 'start_date' | 'end_date';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateTrialPayload {
  title: string;
  public_description: string;
  inclusion_criteria: object;
  clinic_city: string;
  sponsor_id?: string; // Sponsor es opcional
  status?: 'RECRUITING' | 'ACTIVE' | 'CLOSED';
}

export interface Paginated<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export async function getTrials(
  params: TrialsFilterParams = {}
): Promise<TrialsResponse> {
  const {
    status,
    search,
    city,
    startDateFrom,
    startDateTo,
    page = 1,
    limit = 10,
    sortBy = 'created_at',
    sortOrder = 'DESC',
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  });

  if (status) queryParams.append('status', status);
  if (search) queryParams.append('search', search);
  if (city) queryParams.append('city', city);
  if (startDateFrom) queryParams.append('startDateFrom', startDateFrom);
  if (startDateTo) queryParams.append('startDateTo', startDateTo);

  // Endpoint público - no requiere autenticación
  return request<TrialsResponse>(
    `/trials?${queryParams.toString()}`
  );
}

export async function getTrial(trialId: string): Promise<Trial> {
  return fetchWithAuth<Trial>(`/trials/${trialId}`);
}

export async function createTrial(payload: CreateTrialPayload) {
  return fetchWithAuth<Trial>(`/trials`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type UpdateTrialPayload = Partial<CreateTrialPayload>;

export async function updateTrial(trialId: string, payload: UpdateTrialPayload) {
  return fetchWithAuth<Trial>(`/trials/${trialId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTrial(trialId: string): Promise<void> {
  await fetchWithAuth<void>(`/trials/${trialId}`, {
    method: "DELETE",
  });
}

// Users
export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  birth_date?: string;
  created_at: string;
  updated_at: string;
}

export type CreateUserPayload = Omit<User, 'id' | 'created_at' | 'updated_at'> & { password?: string };
export type UpdateUserPayload = Partial<CreateUserPayload>;


export async function getUsers(): Promise<User[]> {
  return fetchWithAuth<User[]>(`/users`);
}

export async function createUser(payload: CreateUserPayload) {
  return fetchWithAuth<User>(`/users`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUser(userId: string, payload: UpdateUserPayload) {
  return fetchWithAuth<User>(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(userId: string): Promise<void> {
  await fetchWithAuth<void>(`/users/${userId}`, {
    method: "DELETE",
  });
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  expires_in: number;
  expires_at: string;
}

export async function login(payload: LoginPayload) {
  return request<LoginResponse>(`/auth/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ==================== ESTADÍSTICAS ====================

export interface DashboardStats {
  totalTrials: number;
  totalPatients: number;
  activeTrials: number;
  trialsByStatus: Array<{ status: string; count: number }>;
  patientsByStatus: Array<{ status: string; count: number }>;
  popularTrials: Array<{
    trial: Trial;
    patientCount: number;
  }>;
}

export interface TrendData {
  date: string;
  count: number;
}

export async function getStats(): Promise<DashboardStats> {
  return fetchWithAuth<DashboardStats>(`/stats`);
}

export async function getTrends(): Promise<TrendData[]> {
  return fetchWithAuth<TrendData[]>(`/stats/trends`);
}
