import axiosInstance from './axios-instance';
import { TokenService } from '../services/token.service';

/**
 * Re-exportar funciones del TokenService para mantener compatibilidad
 * con código existente. Estas funciones ahora delegan al TokenService.
 */
export function saveToken(token: string, expiresAt: string): void {
  TokenService.saveToken(token, expiresAt);
}

export function getToken(): string | null {
  return TokenService.getToken();
}

export function getTokenExpiration(): number | null {
  return TokenService.getExpiration();
}

export function updateLastActivityTimestamp(): void {
  TokenService.updateActivity();
}

export function getLastActivityTimestamp(): number | null {
  return TokenService.getLastActivity();
}

export function removeToken(): void {
  TokenService.removeToken();
}

/**
 * Decodificar el JWT y obtener el email del usuario
 */
export function getUserEmailFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Decodificar el JWT (formato: header.payload.signature)
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.email || decoded.sub || null;
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
}

/**
 * Decodificar el JWT y obtener el rol del usuario
 */
export function getUserRoleFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Decodificar el JWT (formato: header.payload.signature)
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.role || null;
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
}

/**
 * Decodificar el JWT y obtener el institutionId del usuario
 */
export function getUserInstitutionIdFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.institutionId || null;
  } catch {
    return null;
  }
}

/**
 * Decodificar el JWT y obtener el nombre de la institución del usuario
 */
export function getUserInstitutionNameFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.institutionName || null;
  } catch {
    return null;
  }
}

export type PatientIntakeSource = 'WEB_FORM' | 'MANUAL_ENTRY' | 'REFERRAL' | 'OTHER';

export interface CreatePatientIntakePayload {
  nombres?: string;
  apellidos?: string;
  rut?: string;
  fechaNacimiento?: string;
  sexo?: string;
  
  // Teléfono: puede ser completo (legacy) o separado (nuevo)
  telefono?: string; // Legacy: "+56 9 1234 5678"
  telefonoCodigoPais?: string; // Nuevo: "+56"
  telefonoNumero?: string; // Nuevo: "912345678"
  
  email?: string;
  region?: string;
  comuna?: string;
  direccion?: string;
  condicionPrincipal?: string;
  condicionPrincipalCodigo?: string; // Código CIE-10 de la condición principal
  patologias?: string[]; // Checkboxes de patologías prevalentes
  otrasEnfermedades?: string;
  codigos_cie10?: string[];
  // Campos opcionales que se llenan después por admin
  medicamentosActuales?: string;
  alergias?: string;
  cirugiasPrevias?: string;
  descripcionCondicion?: string; // ← Mantener por compatibilidad
  // Campos estructurados (nuevos)
  medicamentosEstructurados?: string[]; // Solo nombres de medicamentos
  alergiasEstructuradas?: Array<{ codigo: string; nombre: string }>; // CIE-10
  otrasEnfermedadesEstructuradas?: Array<{ codigo: string; nombre: string }>; // CIE-10
  aceptaTerminos?: boolean;
  aceptaPrivacidad?: boolean;
  aceptaAlmacenamiento15Anos?: boolean;
  trialId?: string;
  referralResearchSiteId?: string; // ID del sitio/institución que derivó al paciente
  source?: PatientIntakeSource; // Origen: WEB (formulario público) o MANUAL (dashboard)
}

export interface PatientIntake extends CreatePatientIntakePayload {
  id: string;
  createdAt?: string;
  trial?: Trial | null;
  referralResearchSite?: ResearchSite | null;
  consentDocumentUrl?: string | null;
  status?: 'RECEIVED' | 'VERIFIED' | 'STUDY_ASSIGNED' | 'AWAITING_STUDY' | 'PENDING_CONTACT' | 'DISCARDED';
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
        window.location.href = '/auth';
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
  // Enviar token si existe (para que el backend identifique la institución que crea el paciente)
  // pero no requerir autenticación (el formulario web público también usa este endpoint)
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return request(`/patient-intakes`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers,
  });
}

