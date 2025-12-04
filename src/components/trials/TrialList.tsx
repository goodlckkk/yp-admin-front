import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import type { Trial, TrialStatus, TrialsFilterParams } from '../../lib/api';
import { getTrials, deleteTrial } from '../../lib/api';
import { TrialFilters } from './TrialFilters';
import { TrialForm } from './TrialForm';
import { AddInstitutionModal } from './AddInstitutionModal';
import { AddSponsorModal } from './AddSponsorModal';
import { AppProviders } from '../AppProviders';
import { useToast } from '../../contexts/ToastContext';
import { useRequireAuth } from '../../hooks/useRequireAuth';
// Función de utilidad para combinar clases
export const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// --- Componentes y funciones autocontenidas ---

// Componente de carga simple
const LoadingSkeleton = ({ className = '' }: { className?: string }) => (
  <div 
    className={`bg-gray-200 rounded animate-pulse ${className}`}
    style={{ height: '1rem' }} 
  />
);

// Iconos personalizados con soporte para className
const Plus = ({ className = '' }: { className?: string }) => (
  <span className={cn("inline-block", className)}>+</span>
);

const RefreshCw = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className={className}>
    <path d="M196-331q-20-36-28-72.5t-8-74.5q0-131 94.5-225.5T480-798h43l-80-80 39-39 149 149-149 149-40-40 79-79h-41q-107 0-183.5 76.5T220-478q0 29 5.5 55t13.5 49l-43 43ZM476-40 327-189l149-149 39 39-80 80h45q107 0 183.5-76.5T740-479q0-29-5-55t-15-49l43-43q20 36 28.5 72.5T800-479q0 131-94.5 225.5T480-159h-45l80 80-39 39Z"/>
  </svg>
);

const CalendarIcon = ({ className = '' }: { className?: string }) => (
  <span className={cn("inline-block", className)}>📅</span>
);

const MapPin = ({ className = '' }: { className?: string }) => (
  <span className={cn("inline-block", className)}>📍</span>
);

const Users = ({ className = '' }: { className?: string }) => (
  <span className={cn("inline-block", className)}>👥</span>
);

// Función de formateo de fecha nativa y robusta
const formatDate = (dateString?: string | Date | null): string => {
  if (!dateString) return 'No definida';
  try {
    const date = new Date(dateString);
    // Corregir problema de zona horaria sumando el offset
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);

    if (isNaN(correctedDate.getTime())) return 'Fecha inválida';
    
    return correctedDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    console.error('Error al formatear fecha:', e);
    return 'Fecha inválida';
  }
};

// Función de navegación simple
const navigate = (path: string) => {
  if (typeof window !== 'undefined') {
    window.location.href = path;
  }
};

// --- Mapeos de estado ---

const statusVariant: Record<TrialStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'outline',
  RECRUITING: 'secondary',
  ACTIVE: 'default',
  CLOSED: 'destructive',
};

const statusLabels: Record<TrialStatus, string> = {
  DRAFT: 'Borrador',
  RECRUITING: 'Reclutando',
  ACTIVE: 'Activo',
  CLOSED: 'Cerrado',
};

// --- Componente principal ---

interface TrialListContentProps {
  initialTrials?: Trial[];
  onTrialChange?: () => void;
}

