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
import { Icons } from '../ui/icons';
import type { Trial, CreateTrialPayload, Sponsor } from '../../lib/api';
import { getTrial, updateTrial, getSponsors, fetchWithAuth } from '../../lib/api';
import { useRequireAuth } from '../../hooks/useRequireAuth';

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

interface PatientIntake {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  age: number;
  condition: string;
  created_at: string;
}

export function TrialEditPage() {
  const [trial, setTrial] = useState<Trial | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [patients, setPatients] = useState<PatientIntake[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
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

  // Obtener ID del ensayo desde el query string
  const trialId = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('id')
    : null;

  // Verificar autenticación
  useRequireAuth();

  useEffect(() => {

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

      // Cargar pacientes asociados
      loadPatients();
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError('No se pudo cargar el ensayo. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const patientsData = await fetchWithAuth<PatientIntake[]>(`/patient-intakes/trial/${trialId}`);
      setPatients(patientsData);
    } catch (err: any) {
      console.error('Error cargando pacientes:', err);
      // No mostrar error crítico, los pacientes son opcionales
    } finally {
      setLoadingPatients(false);
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

  const handleSubmit = async () => {
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
        max_participants: trial?.max_participants || 30,
        current_participants: trial?.current_participants || 0,
        inclusion_criteria: criteria,
      };

      await updateTrial(trialId!, payload);
      setSuccess(true);
      setIsEditing(false);

      // Recargar datos
      await loadData();
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
    <div className="min-h-screen bg-gradient-to-br from-[#F2F2F2] to-white">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/dashboard'}
              className="mb-4 text-[#024959] hover:text-[#04BFAD] hover:bg-[#04BFAD]/10"
            >
              <Icons.ChevronDown className="w-5 h-5 mr-2 rotate-90" />
              Volver al Dashboard
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-[#024959] mb-2">
                  {isEditing ? 'Editando Ensayo Clínico' : 'Detalles del Ensayo'}
                </h1>
                <p className="text-[#4D4D59] text-lg">
                  {trial?.title}
                </p>
              </div>
              <div className="flex gap-3">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-[#04BFAD] to-[#024959] hover:opacity-90 text-white"
                  >
                    <Icons.FileText className="w-4 h-4 mr-2" />
                    Editar Ensayo
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        loadData();
                      }}
                      className="border-[#04BFAD] text-[#024959] hover:bg-[#04BFAD]/10"
                    >
                      <Icons.X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="bg-gradient-to-r from-[#04BFAD] to-[#024959] hover:opacity-90 text-white"
                    >
                      <Icons.CheckCircle className="w-4 h-4 mr-2" />
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
            ✓ Ensayo actualizado exitosamente. Redirigiendo...
          </div>
        )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-start gap-3">
              <Icons.AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
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

          </div>
        </div>
      </div>
    </div>
  );
}