export async function updatePatientIntake(id: string, payload: Partial<CreatePatientIntakePayload>): Promise<PatientIntake> {
  return fetchWithAuth<PatientIntake>(`/patient-intakes/${id}`, {
    method: "PATCH",
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

export async function searchSponsors(query: string): Promise<Sponsor[]> {
	return fetchWithAuth<Sponsor[]>(`/sponsors/search?q=${encodeURIComponent(query)}`);
}

export async function createSponsor(data: { name: string; description?: string; web_site?: string; sponsor_type?: SponsorType }): Promise<Sponsor> {
	return fetchWithAuth<Sponsor>(`/sponsors`, {
		method: 'POST',
		body: JSON.stringify(data),
	});
}

export async function getSponsor(id: string): Promise<Sponsor> {
	return fetchWithAuth<Sponsor>(`/sponsors/${id}`);
}

export async function updateSponsor(id: string, data: Partial<{ name: string; description?: string; web_site?: string; sponsor_type?: SponsorType }>): Promise<Sponsor> {
	return fetchWithAuth<Sponsor>(`/sponsors/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(data),
	});
}

export interface TrialSuggestion {
	trial: Trial;
	matchScore: number;
	matchReasons: string[];
}

export async function getTrialSuggestions(patientId: string): Promise<TrialSuggestion[]> {
	return fetchWithAuth<TrialSuggestion[]>(`/trials/suggestions/${patientId}`);
}

export type SponsorType = 'SPONSOR' | 'CRO';

export interface Sponsor {
  id: string;
  name: string;
  description?: string;
  web_site?: string;
  sponsor_type: SponsorType;
  created_at: string;
  updated_at: string;
}

export type TrialStatus = 'PENDING_APPROVAL' | 'PREPARATION' | 'RECRUITING' | 'FOLLOW_UP' | 'CLOSED';

export interface Trial {
  id: string;
  title: string;
  public_description: string;
  inclusion_criteria: object;
  status: TrialStatus;
  researchSite?: ResearchSite; // Sitio de investigación completo (camelCase como lo devuelve el backend)
  sponsor?: Sponsor; // Sponsor completo
  phase?: string; // Fase del estudio (I, II, III, IV)
  max_participants?: number;
  current_participants?: number;
  recruitment_deadline?: string; // Fecha límite de reclutamiento (ISO 8601)
  phaseChangeRequested?: boolean;
  phaseChangeRequestedAt?: string;
  phaseChangeRequestedBy?: string;
  created_at: string;
  updated_at: string;
  start_date?: string;
  end_date?: string;
  target_participants?: number;
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
  research_site_id: string; // ID del sitio de investigación (obligatorio)
  sponsor_id?: string; // Sponsor es opcional
  status?: TrialStatus;
  max_participants?: number; // Límite de participantes
  current_participants?: number; // Participantes actuales
  recruitment_deadline?: string; // Fecha límite de reclutamiento (ISO 8601)
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

// Solicitud de estudio clínico (para instituciones)
export interface TrialRequestPayload {
  title: string;
  description: string;
  additionalNotes?: string;
}

export async function requestTrial(payload: TrialRequestPayload) {
  return fetchWithAuth<{ success: boolean; message: string }>(`/trials/request`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Solicitud completa de estudio clínico (formulario completo, crea trial con status PENDING_APPROVAL)
export async function requestTrialFull(payload: CreateTrialPayload) {
  return fetchWithAuth<{ success: boolean; message: string; trial: Trial }>(`/trials/request-full`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Solicitar cambio de fase de un estudio (INSTITUTION)
export async function requestPhaseChange(trialId: string) {
  return fetchWithAuth<{ success: boolean; message: string; trial: Trial }>(`/trials/${trialId}/request-phase-change`, {
    method: "POST",
  });
}

// Users
export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  INSTITUTION = 'INSTITUTION',
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  birth_date?: string;
  institutionId?: string;
  institution?: ResearchSite;
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

export async function getUserByInstitution(institutionId: string): Promise<User | null> {
  try {
    return await fetchWithAuth<User>(`/users/by-institution/${institutionId}`);
  } catch {
    return null;
  }
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

// ==================== RESEARCH SITES (SITIOS DE INVESTIGACIÓN / INSTITUCIONES) ====================

export interface ResearchSite {
  id: string;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  comuna?: string;
  region?: string;
  telefono?: string;
  email?: string;
  sitio_web?: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateResearchSitePayload {
  nombre: string;
  direccion?: string;
  ciudad?: string;
  comuna?: string;
  region?: string;
  telefono?: string;
  email?: string;
  sitio_web?: string;
  descripcion?: string;
}

export async function getResearchSites() {
  return fetchWithAuth<ResearchSite[]>(`/research-sites`);
}

export async function searchResearchSites(query: string) {
  return fetchWithAuth<ResearchSite[]>(`/research-sites/search?q=${encodeURIComponent(query)}`);
}

export async function getResearchSite(id: string) {
  return fetchWithAuth<ResearchSite>(`/research-sites/${id}`);
}

export async function createResearchSite(payload: CreateResearchSitePayload) {
  return fetchWithAuth<ResearchSite>(`/research-sites`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateResearchSite(id: string, payload: Partial<CreateResearchSitePayload>) {
  return fetchWithAuth<ResearchSite>(`/research-sites/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteResearchSite(id: string) {
  return fetchWithAuth<{ message: string }>(`/research-sites/${id}`, {
    method: 'DELETE',
  });
}


// Sponsors ya están definidos arriba en el archivo

export interface PublicStats {
  patientsConnected: number;
  activeTrials: number;
  medicalCenters: number;
}

export async function getPublicStats(): Promise<PublicStats> {
  return request<PublicStats>(`/stats/public`);
}

// ==================== FORMULARIO DE INSTITUCIONES ====================

export interface InstitutionContactPayload {
  nombreInstitucion: string;
  nombreContacto: string;
  email: string;
  telefono: string;
  mensaje: string;
}

export async function sendInstitutionContact(payload: InstitutionContactPayload): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>(`/emails/institution-contact`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ==================== COMUNAS DINÁMICAS ====================

export interface Comuna {
  id: string;
  nombre: string;
  region_id: string;
  region_nombre: string;
}

export async function getAllComunas(): Promise<Comuna[]> {
  return fetchWithAuth<Comuna[]>('/comunas');
}

// ==================== UPLOADS (Documentos de Consentimiento) ====================

/**
 * Sube un documento de consentimiento firmado para un paciente.
 * El archivo se almacena en S3 y la URL se guarda en el registro del paciente.
 *
 * @param patientId - UUID del paciente
 * @param file - Archivo (PDF, JPG, PNG o WebP, máx 10MB)
 * @returns Objeto con la URL del documento y el patientId
 */
export async function uploadConsentDocument(
  patientId: string,
  file: File,
): Promise<{ message: string; consentDocumentUrl: string; patientId: string }> {
  const token = getToken();
  if (!token) throw new Error('No autenticado');

  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.request({
    url: `/uploads/consent/${patientId}`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // No establecer Content-Type — axios lo pone automáticamente con el boundary de FormData
    },
    data: formData,
  });

  return response.data;
}

/**
 * Obtiene una URL presignada temporal para ver/descargar el documento de consentimiento.
 * La URL expira en 1 hora.
 *
 * @param patientId - UUID del paciente
 * @returns Objeto con presignedUrl
 */
export async function getConsentDocumentUrl(
  patientId: string,
): Promise<{ presignedUrl: string; patientId: string }> {
  return fetchWithAuth<{ presignedUrl: string; patientId: string }>(
    `/uploads/consent/${patientId}/url`,
  );
}
