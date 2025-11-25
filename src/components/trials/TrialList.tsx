import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import type { Trial, TrialStatus, TrialsFilterParams } from '../../lib/api';
import { getTrials, deleteTrial, getToken } from '../../lib/api';
import { TrialFilters } from './TrialFilters';
import { TrialForm } from './TrialForm';
import { AppProviders } from '../AppProviders';
import { useToast } from '../../contexts/ToastContext';
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
  <span className={cn("inline-block", className)}>🔄</span>
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

function TrialListContent() {
  const { showToast } = useToast();
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<TrialsFilterParams>({
    page: 1,
    limit: 10,
    sortBy: 'start_date',
    sortOrder: 'DESC',
  });
  
  // Estados para el formulario de ensayos
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);

  // Verificar autenticación al montar
  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = '/auth';
    }
  }, []);

  const totalPages = Math.ceil(totalItems / (filters.limit || 10));
  const currentPage = filters.page || 1;

  // Lista de ciudades simulada (debería venir de la API en el futuro)
  const cities = useMemo(() => [
    'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco',
  ], []);

  const fetchTrials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTrials(filters);
      setTrials(data.data);
      setTotalItems(data.totalItems);
      setFilters(prev => ({ ...prev, page: data.currentPage }));
    } catch (err) {
      console.error('Error al cargar los ensayos:', err);
      const errorMsg = 'No se pudieron cargar los ensayos. Por favor, intente nuevamente.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTrials();
  }, [fetchTrials]);

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
    setSelectedTrial(null);
    setIsFormOpen(true);
  };

  const handleEdit = (trialId: string) => {
    window.location.href = `/trials/${trialId}/edit`;
  };

  const handleDelete = async (trialId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este ensayo? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await deleteTrial(trialId);
      showToast('Ensayo eliminado exitosamente', 'success');
      fetchTrials(); // Recargar la lista
    } catch (err) {
      console.error('Error al eliminar ensayo:', err);
      showToast('No se pudo eliminar el ensayo. Por favor, intenta nuevamente.', 'error');
    }
  };

  const handleFormSuccess = () => {
    const message = selectedTrial ? 'Ensayo actualizado exitosamente' : 'Ensayo creado exitosamente';
    showToast(message, 'success');
    fetchTrials(); // Recargar la lista después de crear/editar
    setSelectedTrial(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedTrial(null);
  };

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
        <Button variant="outline" className="mt-2" onClick={fetchTrials}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ensayos Clínicos</h2>
          <p className="text-muted-foreground">
            Gestiona y revisa los ensayos clínicos activos
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Ensayo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista de Ensayos</CardTitle>
              <CardDescription>
                {totalItems} {totalItems === 1 ? 'ensayo encontrado' : 'ensayos encontrados'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchTrials} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TrialFilters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            onReset={resetFilters}
            cities={cities}
          />
          
          <div className="rounded-md border mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('title')}>
                    Título {getSortIcon('title')}
                  </TableHead>
                  <TableHead>Patrocinador</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('status')}>
                    Estado {getSortIcon('status')}
                  </TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('start_date')}>
                    Fecha Inicio {getSortIcon('start_date')}
                  </TableHead>
                  <TableHead>Participantes</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell><LoadingSkeleton className="w-full" /></TableCell>
                      <TableCell><LoadingSkeleton className="w-3/4" /></TableCell>
                      <TableCell><LoadingSkeleton className="w-20" /></TableCell>
                      <TableCell><LoadingSkeleton className="w-24" /></TableCell>
                      <TableCell><LoadingSkeleton className="w-28" /></TableCell>
                      <TableCell><LoadingSkeleton className="w-16" /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end"><LoadingSkeleton className="w-16 h-8" /></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : trials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron ensayos que coincidan con los filtros.
                    </TableCell>
                  </TableRow>
                ) : (
                  trials.map((trial) => (
                    <TableRow key={trial.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <button
                          onClick={() => window.location.href = `/trials/${trial.id}`}
                          className="text-left hover:text-blue-600 hover:underline transition-colors"
                        >
                          {trial.title}
                        </button>
                      </TableCell>
                      <TableCell>{trial.sponsor?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[trial.status]}>
                          {statusLabels[trial.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                          {trial.clinic_city}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatDate(trial.start_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                          {trial.current_participants || 0} / {trial.target_participants || '∞'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => window.location.href = `/trials/${trial.id}`}
                          >
                            Ver
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(trial.id)}>
                            Editar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(trial.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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

      {/* Formulario de creación/edición */}
      <TrialForm
        trial={selectedTrial}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}

export function TrialList() {
  return (
    <AppProviders>
      <TrialListContent />
    </AppProviders>
  );
}
