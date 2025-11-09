const API_BASE_URL = import.meta.env.PUBLIC_VITE_API_URL ?? "http://localhost:3000/api";

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
  nombres: string;
  apellidos: string;
  rut: string;
  fechaNacimiento: string;
  sexo: string;
  telefono: string;
  email: string;
  region: string;
  comuna: string;
  direccion?: string;
  condicionPrincipal: string;
  descripcionCondicion: string;
  medicamentosActuales?: string;
  alergias?: string;
  cirugiasPrevias?: string;
  aceptaTerminos: boolean;
  aceptaPrivacidad: boolean;
}

export interface PatientIntake extends CreatePatientIntakePayload {
  id: string;
  createdAt?: string;
  status?: string;
  trial?: Trial | null;
}

async function request<TResponse>(input: RequestInfo, init?: RequestInit): Promise<TResponse> {
  const token = getToken();

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init?.headers) {
    const initHeaders = new Headers(init.headers as HeadersInit);
    initHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
    }
    const message = await response.text();
    throw new Error(message || "Error al comunicarse con el servidor");
  }

  if (token) {
    updateLastActivityTimestamp();
  }

  if (response.status === 204) { // No Content
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

export async function createPatientIntake(payload: CreatePatientIntakePayload) {
  return request(`${API_BASE_URL}/patient-intakes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPatientIntakes(): Promise<PatientIntake[]> {
  return request<PatientIntake[]>(`${API_BASE_URL}/patient-intakes`);
}

export async function getSponsors(): Promise<Sponsor[]> {
	return request<Sponsor[]>(`${API_BASE_URL}/sponsors`);
}

export interface Sponsor {
  id: string;
  name: string;
}

export interface Trial {
  id: string;
  title: string;
  public_description: string;
  status: 'RECRUITING' | 'ACTIVE' | 'CLOSED';
  clinic_city: string;
  sponsor: Sponsor;
  created_at: string;
  updated_at: string;
  inclusion_criteria?: Record<string, unknown> | null;
}

export interface CreateTrialPayload {
  title: string;
  public_description: string;
  inclusion_criteria: object;
  clinic_city: string;
  sponsor_id: string;
}

export interface Paginated<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export async function getTrials(options: {
  page?: number;
  limit?: number;
  status?: string;
} = {}): Promise<Paginated<Trial>> {
  const { page, limit, status } = options;
  const params = new URLSearchParams();
  if (typeof page === "number") params.append("page", page.toString());
  if (typeof limit === "number") params.append("limit", limit.toString());
  if (status) params.append("status", status);

  const paramString = params.toString();
  const url = paramString ? `${API_BASE_URL}/trials?${paramString}` : `${API_BASE_URL}/trials`;
  return request<Paginated<Trial>>(url);
}

export async function createTrial(payload: CreateTrialPayload) {
  return request<Trial>(`${API_BASE_URL}/trials`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type UpdateTrialPayload = Partial<CreateTrialPayload>;

export async function updateTrial(trialId: string, payload: UpdateTrialPayload) {
  return request<Trial>(`${API_BASE_URL}/trials/${trialId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTrial(trialId: string): Promise<void> {
  await request<void>(`${API_BASE_URL}/trials/${trialId}`, {
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
  return request<User[]>(`${API_BASE_URL}/users`);
}

export async function createUser(payload: CreateUserPayload) {
  return request<User>(`${API_BASE_URL}/users`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUser(userId: string, payload: UpdateUserPayload) {
  return request<User>(`${API_BASE_URL}/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(userId: string): Promise<void> {
  await request<void>(`${API_BASE_URL}/users/${userId}`, {
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
  return request<LoginResponse>(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
