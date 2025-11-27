/**
 * Formulario para crear y editar ensayos clínicos
 * 
 * Este componente maneja:
 * - Creación de nuevos ensayos
 * - Edición de ensayos existentes
 * - Validación de campos
 * - Gestión de criterios de inclusión
 * - Selección de sponsor
 * - Estados del ensayo
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import type { Trial, CreateTrialPayload, Sponsor, PatientIntake } from '../../lib/api';
import { createTrial, updateTrial, getSponsors, fetchWithAuth } from '../../lib/api';

interface TrialFormProps {
  trial?: Trial | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  public_description: string;
  clinic_city: string;
  sponsor_id: string;
  status: 'RECRUITING' | 'ACTIVE' | 'CLOSED';
  max_participants: number;
  current_participants: number;
  inclusion_criteria: InclusionCriteria;
}

interface InclusionCriteria {
  edad_minima?: number;
  edad_maxima?: number;
  genero?: string;
  condiciones_requeridas?: string[];
  condiciones_excluidas?: string[];
  medicamentos_prohibidos?: string[];
  otros_criterios?: string;
}

const INITIAL_FORM_DATA: FormData = {
  title: '',
  public_description: '',
  clinic_city: '',
  sponsor_id: '',
  status: 'RECRUITING',
  max_participants: 30,
  current_participants: 0,
  inclusion_criteria: {
    edad_minima: undefined,
    edad_maxima: undefined,
    genero: '',
    condiciones_requeridas: [],
    condiciones_excluidas: [],
    medicamentos_prohibidos: [],
    otros_criterios: '',
  },
};

export function TrialForm({ trial, isOpen, onClose, onSuccess }: TrialFormProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [patients, setPatients] = useState<PatientIntake[]>([]);
  const [availablePatients, setAvailablePatients] = useState<PatientIntake[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSponsors, setLoadingSponsors] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingAvailablePatients, setLoadingAvailablePatients] = useState(false);
  const [showAddPatientsModal, setShowAddPatientsModal] = useState(false);
  const [selectedPatientIds, setSelectedPatientIds] = useState<Set<string>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [patientToConfirm, setPatientToConfirm] = useState<PatientIntake | null>(null);
  const [patientsWithConflict, setPatientsWithConflict] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Campos temporales para arrays
  const [newCondicionRequerida, setNewCondicionRequerida] = useState('');
  const [newCondicionExcluida, setNewCondicionExcluida] = useState('');
  const [newMedicamentoProhibido, setNewMedicamentoProhibido] = useState('');

  // Cargar pacientes si estamos editando
  const loadPatients = async () => {
    if (!trial?.id) return;
    
    setLoadingPatients(true);
    try {
      const response = await fetchWithAuth(`/patient-intakes/trial/${trial.id}`);
      setPatients(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Cargar TODOS los pacientes disponibles (incluyendo los que están en otros ensayos)
  const loadAvailablePatients = async () => {
    if (!trial?.id) return;
    
    setLoadingAvailablePatients(true);
    try {
      // Obtener TODOS los pacientes
      const response = await fetchWithAuth('/patient-intakes');
      const allPatients = Array.isArray(response) ? response : [];
      
      // Filtrar solo los que NO estén ya en ESTE ensayo
      const currentPatientIds = new Set(patients.map(p => p.id));
      const available = allPatients.filter(p => !currentPatientIds.has(p.id));
      
      setAvailablePatients(available);
    } catch (err: any) {
      console.error('Error al cargar pacientes disponibles:', err);
      setError(`Error al cargar pacientes: ${err.message || 'Verifica que el endpoint /patient-intakes exista en tu API'}`);
      setAvailablePatients([]);
    } finally {
      setLoadingAvailablePatients(false);
    }
  };

  // Agregar pacientes seleccionados localmente (sin guardar en backend aún)
  const handleAddPatients = () => {
    if (selectedPatientIds.size === 0) return;
    
    // Obtener los pacientes seleccionados de la lista de disponibles
    const selectedPatients = availablePatients.filter(p => 
      selectedPatientIds.has(p.id)
    );
    
    // Identificar pacientes que ya están en otro ensayo
    const patientsInOtherTrials = selectedPatients.filter(p => p.trialId && p.trialId !== trial?.id);
    
    if (patientsInOtherTrials.length > 0) {
      // Guardar los IDs de pacientes con conflicto
      setPatientsWithConflict(new Set(patientsInOtherTrials.map(p => p.id)));
      // Mostrar modal de confirmación para el primer paciente con conflicto
      setPatientToConfirm(patientsInOtherTrials[0]);
      setShowConfirmModal(true);
    } else {
      // Si no hay conflictos, agregar directamente
      addPatientsToList(selectedPatients);
    }
  };
  
  // Función auxiliar para agregar pacientes a la lista
  const addPatientsToList = (patientsToAdd: PatientIntake[]) => {
    setPatients(prev => [...prev, ...patientsToAdd]);
    setShowAddPatientsModal(false);
    setSelectedPatientIds(new Set());
    setPatientsWithConflict(new Set());
  };
  
  // Confirmar agregar paciente que está en otro ensayo
  const handleConfirmAddPatient = () => {
    if (!patientToConfirm) return;
    
    // Obtener todos los pacientes seleccionados
    const selectedPatients = availablePatients.filter(p => selectedPatientIds.has(p.id));
    
    // Agregar todos los pacientes seleccionados (incluyendo los que tienen conflicto)
    addPatientsToList(selectedPatients);
    setShowConfirmModal(false);
    setPatientToConfirm(null);
  };
  
  // Cancelar agregar paciente con conflicto
  const handleCancelAddPatient = () => {
    if (!patientToConfirm) return;
    
    // Remover el paciente con conflicto de la selección
    setSelectedPatientIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(patientToConfirm.id);
      return newSet;
    });
    
    // Verificar si hay más pacientes con conflicto
    const remainingConflicts = availablePatients.filter(p => 
      selectedPatientIds.has(p.id) && 
      p.trialId && 
      p.trialId !== trial?.id &&
      p.id !== patientToConfirm.id
    );
    
    if (remainingConflicts.length > 0) {
      // Mostrar el siguiente paciente con conflicto
      setPatientToConfirm(remainingConflicts[0]);
    } else {
      // Si no hay más conflictos, agregar los pacientes restantes
      setShowConfirmModal(false);
      setPatientToConfirm(null);
      
      const selectedPatients = availablePatients.filter(p => selectedPatientIds.has(p.id));
      if (selectedPatients.length > 0) {
        addPatientsToList(selectedPatients);
      } else {
        setShowAddPatientsModal(false);
        setSelectedPatientIds(new Set());
      }
    }
  };
  
  // Quitar paciente de la tabla (solo de la lista local, no de BD)
  const handleRemovePatient = (patientId: string) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
  };

  // Toggle selección de paciente
  const togglePatientSelection = (patientId: string) => {
    setSelectedPatientIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(patientId)) {
        newSet.delete(patientId);
      } else {
        newSet.add(patientId);
      }
      return newSet;
    });
  };

  // Cargar sponsors al montar
  useEffect(() => {
    loadSponsors();
    if (trial?.id) {
      loadPatients();
    }
  }, []);

  // Cargar datos del ensayo si estamos editando
  useEffect(() => {
    if (trial && isOpen) {
      setFormData({
        title: trial.title,
        public_description: trial.public_description,
        clinic_city: trial.clinic_city,
        sponsor_id: trial.sponsor?.id || '',
        status: trial.status as 'RECRUITING' | 'ACTIVE' | 'CLOSED',
        max_participants: trial.max_participants || 30,
        current_participants: trial.current_participants || 0,
        inclusion_criteria: trial.inclusion_criteria as InclusionCriteria || INITIAL_FORM_DATA.inclusion_criteria,
      });
    } else if (!trial && isOpen) {
      setFormData(INITIAL_FORM_DATA);
      setCurrentStep(1);
    }
  }, [trial, isOpen]);

  const loadSponsors = async () => {
    try {
      setLoadingSponsors(true);
      const data = await getSponsors();
      setSponsors(data);
    } catch (err) {
      console.error('Error cargando sponsors:', err);
      // No mostrar error crítico, sponsors son opcionales
      setSponsors([]);
    } finally {
      setLoadingSponsors(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleCriteriaChange = (field: keyof InclusionCriteria, value: any) => {
    setFormData(prev => ({
      ...prev,
      inclusion_criteria: {
        ...prev.inclusion_criteria,
        [field]: value,
      },
    }));
  };

  const addToArray = (field: 'condiciones_requeridas' | 'condiciones_excluidas' | 'medicamentos_prohibidos', value: string) => {
    if (!value.trim()) return;
    
    const currentArray = formData.inclusion_criteria[field] || [];
    if (!currentArray.includes(value.trim())) {
      handleCriteriaChange(field, [...currentArray, value.trim()]);
    }
    
    // Limpiar el input correspondiente
    if (field === 'condiciones_requeridas') setNewCondicionRequerida('');
    if (field === 'condiciones_excluidas') setNewCondicionExcluida('');
    if (field === 'medicamentos_prohibidos') setNewMedicamentoProhibido('');
  };

  const removeFromArray = (field: 'condiciones_requeridas' | 'condiciones_excluidas' | 'medicamentos_prohibidos', index: number) => {
    const currentArray = formData.inclusion_criteria[field] || [];
    handleCriteriaChange(field, currentArray.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          setError('El título es obligatorio');
          return false;
        }
        if (!formData.public_description.trim()) {
          setError('La descripción es obligatoria');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.clinic_city.trim()) {
          setError('La ciudad de la clínica es obligatoria');
          return false;
        }
        // Sponsor es opcional
        // if (!formData.sponsor_id) {
        //   setError('Debes seleccionar un sponsor');
        //   return false;
        // }
        return true;
      
      case 3:
        // Los criterios de inclusión son opcionales
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      setError(null);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  // Función para crear/actualizar el ensayo (solo se ejecuta manualmente)
  const handleCreateTrial = async () => {
    // Validaciones básicas
    if (!formData.title.trim()) {
      setError('El título es obligatorio');
      return;
    }
    if (!formData.public_description.trim()) {
      setError('La descripción es obligatoria');
      return;
    }
    if (!formData.clinic_city.trim()) {
      setError('La ciudad es obligatoria');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: CreateTrialPayload = {
        title: formData.title,
        public_description: formData.public_description,
        clinic_city: formData.clinic_city,
        sponsor_id: formData.sponsor_id || undefined,
        status: formData.status,
        max_participants: formData.max_participants || undefined,
        current_participants: formData.current_participants || undefined,
        inclusion_criteria: formData.inclusion_criteria,
      };

      if (trial) {
        await updateTrial(trial.id, payload);
        
        // Cargar los pacientes originales del ensayo para comparar
        const originalPatientsResponse = await fetchWithAuth(`/patient-intakes/trial/${trial.id}`);
        const originalPatients = Array.isArray(originalPatientsResponse) ? originalPatientsResponse : [];
        
        // IDs de pacientes actuales y originales
        const currentPatientIds = new Set(patients.map(p => p.id));
        const originalPatientIds = new Set(originalPatients.map(p => p.id));
        
        // Pacientes NUEVOS agregados (están en current pero no en original)
        const newPatientIds = patients
          .filter(p => !originalPatientIds.has(p.id))
          .map(p => p.id);
        
        // Pacientes QUITADOS (están en original pero no en current)
        const removedPatientIds = originalPatients
          .filter(p => !currentPatientIds.has(p.id))
          .map(p => p.id);
        
        // Agregar nuevos pacientes al ensayo
        if (newPatientIds.length > 0) {
          console.log(`Agregando ${newPatientIds.length} pacientes al ensayo ${trial.id}:`, newPatientIds);
          const addPromises = newPatientIds.map(patientId =>
            fetchWithAuth(`/patient-intakes/${patientId}`, {
              method: 'PATCH',
              body: JSON.stringify({ trialId: trial.id })
            })
          );
          await Promise.all(addPromises);
          console.log('Pacientes agregados exitosamente');
        }
        
        // Quitar pacientes removidos del ensayo (poner trialId en null)
        if (removedPatientIds.length > 0) {
          const removePromises = removedPatientIds.map(patientId =>
            fetchWithAuth(`/patient-intakes/${patientId}`, {
              method: 'PATCH',
              body: JSON.stringify({ trialId: null })
            })
          );
          await Promise.all(removePromises);
        }
        
        onSuccess();
      } else {
        await createTrial(payload);
        onSuccess();
      }

      handleClose();
    } catch (err: any) {
      console.error('Error al guardar el ensayo:', err);
      setError(err.message || 'Ocurrió un error al guardar el ensayo');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(1);
    setError(null);
    setNewCondicionRequerida('');
    setNewCondicionExcluida('');
    setNewMedicamentoProhibido('');
    onClose();
  };

  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#024959]">
            {trial ? 'Editar Ensayo Clínico' : 'Crear Nuevo Ensayo Clínico'}
          </h2>
          <p className="text-gray-600 mt-1">
            {trial ? 'Modifica la información del ensayo y gestiona los pacientes asociados' : 'Completa la información para crear un nuevo ensayo clínico'}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={handleClose}
          className="text-gray-600 hover:text-gray-900"
        >
          ✕ Cerrar
        </Button>
      </div>

      {/* Formulario completo en una sola vista */}
      <div className="space-y-6">
        {/* Sección 1: Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-[#024959]">Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título del Ensayo *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ej: Estudio de eficacia de nuevo tratamiento para diabetes tipo 2"
                  className="mt-1"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="public_description">Descripción Pública *</Label>
                <Textarea
                  id="public_description"
                  value={formData.public_description}
                  onChange={(e) => handleInputChange('public_description', e.target.value)}
                  placeholder="Descripción detallada del ensayo que será visible para los pacientes..."
                  rows={6}
                  className="mt-1"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Esta descripción será visible para los pacientes interesados
                </p>
              </div>

              <div>
                <Label htmlFor="status">Estado del Ensayo</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => handleInputChange('status', value)}
                  disabled={loading}
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
            </div>
          </CardContent>
        </Card>

        {/* Sección 2: Ubicación y Patrocinador */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-[#024959]">Ubicación y Patrocinador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="clinic_city">Ciudad de la Clínica *</Label>
                <Input
                  id="clinic_city"
                  value={formData.clinic_city}
                  onChange={(e) => handleInputChange('clinic_city', e.target.value)}
                  placeholder="Ej: Santiago, Valparaíso, Concepción"
                  className="mt-1"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="sponsor_id">Sponsor / Patrocinador (Opcional)</Label>
                {loadingSponsors ? (
                  <div className="mt-1 p-2 border rounded">Cargando sponsors...</div>
                ) : (
                  <Select
                    value={formData.sponsor_id}
                    onValueChange={(value) => handleInputChange('sponsor_id', value)}
                    disabled={loading}
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
                )}
                {sponsors.length === 0 && !loadingSponsors && (
                  <p className="text-sm text-gray-500 mt-1">
                    No hay sponsors disponibles. Puedes crear el ensayo sin sponsor y asignarlo después.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_participants">Límite de Participantes *</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => handleInputChange('max_participants', parseInt(e.target.value) || 30)}
                    placeholder="30"
                    min="1"
                    className="mt-1"
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Número máximo de participantes para este ensayo
                  </p>
                </div>
                <div>
                  <Label htmlFor="current_participants">Participantes Actuales</Label>
                  <Input
                    id="current_participants"
                    type="number"
                    value={formData.current_participants}
                    onChange={(e) => handleInputChange('current_participants', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    className="mt-1"
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Participantes ya reclutados
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección 3: Criterios de Inclusión */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-[#024959]">Criterios de Inclusión (Opcional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rango de Edad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edad_minima">Edad Mínima</Label>
                      <Input
                        id="edad_minima"
                        type="number"
                        value={formData.inclusion_criteria.edad_minima || ''}
                        onChange={(e) => handleCriteriaChange('edad_minima', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="18"
                        min="0"
                        max="120"
                        className="mt-1"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edad_maxima">Edad Máxima</Label>
                      <Input
                        id="edad_maxima"
                        type="number"
                        value={formData.inclusion_criteria.edad_maxima || ''}
                        onChange={(e) => handleCriteriaChange('edad_maxima', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="65"
                        min="0"
                        max="120"
                        className="mt-1"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="genero">Género</Label>
                    <Select
                      value={formData.inclusion_criteria.genero || 'todos'}
                      onValueChange={(value) => handleCriteriaChange('genero', value === 'todos' ? '' : value)}
                      disabled={loading}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Todos los géneros" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Femenino">Femenino</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Condiciones Médicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Condiciones Requeridas */}
                  <div>
                    <Label>Condiciones Requeridas</Label>
                    <div className="flex gap-2 mt-1">
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
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        onClick={() => addToArray('condiciones_requeridas', newCondicionRequerida)}
                        disabled={loading || !newCondicionRequerida.trim()}
                      >
                        Añadir
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.inclusion_criteria.condiciones_requeridas?.map((condicion, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {condicion}
                          <button
                            type="button"
                            onClick={() => removeFromArray('condiciones_requeridas', index)}
                            className="ml-1 hover:text-red-600"
                            disabled={loading}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Condiciones Excluidas */}
                  <div>
                    <Label>Condiciones Excluidas</Label>
                    <div className="flex gap-2 mt-1">
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
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        onClick={() => addToArray('condiciones_excluidas', newCondicionExcluida)}
                        disabled={loading || !newCondicionExcluida.trim()}
                      >
                        Añadir
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.inclusion_criteria.condiciones_excluidas?.map((condicion, index) => (
                        <Badge key={index} variant="destructive" className="flex items-center gap-1">
                          {condicion}
                          <button
                            type="button"
                            onClick={() => removeFromArray('condiciones_excluidas', index)}
                            className="ml-1 hover:text-white"
                            disabled={loading}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Medicamentos Prohibidos */}
                  <div>
                    <Label>Medicamentos Prohibidos</Label>
                    <div className="flex gap-2 mt-1">
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
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        onClick={() => addToArray('medicamentos_prohibidos', newMedicamentoProhibido)}
                        disabled={loading || !newMedicamentoProhibido.trim()}
                      >
                        Añadir
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.inclusion_criteria.medicamentos_prohibidos?.map((medicamento, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {medicamento}
                          <button
                            type="button"
                            onClick={() => removeFromArray('medicamentos_prohibidos', index)}
                            className="ml-1 hover:text-red-600"
                            disabled={loading}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <Label htmlFor="otros_criterios">Otros Criterios</Label>
                <Textarea
                  id="otros_criterios"
                  value={formData.inclusion_criteria.otros_criterios || ''}
                  onChange={(e) => handleCriteriaChange('otros_criterios', e.target.value)}
                  placeholder="Cualquier otro criterio de inclusión o exclusión relevante..."
                  rows={4}
                  className="mt-1"
                  disabled={loading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección 4: Pacientes (solo en modo edición) */}
        {trial && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Pacientes Asociados</CardTitle>
                      <p className="text-sm text-gray-600">
                        {patients.length} {patients.length === 1 ? 'paciente asociado' : 'pacientes asociados'} a este ensayo
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowAddPatientsModal(true);
                        loadAvailablePatients();
                      }}
                      className="bg-[#04BFAD] hover:bg-[#024959] text-white"
                    >
                      + Agregar Pacientes
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingPatients ? (
                    <div className="text-center py-8 text-gray-500">Cargando pacientes...</div>
                  ) : patients.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No hay pacientes asociados a este ensayo aún.
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Edad</TableHead>
                            <TableHead>Condición</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {patients.map((patient) => {
                            let age: string | number = 'N/A';
                            if (patient.fechaNacimiento) {
                              try {
                                const birthDate = new Date(patient.fechaNacimiento);
                                if (!isNaN(birthDate.getTime())) {
                                  age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                                }
                              } catch (e) {
                                console.error('Error calculando edad:', e);
                              }
                            }
                            
                            return (
                              <TableRow key={patient.id}>
                                <TableCell className="font-medium">
                                  {patient.nombres || 'N/A'} {patient.apellidos || ''}
                                </TableCell>
                                <TableCell>{patient.email || 'N/A'}</TableCell>
                                <TableCell>{patient.telefono || 'N/A'}</TableCell>
                                <TableCell>{typeof age === 'number' ? `${age} años` : age}</TableCell>
                                <TableCell>{patient.condicionPrincipal || 'N/A'}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={patient.status === 'CONTACTED' ? 'default' : 'secondary'}
                                  >
                                    {patient.status || 'RECEIVED'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemovePatient(patient.id)}
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                    title="Quitar paciente de este ensayo"
                                  >
                                    ✕
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleCreateTrial}
            disabled={loading}
            className="bg-[#04BFAD] hover:bg-[#024959] text-white"
          >
            {loading ? 'Guardando...' : trial ? 'Actualizar Ensayo' : 'Crear Ensayo'}
          </Button>
        </div>
      </div>

      {/* Modal para agregar pacientes */}
      <Dialog open={showAddPatientsModal} onOpenChange={setShowAddPatientsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Pacientes al Ensayo</DialogTitle>
            <DialogDescription>
              Selecciona los pacientes que deseas agregar a este ensayo clínico
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {loadingAvailablePatients ? (
              <div className="text-center py-8 text-gray-500">Cargando pacientes disponibles...</div>
            ) : availablePatients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay pacientes disponibles para agregar.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedPatientIds.size === availablePatients.length && availablePatients.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPatientIds(new Set(availablePatients.map(p => p.id)));
                            } else {
                              setSelectedPatientIds(new Set());
                            }
                          }}
                          className="w-4 h-4"
                        />
                      </TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Edad</TableHead>
                      <TableHead>Condición</TableHead>
                      <TableHead>Ensayo Actual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availablePatients.map((patient) => {
                      let age: string | number = 'N/A';
                      if (patient.fechaNacimiento) {
                        try {
                          const birthDate = new Date(patient.fechaNacimiento);
                          if (!isNaN(birthDate.getTime())) {
                            age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                          }
                        } catch (e) {
                          console.error('Error calculando edad:', e);
                        }
                      }
                      
                      return (
                        <TableRow 
                          key={patient.id}
                          className={selectedPatientIds.has(patient.id) ? 'bg-[#A7F2EB]/20' : ''}
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedPatientIds.has(patient.id)}
                              onChange={() => togglePatientSelection(patient.id)}
                              className="w-4 h-4"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {patient.nombres || 'N/A'} {patient.apellidos || ''}
                          </TableCell>
                          <TableCell>{patient.email || 'N/A'}</TableCell>
                          <TableCell>{patient.telefono || 'N/A'}</TableCell>
                          <TableCell>{typeof age === 'number' ? `${age} años` : age}</TableCell>
                          <TableCell>{patient.condicionPrincipal || 'N/A'}</TableCell>
                          <TableCell>
                            {patient.trialId ? (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                En otro ensayo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                Disponible
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {selectedPatientIds.size > 0 && (
              <div className="p-3 bg-[#A7F2EB]/20 rounded-md text-sm text-[#024959]">
                ✓ {selectedPatientIds.size} {selectedPatientIds.size === 1 ? 'paciente seleccionado' : 'pacientes seleccionados'}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddPatientsModal(false);
                setSelectedPatientIds(new Set());
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAddPatients}
              disabled={selectedPatientIds.size === 0}
              className="bg-[#04BFAD] hover:bg-[#024959] text-white"
            >
              Agregar {selectedPatientIds.size > 0 ? `(${selectedPatientIds.size})` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para pacientes en otros ensayos */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-yellow-700 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Paciente en otro ensayo
            </DialogTitle>
            <DialogDescription>
              El paciente que intentas agregar ya está asignado a otro ensayo clínico.
            </DialogDescription>
          </DialogHeader>

          {patientToConfirm && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold text-gray-700">Paciente:</span>
                    <p className="text-gray-900">
                      {patientToConfirm.nombres} {patientToConfirm.apellidos}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Email:</span>
                    <p className="text-gray-900">{patientToConfirm.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Estado actual:</span>
                    <p className="text-yellow-700 font-medium">
                      Ya está en otro ensayo clínico
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                ¿Deseas agregar este paciente de todos modos? Esto podría causar conflictos 
                si el paciente está activamente participando en otro ensayo.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelAddPatient}
              disabled={loading}
            >
              No agregar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmAddPatient}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              disabled={loading}
            >
              Sí, agregar de todos modos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
