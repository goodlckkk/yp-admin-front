/**
 * Componente de Sugerencias Inteligentes de Ensayos Clínicos
 * 
 * Muestra ensayos compatibles basados en las patologías y condiciones del paciente.
 * 
 * Características:
 * - Score de compatibilidad (0-100)
 * - Razones de coincidencia
 * - Asignación rápida con un click
 * - Indicador visual de match quality
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { getTrialSuggestions, updatePatientIntake } from '../../lib/api';
import type { TrialSuggestion } from '../../lib/api';

interface TrialSuggestionsProps {
  patientId: string;
  currentTrialId?: string | null;
  onAssign: () => void;
}

export function TrialSuggestions({ patientId, currentTrialId, onAssign }: TrialSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<TrialSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSuggestions();
  }, [patientId]);

  const loadSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrialSuggestions(patientId);
      setSuggestions(data);
    } catch (err: any) {
      console.error('Error al cargar sugerencias:', err);
      setError('No se pudieron cargar las sugerencias');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (trialId: string) => {
    setAssigning(trialId);
    try {
      await updatePatientIntake(patientId, { trialId });
      onAssign(); // Callback para refrescar datos del paciente
    } catch (err: any) {
      console.error('Error al asignar ensayo:', err);
      alert('Error al asignar el ensayo. Por favor, intenta nuevamente.');
    } finally {
      setAssigning(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 text-green-700 border-green-300';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-orange-100 text-orange-700 border-orange-300';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'Alta compatibilidad';
    if (score >= 40) return 'Media compatibilidad';
    return 'Baja compatibilidad';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sugerencias de Estudios Clínicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[#04BFAD] border-t-transparent rounded-full" />
            <span className="ml-3 text-gray-600">Analizando compatibilidad...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sugerencias de Estudios Clínicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadSuggestions} variant="outline" className="mt-4">
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
          <CardTitle className="text-lg">Sugerencias de Estudios Clínicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">
              No se encontraron estudios clínicos compatibles en reclutamiento activo.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Las sugerencias se basan en las patologías y condiciones del paciente.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Sugerencias de Estudios Clínicos</span>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {suggestions.length} {suggestions.length === 1 ? 'sugerencia' : 'sugerencias'}
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Estudios compatibles basados en las condiciones médicas del paciente
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.trial.id}
              className={`border rounded-lg p-4 transition-all ${
                currentTrialId === suggestion.trial.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-[#04BFAD] hover:shadow-md'
              }`}
            >
              {/* Header con título y score */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {suggestion.trial.title}
                  </h4>
                  {currentTrialId === suggestion.trial.id && (
                    <Badge className="bg-green-100 text-green-700 border-green-300">
                      ✓ Asignado actualmente
                    </Badge>
                  )}
                </div>
                <div className="ml-4 text-right">
                  <div className={`px-3 py-1 rounded-full border text-sm font-semibold ${getScoreColor(suggestion.matchScore)}`}>
                    {suggestion.matchScore}% match
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {getScoreLabel(suggestion.matchScore)}
                  </p>
                </div>
              </div>

              {/* Razones de coincidencia */}
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Razones de compatibilidad:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.matchReasons.map((reason, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                      ✓ {reason}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {suggestion.trial.public_description}
              </p>

              {/* Información adicional */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span>📍 {suggestion.trial.research_site_name || 'Sitio no especificado'}</span>
                <span>👥 Máx. {suggestion.trial.max_participants} participantes</span>
                {suggestion.trial.sponsor && (
                  <span>🏢 {suggestion.trial.sponsor.name}</span>
                )}
              </div>

              {/* Botón de asignación */}
              {currentTrialId !== suggestion.trial.id && (
                <Button
                  onClick={() => handleAssign(suggestion.trial.id)}
                  disabled={assigning === suggestion.trial.id}
                  className="w-full bg-[#04BFAD] hover:bg-[#024959] text-white"
                  size="sm"
                >
                  {assigning === suggestion.trial.id ? 'Asignando...' : 'Asignar a este estudio'}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
