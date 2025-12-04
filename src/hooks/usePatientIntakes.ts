/**
 * usePatientIntakes - Hook personalizado para gestionar postulaciones de pacientes
 * 
 * Responsabilidad única: Manejar la carga, filtrado y paginación de postulaciones
 * 
 * Uso:
 * ```tsx
 * const { intakes, loading, error, totalItems, filters, setFilters, refetch } = usePatientIntakes({
 *   page: 1,
 *   limit: 10
 * });
 * ```
 * 
 * @module usePatientIntakes
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth, type PatientIntake } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

/**
 * Filtros para postulaciones de pacientes
 */
export interface PatientIntakeFilter {
  page?: number;
  limit?: number;
  trialId?: string;
  status?: string;
  search?: string;
}

/**
 * Resultado del hook usePatientIntakes
 */
interface UsePatientIntakesResult {
  /** Lista de postulaciones */
  intakes: PatientIntake[];
  /** Estado de carga */
  loading: boolean;
  /** Mensaje de error si ocurre */
  error: string | null;
  /** Total de postulaciones (para paginación) */
  totalItems: number;
  /** Filtros actuales */
  filters: PatientIntakeFilter;
  /** Función para actualizar filtros */
  setFilters: React.Dispatch<React.SetStateAction<PatientIntakeFilter>>;
  /** Función para recargar datos */
  refetch: () => Promise<void>;
}

/**
 * Hook para gestionar postulaciones de pacientes con filtrado y paginación
 * 
 * @param {PatientIntakeFilter} initialFilters - Filtros iniciales
 * @returns {UsePatientIntakesResult} Estado y funciones para manejar postulaciones
 * 
 * @example
 * // Uso básico
 * const { intakes, loading } = usePatientIntakes();
 * 
 * @example
 * // Con filtros personalizados
 * const { intakes, loading, setFilters } = usePatientIntakes({
 *   trialId: '123',
 *   status: 'pending',
 *   limit: 20
 * });
 */
export function usePatientIntakes(initialFilters: PatientIntakeFilter = {}): UsePatientIntakesResult {
  const [intakes, setIntakes] = useState<PatientIntake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<PatientIntakeFilter>({
    page: 1,
    limit: 10,
    ...initialFilters
  });
  const { showToast } = useToast();

  /**
   * Función para cargar postulaciones desde la API
   * Memoizada con useCallback para evitar re-renders innecesarios
   */
  const fetchIntakes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir query string con filtros
      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.trialId) queryParams.append('trialId', filters.trialId);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      
      const response = await fetchWithAuth(`/patient-intakes?${queryParams.toString()}`) as Response;
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setIntakes(data.data || data);
      setTotalItems(data.totalItems || data.total || 0);
    } catch (err: any) {
      console.error('Error al cargar postulaciones:', err);
      
      const errorMsg = 'No se pudieron cargar las postulaciones';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  /**
   * Efecto para cargar postulaciones cuando cambian los filtros
   */
  useEffect(() => {
    fetchIntakes();
  }, [fetchIntakes]);

  return {
    intakes,
    loading,
    error,
    totalItems,
    filters,
    setFilters,
    refetch: fetchIntakes
  };
}
