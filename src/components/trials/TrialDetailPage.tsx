/**
 * Página de Detalles de Ensayo Clínico
 * 
 * Vista completa de solo lectura de un ensayo con:
 * - Información básica
 * - Criterios de inclusión
 * - Estadísticas
 * - Acciones (Editar, Eliminar, Volver)
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import type { Trial } from '../../lib/api';
import { getTrial, deleteTrial } from '../../lib/api';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { TrialPatients } from './TrialPatients';
import { 
  Calendar,
  MapPin,
  Users,
  Building2,
  FileText,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  ArrowLeft,
  User,
  Pill,
  Heart
} from 'lucide-react';

interface InclusionCriteria {
  edad_minima?: number;
  edad_maxima?: number;
  genero?: string;
  condiciones_requeridas?: string[];
  condiciones_excluidas?: string[];
  medicamentos_prohibidos?: string[];
  otros_criterios?: string;
}

const statusConfig = {
  RECRUITING: {
    label: 'Reclutando',
    variant: 'secondary' as const,
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  ACTIVE: {
    label: 'Activo',
    variant: 'default' as const,
    icon: Activity,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  CLOSED: {
    label: 'Cerrado',
    variant: 'destructive' as const,
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
};

export function TrialDetailPage() {
  const [trial, setTrial] = useState<Trial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Obtener ID del ensayo desde la URL
  const trialId = typeof window !== 'undefined' 
    ? window.location.pathname.split('/')[2] 
    : null;

  // Verificar autenticación
  useRequireAuth();

  useEffect(() => {

    if (trialId) {
      loadTrial();
    }
  }, [trialId]);

  const loadTrial = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTrial(trialId!);
      setTrial(data);
    } catch (err: any) {
      console.error('Error cargando ensayo:', err);
      setError('No se pudo cargar el ensayo. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    window.location.href = `/trials/${trialId}/edit`;
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este ensayo? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteTrial(trialId!);
      window.location.href = '/trials';
    } catch (err: any) {
      console.error('Error eliminando ensayo:', err);
      alert('No se pudo eliminar el ensayo. Por favor, intenta nuevamente.');
      setDeleting(false);
    }
  };

  const handleBack = () => {
    window.location.href = '/trials';
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const criteria = trial?.inclusion_criteria as InclusionCriteria | undefined;
  const statusInfo = trial ? statusConfig[trial.status as keyof typeof statusConfig] : null;
  const StatusIcon = statusInfo?.icon || AlertCircle;

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando ensayo...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !trial) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-4">
            {error || 'Ensayo no encontrado'}
          </div>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header con acciones */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la lista
            </Button>
            
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${statusInfo?.bgColor}`}>
                <StatusIcon className={`h-8 w-8 ${statusInfo?.color}`} />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{trial.title}</h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Badge variant={statusInfo?.variant}>
                    {statusInfo?.label}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Creado: {formatDate(trial.created_at)}
                  </span>
                  {trial.updated_at && trial.updated_at !== trial.created_at && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Actualizado: {formatDate(trial.updated_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleEdit}
              disabled={deleting}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>

        {/* Grid de 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descripción */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Descripción del Ensayo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {trial.public_description}
                </p>
              </CardContent>
            </Card>

            {/* Criterios de Inclusión */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Criterios de Inclusión
                </CardTitle>
                <CardDescription>
                  Requisitos para participar en el ensayo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Edad */}
                {(criteria?.edad_minima || criteria?.edad_maxima) && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      Rango de Edad
                    </h4>
                    <div className="flex items-center gap-2 text-gray-700">
                      {criteria.edad_minima && (
                        <span>Mínimo: {criteria.edad_minima} años</span>
                      )}
                      {criteria.edad_minima && criteria.edad_maxima && (
                        <span>•</span>
                      )}
                      {criteria.edad_maxima && (
                        <span>Máximo: {criteria.edad_maxima} años</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Género */}
                {criteria?.genero && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      Género
                    </h4>
                    <Badge variant="outline">{criteria.genero}</Badge>
                  </div>
                )}

                {/* Condiciones Requeridas */}
                {criteria?.condiciones_requeridas && criteria.condiciones_requeridas.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-green-600" />
                      Condiciones Requeridas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {criteria.condiciones_requeridas.map((condicion, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          {condicion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Condiciones Excluidas */}
                {criteria?.condiciones_excluidas && criteria.condiciones_excluidas.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Condiciones Excluidas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {criteria.condiciones_excluidas.map((condicion, index) => (
                        <Badge key={index} variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                          <XCircle className="mr-1 h-3 w-3" />
                          {condicion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medicamentos Prohibidos */}
                {criteria?.medicamentos_prohibidos && criteria.medicamentos_prohibidos.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Pill className="h-4 w-4 text-orange-600" />
                      Medicamentos Prohibidos
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {criteria.medicamentos_prohibidos.map((medicamento, index) => (
                        <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          <XCircle className="mr-1 h-3 w-3" />
                          {medicamento}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Otros Criterios */}
                {criteria?.otros_criterios && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-gray-600" />
                      Otros Criterios
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {criteria.otros_criterios}
                    </p>
                  </div>
                )}

                {/* Sin criterios */}
                {!criteria?.edad_minima && 
                 !criteria?.edad_maxima && 
                 !criteria?.genero && 
                 (!criteria?.condiciones_requeridas || criteria.condiciones_requeridas.length === 0) &&
                 (!criteria?.condiciones_excluidas || criteria.condiciones_excluidas.length === 0) &&
                 (!criteria?.medicamentos_prohibidos || criteria.medicamentos_prohibidos.length === 0) &&
                 !criteria?.otros_criterios && (
                  <p className="text-gray-500 italic">
                    No se han definido criterios de inclusión específicos.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ubicación */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">Ubicación</span>
                  </div>
                  <p className="text-gray-900 ml-6">{trial.researchSite?.ciudad || 'Ubicación no especificada'}</p>
                </div>

                {/* Sponsor */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">Sponsor</span>
                  </div>
                  <p className="text-gray-900 ml-6">
                    {trial.sponsor?.name || 'No especificado'}
                  </p>
                </div>

                {/* Fechas */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Fecha de Inicio</span>
                  </div>
                  <p className="text-gray-900 ml-6">{formatDate(trial.start_date)}</p>
                </div>

                {trial.end_date && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Fecha de Fin</span>
                    </div>
                    <p className="text-gray-900 ml-6">{formatDate(trial.end_date)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Participantes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Participantes</span>
                    <span className="font-semibold">
                      {trial.current_participants || 0} / {trial.target_participants || '∞'}
                    </span>
                  </div>
                  {trial.target_participants && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            ((trial.current_participants || 0) / trial.target_participants) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Progreso */}
                {trial.target_participants && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progreso</span>
                      <span className="font-semibold text-blue-600">
                        {Math.round(
                          ((trial.current_participants || 0) / trial.target_participants) * 100
                        )}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Estado del reclutamiento */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estado</span>
                    <Badge variant={statusInfo?.variant} className="text-xs">
                      {statusInfo?.label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acciones Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleEdit}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Ensayo
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Ensayo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sección de Pacientes Postulados */}
        <TrialPatients trialId={trial.id} />
      </div>
    </div>
  );
}
