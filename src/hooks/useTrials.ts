/**
 * useTrials - Hook personalizado para gestionar ensayos clínicos
 * 
 * Responsabilidad única: Manejar la carga, filtrado y paginación de ensayos
 * 
 * Uso:
 * ```tsx
 * const { trials, loading, error, totalItems, filters, setFilters, refetch } = useTrials({
 *   page: 1,
 *   limit: 10,
 *   sortBy: 'start_date',
 *   sortOrder: 'DESC'
 * });
 * ```
 * 
 * @module useTrials
 */

import { useState, useEffect, useCallback } from 'react';
import { getTrials, type TrialsFilterParams, type Trial } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

/**
 * Resultado del hook useTrials
 */
interface UseTrialsResult {
  /** Lista de ensayos clínicos */
  trials: Trial[];
  /** Estado de carga */
  loading: boolean;
  /** Mensaje de error si ocurre */
  error: string | null;
  /** Total de ensayos (para paginación) */
  totalItems: number;
  /** Filtros actuales */
  filters: TrialsFilterParams;
  /** Función para actualizar filtros */
  setFilters: React.Dispatch<React.SetStateAction<TrialsFilterParams>>;
  /** Función para recargar datos */
  refetch: () => Promise<void>;
}

/**
 * Hook para gestionar ensayos clínicos con filtrado y paginación
 * 
 * @param {TrialsFilterParams} initialFilters - Filtros iniciales
 * @returns {UseTrialsResult} Estado y funciones para manejar ensayos
 * 
 * @example
 * // Uso básico
 * const { trials, loading } = useTrials();
 * 
 * @example
 * // Con filtros personalizados
 * const { trials, loading, setFilters } = useTrials({
 *   status: 'active',
 *   city: 'Santiago',
 *   limit: 20
 * });
 */
export function useTrials(initialFilters: TrialsFilterParams = {}): UseTrialsResult {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<TrialsFilterParams>({
    page: 1,
    limit: 10,
    sortBy: 'start_date',
    sortOrder: 'DESC',
    ...initialFilters
  });
  
  const { showToast } = useToast();

  /**
   * Función para cargar ensayos desde la API
   * Memoizada con useCallback para evitar re-renders innecesarios
   */
  const fetchTrials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getTrials(filters);
      setTrials(data.data);
      setTotalItems(data.totalItems);
    } catch (err: any) {
      console.error('Error al cargar ensayos:', err);
      
      let errorMsg = 'No se pudieron cargar los ensayos. Por favor, intente nuevamente.';
      
      // Manejo específico para error 429 (Too Many Requests)
      if (err?.message?.includes('429') || err?.message?.includes('Too Many Requests')) {
        errorMsg = 'Demasiadas solicitudes. Por favor, espera un momento antes de intentar nuevamente.';
      }
      
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  /**
   * Efecto para cargar ensayos cuando cambian los filtros
   */
  useEffect(() => {
    fetchTrials();
  }, [fetchTrials]);

  return {
    trials,
    loading,
    error,
    totalItems,
    filters,
    setFilters,
    refetch: fetchTrials
  };
}
