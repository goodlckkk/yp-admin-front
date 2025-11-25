/**
 * Página completa para editar un ensayo clínico
 * 
 * Esta página muestra:
 * - Formulario de edición completo (no modal)
 * - Información del ensayo actual
 * - Navegación de regreso a la lista
 * - Vista previa de cambios
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import type { Trial, CreateTrialPayload, Sponsor } from '../../lib/api';
import { getTrial, updateTrial, getSponsors, getToken } from '../../lib/api';

interface InclusionCriteria {
  edad_minima?: number;
  edad_maxima?: number;
  genero?: string;
  condiciones_requeridas?: string[];
  condiciones_excluidas?: string[];
  medicamentos_prohibidos?: string[];
  otros_criterios?: string;
}

const INITIAL_CRITERIA: InclusionCriteria = {
  edad_minima: undefined,
  edad_maxima: undefined,
  genero: '',
  condiciones_requeridas: [],
  condiciones_excluidas: [],
  medicamentos_prohibidos: [],
  otros_criterios: '',
};

export function TrialEditPage() {
  const [trial, setTrial] = useState<Trial | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form data
  const [title, setTitle] = useState('');
  const [publicDescription, setPublicDescription] = useState('');
  const [clinicCity, setClinicCity] = useState('');
  const [sponsorId, setSponsorId] = useState('');
  const [status, setStatus] = useState<'RECRUITING' | 'ACTIVE' | 'CLOSED'>('RECRUITING');
  const [criteria, setCriteria] = useState<InclusionCriteria>(INITIAL_CRITERIA);

  // Campos temporales para arrays
  const [newCondicionRequerida, setNewCondicionRequerida] = useState('');
  const [newCondicionExcluida, setNewCondicionExcluida] = useState('');
  const [newMedicamentoProhibido, setNewMedicamentoProhibido] = useState('');

  // Obtener ID del ensayo desde la URL
  const trialId = typeof window !== 'undefined' 
    ? window.location.pathname.split('/')[2] 
    : null;

  useEffect(() => {
    // Verificar autenticación
    const token = getToken();
    if (!token) {
      window.location.href = '/auth';
      return;
    }

    if (trialId) {
      loadData();
    }
  }, [trialId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [trialData, sponsorsData] = await Promise.all([
        getTrial(trialId!),
        getSponsors(),
      ]);

      setTrial(trialData);
      setSponsors(sponsorsData);

      // Cargar datos del formulario
      setTitle(trialData.title);
      setPublicDescription(trialData.public_description);
      setClinicCity(trialData.clinic_city);
      setSponsorId(trialData.sponsor?.id || '');
      setStatus(trialData.status as 'RECRUITING' | 'ACTIVE' | 'CLOSED');
      setCriteria((trialData.inclusion_criteria as InclusionCriteria) || INITIAL_CRITERIA);
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError('No se pudo cargar el ensayo. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCriteriaChange = (field: keyof InclusionCriteria, value: any) => {
    setCriteria(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addToArray = (
    field: 'condiciones_requeridas' | 'condiciones_excluidas' | 'medicamentos_prohibidos',
    value: string
  ) => {
    if (!value.trim()) return;

    const currentArray = criteria[field] || [];
    if (!currentArray.includes(value.trim())) {
      handleCriteriaChange(field, [...currentArray, value.trim()]);
    }

    // Limpiar el input correspondiente
    if (field === 'condiciones_requeridas') setNewCondicionRequerida('');
    if (field === 'condiciones_excluidas') setNewCondicionExcluida('');
    if (field === 'medicamentos_prohibidos') setNewMedicamentoProhibido('');
  };

  const removeFromArray = (
    field: 'condiciones_requeridas' | 'condiciones_excluidas' | 'medicamentos_prohibidos',
    index: number
  ) => {
    const currentArray = criteria[field] || [];
    handleCriteriaChange(field, currentArray.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('El título es obligatorio');
      return false;
    }
    if (!publicDescription.trim()) {
      setError('La descripción es obligatoria');
      return false;
    }
    if (!clinicCity.trim()) {
      setError('La ciudad de la clínica es obligatoria');
      return false;
    }
    if (!sponsorId) {
      setError('Debes seleccionar un sponsor');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload: CreateTrialPayload = {
        title: title.trim(),
        public_description: publicDescription.trim(),
        clinic_city: clinicCity.trim(),
        sponsor_id: sponsorId,
        status,
        inclusion_criteria: criteria,
      };

      await updateTrial(trialId!, payload);
      setSuccess(true);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = '/trials';
      }, 2000);
    } catch (err: any) {
      console.error('Error guardando ensayo:', err);
      setError(err.message || 'Error al guardar el ensayo. Por favor, intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.')) {
      window.location.href = '/trials';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
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

  if (error && !trial) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
          <div className="mt-4">
            <Button onClick={() => window.location.href = '/trials'}>
              Volver a la lista
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/trials'}
            className="mb-4"
          >
            ← Volver a la lista
          </Button>
          <h1 className="text-3xl font-bold">Editar Ensayo Clínico</h1>
          <p className="text-gray-600 mt-2">
            Modifica la información del ensayo "{trial?.title}"
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
            ✓ Ensayo actualizado exitosamente. Redirigiendo...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Datos principales del ensayo clínico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título del Ensayo *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Estudio de eficacia de nuevo tratamiento para diabetes tipo 2"
                  className="mt-1"
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="public_description">Descripción Pública *</Label>
                <Textarea
                  id="public_description"
                  value={publicDescription}
                  onChange={(e) => setPublicDescription(e.target.value)}
                  placeholder="Descripción detallada del ensayo que será visible para los pacientes..."
                  rows={6}
                  className="mt-1"
                  disabled={saving}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Esta descripción será visible para los pacientes interesados
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Estado del Ensayo</Label>
                  <Select
                    value={status}
                    onValueChange={(value: any) => setStatus(value)}
                    disabled={saving}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RECRUITING">Reclutando</SelectItem>
                      <SelectItem value="ACTIVE">Activo</SelectItem>
                      <SelectItem value="CLOSED">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Estado Actual</Label>
                  <div className="mt-1 pt-2">
                    <Badge
                      variant={
                        status === 'RECRUITING'
                          ? 'secondary'
                          : status === 'ACTIVE'
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {status === 'RECRUITING'
                        ? 'Reclutando'
                        : status === 'ACTIVE'
                        ? 'Activo'
                        : 'Cerrado'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ubicación y Sponsor */}
          <Card>
            <CardHeader>
              <CardTitle>Ubicación y Patrocinador</CardTitle>
              <CardDescription>
                Información sobre la ubicación y el sponsor del ensayo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="clinic_city">Ciudad de la Clínica *</Label>
                <Input
                  id="clinic_city"
                  value={clinicCity}
                  onChange={(e) => setClinicCity(e.target.value)}
                  placeholder="Ej: Santiago, Valparaíso, Concepción"
                  className="mt-1"
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="sponsor_id">Sponsor / Patrocinador *</Label>
                <Select
                  value={sponsorId}
                  onValueChange={(value) => setSponsorId(value)}
                  disabled={saving}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona un sponsor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sponsors.map((sponsor) => (
                      <SelectItem key={sponsor.id} value={sponsor.id}>
                        {sponsor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Criterios de Inclusión */}
          <Card>
            <CardHeader>
              <CardTitle>Criterios de Inclusión</CardTitle>
              <CardDescription>
                Define los requisitos para que un paciente pueda participar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rango de Edad */}
              <div>
                <Label className="text-base font-semibold">Rango de Edad</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="edad_minima" className="text-sm">
                      Edad Mínima
                    </Label>
                    <Input
                      id="edad_minima"
                      type="number"
                      value={criteria.edad_minima || ''}
                      onChange={(e) =>
                        handleCriteriaChange(
                          'edad_minima',
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      placeholder="18"
                      min="0"
                      max="120"
                      className="mt-1"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edad_maxima" className="text-sm">
                      Edad Máxima
                    </Label>
                    <Input
                      id="edad_maxima"
                      type="number"
                      value={criteria.edad_maxima || ''}
                      onChange={(e) =>
                        handleCriteriaChange(
                          'edad_maxima',
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      placeholder="65"
                      min="0"
                      max="120"
                      className="mt-1"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>

              {/* Género */}
              <div>
                <Label htmlFor="genero">Género</Label>
                <Select
                  value={criteria.genero || ''}
                  onValueChange={(value) => handleCriteriaChange('genero', value)}
                  disabled={saving}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Todos los géneros" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Condiciones Requeridas */}
              <div>
                <Label className="text-base font-semibold">Condiciones Requeridas</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Condiciones médicas que el paciente DEBE tener
                </p>
                <div className="flex gap-2">
                  <Input
                    value={newCondicionRequerida}
                    onChange={(e) => setNewCondicionRequerida(e.target.value)}
                    placeholder="Ej: Diabetes tipo 2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('condiciones_requeridas', newCondicionRequerida);
                      }
                    }}
                    disabled={saving}
                  />
                  <Button
                    type="button"
                    onClick={() => addToArray('condiciones_requeridas', newCondicionRequerida)}
                    disabled={saving || !newCondicionRequerida.trim()}
                  >
                    Añadir
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {criteria.condiciones_requeridas?.map((condicion, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {condicion}
                      <button
                        type="button"
                        onClick={() => removeFromArray('condiciones_requeridas', index)}
                        className="ml-1 hover:text-red-600"
                        disabled={saving}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Condiciones Excluidas */}
              <div>
                <Label className="text-base font-semibold">Condiciones Excluidas</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Condiciones que EXCLUYEN al paciente del ensayo
                </p>
                <div className="flex gap-2">
                  <Input
                    value={newCondicionExcluida}
                    onChange={(e) => setNewCondicionExcluida(e.target.value)}
                    placeholder="Ej: Insuficiencia renal"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('condiciones_excluidas', newCondicionExcluida);
                      }
                    }}
                    disabled={saving}
                  />
                  <Button
                    type="button"
                    onClick={() => addToArray('condiciones_excluidas', newCondicionExcluida)}
                    disabled={saving || !newCondicionExcluida.trim()}
                  >
                    Añadir
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {criteria.condiciones_excluidas?.map((condicion, index) => (
                    <Badge key={index} variant="destructive" className="flex items-center gap-1">
                      {condicion}
                      <button
                        type="button"
                        onClick={() => removeFromArray('condiciones_excluidas', index)}
                        className="ml-1 hover:text-white"
                        disabled={saving}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Medicamentos Prohibidos */}
              <div>
                <Label className="text-base font-semibold">Medicamentos Prohibidos</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Medicamentos que el paciente NO puede estar tomando
                </p>
                <div className="flex gap-2">
                  <Input
                    value={newMedicamentoProhibido}
                    onChange={(e) => setNewMedicamentoProhibido(e.target.value)}
                    placeholder="Ej: Metformina"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('medicamentos_prohibidos', newMedicamentoProhibido);
                      }
                    }}
                    disabled={saving}
                  />
                  <Button
                    type="button"
                    onClick={() => addToArray('medicamentos_prohibidos', newMedicamentoProhibido)}
                    disabled={saving || !newMedicamentoProhibido.trim()}
                  >
                    Añadir
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {criteria.medicamentos_prohibidos?.map((medicamento, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {medicamento}
                      <button
                        type="button"
                        onClick={() => removeFromArray('medicamentos_prohibidos', index)}
                        className="ml-1 hover:text-red-600"
                        disabled={saving}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Otros Criterios */}
              <div>
                <Label htmlFor="otros_criterios">Otros Criterios</Label>
                <Textarea
                  id="otros_criterios"
                  value={criteria.otros_criterios || ''}
                  onChange={(e) => handleCriteriaChange('otros_criterios', e.target.value)}
                  placeholder="Cualquier otro criterio de inclusión o exclusión relevante..."
                  rows={4}
                  className="mt-1"
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
