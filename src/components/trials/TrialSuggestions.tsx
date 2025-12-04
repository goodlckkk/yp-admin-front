/**
 * Componente de Sugerencias de Estudios Clínicos
 * 
 * Muestra estudios clínicos recomendados para un paciente basándose en:
 * - Condición médica principal
 * - Patologías seleccionadas
 * - Códigos CIE-10
 * - Criterios de inclusión del estudio
 * 
 * Características:
 * - Score de compatibilidad (0-100)
 * - Razones de coincidencia
 * - Enlace directo al estudio
 * - Actualización en tiempo real
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Icons } from '../ui/icons';
import { getTrialSuggestions, type TrialSuggestion } from '../../lib/api';

interface TrialSuggestionsProps {
  patientId: string;
  onViewTrial?: (trialId: string) => void;
}

export function TrialSuggestions({ patientId, onViewTrial }: TrialSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<TrialSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSuggestions();
  }, [patientId]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTrialSuggestions(patientId);
      setSuggestions(data);
    } catch (err: any) {
      console.error('Error cargando sugerencias:', err);
      setError(err.message || 'Error al cargar sugerencias de estudios');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 60) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Alta compatibilidad';
    if (score >= 60) return 'Buena compatibilidad';
    if (score >= 40) return 'Compatibilidad moderada';
    return 'Baja compatibilidad';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#024959]">
            <Icons.Lightbulb className="w-5 h-5 text-[#04BFAD]" />
            Estudios Clínicos Sugeridos
          </CardTitle>
          <CardDescription>
            Analizando compatibilidad con estudios disponibles...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Icons.Loader2 className="w-8 h-8 animate-spin text-[#04BFAD]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#024959]">
            <Icons.Lightbulb className="w-5 h-5 text-[#04BFAD]" />
            Estudios Clínicos Sugeridos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
            <Button
              onClick={loadSuggestions}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              <Icons.RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#024959]">
            <Icons.Lightbulb className="w-5 h-5 text-[#04BFAD]" />
            Estudios Clínicos Sugeridos
          </CardTitle>
          <CardDescription>
            No se encontraron estudios compatibles en este momento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <Icons.Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-2">
              No hay estudios clínicos activos que coincidan con el perfil del paciente.
            </p>
            <p className="text-xs text-gray-500">
              Los estudios se actualizan constantemente. Vuelve a revisar más tarde.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#024959]">
          <Icons.Lightbulb className="w-5 h-5 text-[#04BFAD]" />
          Estudios Clínicos Sugeridos
        </CardTitle>
        <CardDescription>
          {suggestions.length} {suggestions.length === 1 ? 'estudio encontrado' : 'estudios encontrados'} según el perfil del paciente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.trial.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-[#04BFAD] transition-colors"
          >
            {/* Header con título y score */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-[#024959] mb-1">
                  {suggestion.trial.title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {suggestion.trial.public_description}
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className={`px-3 py-1.5 rounded-full border-2 ${getScoreColor(suggestion.matchScore)}`}>
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {suggestion.matchScore}%
                    </div>
                    <div className="text-xs font-medium whitespace-nowrap">
                      {getScoreLabel(suggestion.matchScore)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Razones de coincidencia */}
            {suggestion.matchReasons.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Razones de compatibilidad:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.matchReasons.map((reason, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs bg-[#04BFAD]/10 text-[#024959] border-[#04BFAD]/30"
                    >
                      <Icons.Check className="w-3 h-3 mr-1" />
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
              {suggestion.trial.phase && (
                <div className="flex items-center gap-1">
                  <Icons.FileText className="w-3 h-3" />
                  <span>Fase {suggestion.trial.phase}</span>
                </div>
              )}
              {suggestion.trial.sponsor_name && (
                <div className="flex items-center gap-1">
                  <Icons.Building className="w-3 h-3" />
                  <span>{suggestion.trial.sponsor_name}</span>
                </div>
              )}
              {suggestion.trial.status && (
                <Badge variant="outline" className="text-xs">
                  {suggestion.trial.status === 'RECRUITING' ? 'Reclutando' :
                   suggestion.trial.status === 'PREPARATION' ? 'En preparación' :
                   suggestion.trial.status === 'FOLLOW_UP' ? 'En seguimiento' : 'Cerrado'}
                </Badge>
              )}
            </div>

            {/* Botón de acción */}
            <Button
              onClick={() => onViewTrial?.(suggestion.trial.id)}
              variant="outline"
              size="sm"
              className="w-full border-[#04BFAD] text-[#024959] hover:bg-[#04BFAD] hover:text-white"
            >
              <Icons.Eye className="w-4 h-4 mr-2" />
              Ver detalles del estudio
            </Button>
          </div>
        ))}

        {/* Botón de actualizar */}
        <div className="pt-2 border-t border-gray-200">
          <Button
            onClick={loadSuggestions}
            variant="ghost"
            size="sm"
            className="w-full text-gray-600 hover:text-[#024959]"
          >
            <Icons.RefreshCw className="w-4 h-4 mr-2" />
            Actualizar sugerencias
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
