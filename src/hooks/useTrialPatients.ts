/**
 * useTrialPatients - Hook personalizado para gestionar pacientes de un ensayo
 * 
 * Responsabilidad única: Manejar la carga de pacientes asociados a un ensayo específico
 * 
 * Uso:
 * ```tsx
 * const { patients, loading, error, refetch } = useTrialPatients(trialId);
 * ```
 * 
 * @module useTrialPatients
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth, type PatientIntake } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

/**
 * Resultado del hook useTrialPatients
 */
interface UseTrialPatientsResult {
  /** Lista de pacientes del ensayo */
  patients: PatientIntake[];
  /** Estado de carga */
  loading: boolean;
  /** Mensaje de error si ocurre */
  error: string | null;
  /** Función para recargar datos */
  refetch: () => Promise<void>;
}

/**
 * Hook para gestionar pacientes de un ensayo clínico específico
 * 
 * @param {string | null} trialId - ID del ensayo clínico
 * @returns {UseTrialPatientsResult} Estado y funciones para manejar pacientes
 * 
 * @example
 * // Uso básico
 * const { patients, loading, error } = useTrialPatients('123');
 * 
 * @example
 * // Con recarga manual
 * const { patients, loading, refetch } = useTrialPatients(trialId);
 * 
 * // Recargar después de una acción
 * const handleApprove = async () => {
 *   await approvePatient(patientId);
 *   await refetch(); // Recargar lista
 * };
 */
export function useTrialPatients(trialId: string | null): UseTrialPatientsResult {
  const [patients, setPatients] = useState<PatientIntake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  /**
   * Función para cargar pacientes desde la API
   * Memoizada con useCallback para evitar re-renders innecesarios
   */
  const fetchPatients = useCallback(async () => {
    if (!trialId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Usar fetchWithAuth para obtener pacientes del ensayo
      const response = await fetchWithAuth(`/trials/${trialId}/patients`) as Response;
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPatients(data.data || data);
    } catch (err: any) {
      console.error('Error al cargar pacientes del ensayo:', err);
      
      const errorMsg = 'No se pudieron cargar los pacientes del ensayo';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [trialId, showToast]);

  /**
   * Efecto para cargar pacientes cuando cambia el trialId
   */
  useEffect(() => {
    if (trialId) {
      fetchPatients();
    }
  }, [trialId, fetchPatients]);

  return {
    patients,
    loading,
    error,
    refetch: fetchPatients
  };
}