function TrialListContent({ initialTrials = [], onTrialChange }: TrialListContentProps) {
  const { showToast } = useToast();
  const [trials, setTrials] = useState<Trial[]>(initialTrials);
  const [initialLoading, setInitialLoading] = useState(initialTrials.length === 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(initialTrials.length);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(initialTrials.length > 0);
  const [filters, setFilters] = useState<TrialsFilterParams>({
    page: 1,
    limit: 10,
    sortBy: 'start_date',
    sortOrder: 'DESC',
  });
  
  // Estados para el formulario de estudios clínicos
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrial, setEditingTrial] = useState<Trial | null>(null);
  const [isInstitutionModalOpen, setIsInstitutionModalOpen] = useState(false);
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);

  // Verificar autenticación al montar
  useRequireAuth();

  const totalPages = Math.ceil(totalItems / (filters.limit || 10));
  const currentPage = filters.page || 1;

  // Lista de ciudades simulada (debería venir de la API en el futuro)
  const cities = useMemo(() => [
    'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco',
  ], []);

  const fetchTrials = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setInitialLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await getTrials(filters);
      setTrials(data.data);
      setTotalItems(data.totalItems);
      // Notificar al dashboard que los datos cambiaron
      if (onTrialChange) {
        onTrialChange();
      }
      // No actualizar filters aquí para evitar loop infinito
    } catch (err: any) {
      console.error('Error al cargar los estudios clínicos:', err);
      
      let errorMsg = 'No se pudieron cargar los estudios clínicos. Por favor, intente nuevamente.';
      
      // Manejo específico para error 429 (Too Many Requests)
      if (err?.message?.includes('429') || err?.message?.includes('Too Many Requests')) {
        errorMsg = 'Demasiadas solicitudes. Por favor, espera un momento antes de intentar nuevamente.';
      }
      
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      if (isInitial) {
        setInitialLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [filters, showToast]);

  // Carga inicial solo si no hay datos precargados
  useEffect(() => {
    if (initialTrials.length === 0 && !hasLoadedOnce) {
      fetchTrials(true);
      setHasLoadedOnce(true);
    } else if (initialTrials.length > 0) {
      // Si hay datos precargados, marcar como cargado
      setInitialLoading(false);
    }
  }, []); // Solo en el montaje inicial

  // Cargas subsecuentes cuando cambian los filtros (solo si ya se cargó una vez)
  useEffect(() => {
    // Solo hacer fetch si:
    // 1. Ya se cargó una vez
    // 2. No es la carga inicial
    // 3. NO hay datos precargados del dashboard (initialTrials vacío significa que TrialList maneja sus propios datos)
    if (hasLoadedOnce && !initialLoading && initialTrials.length === 0) {
      fetchTrials(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder, filters.status, filters.city, filters.search, filters.startDateFrom, filters.startDateTo]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleFilterChange = (newFilters: Partial<TrialsFilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'start_date',
      sortOrder: 'DESC',
    });
  };

  const handleSort = (column: 'status' | 'title' | 'start_date' | 'end_date') => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  const getSortIcon = (column: 'status' | 'title' | 'start_date' | 'end_date') => {
    if (filters.sortBy !== column) return null;
    return filters.sortOrder === 'ASC' ? '↑' : '↓';
  };

  const handleCreateNew = () => {
    setEditingTrial(null);
    setIsFormOpen(true);
  };

  const handleEdit = (trialId: string) => {
    // Abrir modal de edición en lugar de redirigir
    const trial = trials.find(t => t.id === trialId);
    if (trial) {
      setEditingTrial(trial);
      setIsFormOpen(true);
    }
  };

  const handleDelete = async (trialId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este estudio clínico? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await deleteTrial(trialId);
      showToast('Estudio clínico eliminado exitosamente', 'success');
      fetchTrials(); // Recargar la lista
    } catch (err) {
      console.error('Error al eliminar estudio clínico:', err);
      showToast('No se pudo eliminar el estudio clínico. Por favor, intenta nuevamente.', 'error');
    }
  };

  const handleFormSuccess = () => {
    const message = editingTrial ? 'Estudio clínico actualizado exitosamente' : 'Estudio clínico creado exitosamente';
    showToast(message, 'success');
    fetchTrials(false); // Recargar la lista después de crear/editar
    setEditingTrial(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTrial(null);
  };

  // Loading inicial fullscreen
  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div 
              className="absolute inset-0 border-4 border-transparent rounded-full animate-spin"
              style={{ 
                borderTopColor: '#04BFAD',
                borderRightColor: '#04BFAD'
              }}
            ></div>
          </div>
          <h3 className="text-lg font-semibold text-[#024959] mb-2">Cargando estudios clínicos</h3>
          <p className="text-sm text-gray-500">Por favor espera un momento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
        <Button 
          variant="outline" 
          className="mt-2" 
          onClick={() => fetchTrials(false)}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  // Si el formulario está abierto, solo mostrar el formulario
  if (isFormOpen) {
    return (
      <div className="animate-in fade-in-50 duration-300">
        <TrialForm
          trial={editingTrial}
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista de Estudios Clínicos</CardTitle>
              <CardDescription>
                {totalItems} {totalItems === 1 ? 'estudio clínico encontrado' : 'estudios clínicos encontrados'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateNew}
                className="bg-[#04BFAD] hover:bg-[#024959] text-white transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Estudio Clínico
              </Button>
              <Button 
                onClick={() => setIsInstitutionModalOpen(true)}
                variant="outline"
                className="border-[#04BFAD] text-[#024959] hover:bg-[#A7F2EB]/20"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Institución
              </Button>
              <Button 
                onClick={() => setIsSponsorModalOpen(true)}
                variant="outline"
                className="border-[#04BFAD] text-[#024959] hover:bg-[#A7F2EB]/20"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Sponsor
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => fetchTrials(false)} 
                disabled={loading}
                className="text-[#04BFAD] hover:text-[#024959] hover:bg-[#A7F2EB]/20"
                title="Actualizar lista"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TrialFilters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            onReset={resetFilters}
            cities={cities}
          />
          
          {/* Grid de Cards en lugar de tabla */}
          <div className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={`skeleton-${i}`} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <LoadingSkeleton className="w-full h-6" />
                      <LoadingSkeleton className="w-3/4 h-4 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <LoadingSkeleton className="w-full h-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : trials.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">No se encontraron estudios clínicos que coincidan con los filtros.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trials.map((trial) => (
                  <Card 
                    key={trial.id} 
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 shadow-md border border-gray-200"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2 text-[#024959]">
                            {trial.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {trial.sponsor?.name || 'Sin patrocinador'}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={statusVariant[trial.status]}
                          className="ml-2"
                        >
                          {statusLabels[trial.status]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {trial.public_description || 'Sin descripción'}
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="mr-2 h-4 w-4 text-[#04BFAD]" />
                          <span>{trial.clinic_city}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <CalendarIcon className="mr-2 h-4 w-4 text-[#04BFAD]" />
                          <span>{formatDate(trial.start_date)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="mr-2 h-4 w-4 text-[#04BFAD]" />
                          <span className="font-medium">
                            {trial.current_participants || 0} / {trial.max_participants || '∞'} participantes
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t">
                        <Button 
                          variant="outline"
                          size="sm" 
                          onClick={() => handleEdit(trial.id)}
                          className="flex-1 border-[#04BFAD] text-[#024959] hover:bg-[#04BFAD] hover:text-white transition-all"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(trial.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                Anterior
              </Button>
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      <AddInstitutionModal
        isOpen={isInstitutionModalOpen}
        onClose={() => setIsInstitutionModalOpen(false)}
        onSuccess={() => {
          setIsInstitutionModalOpen(false);
          showToast('Institución agregada exitosamente', 'success');
        }}
      />

      <AddSponsorModal
        isOpen={isSponsorModalOpen}
        onClose={() => setIsSponsorModalOpen(false)}
        onSuccess={() => {
          setIsSponsorModalOpen(false);
          showToast('Patrocinador agregado exitosamente', 'success');
        }}
      />

    </div>
  );
}

export function TrialList({ initialTrials, onTrialChange }: { initialTrials?: Trial[]; onTrialChange?: () => void }) {
  return (
    <AppProviders>
      <TrialListContent initialTrials={initialTrials} onTrialChange={onTrialChange} />
    </AppProviders>
  );
}
