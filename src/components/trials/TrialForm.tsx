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
import type { Trial, CreateTrialPayload, Sponsor } from '../../lib/api';
import { createTrial, updateTrial, getSponsors } from '../../lib/api';

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
  const [loading, setLoading] = useState(false);
  const [loadingSponsors, setLoadingSponsors] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Campos temporales para arrays
  const [newCondicionRequerida, setNewCondicionRequerida] = useState('');
  const [newCondicionExcluida, setNewCondicionExcluida] = useState('');
  const [newMedicamentoProhibido, setNewMedicamentoProhibido] = useState('');

  // Cargar sponsors al montar
  useEffect(() => {
    loadSponsors();
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
    if (!validateStep(3)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Limpiar inclusion_criteria eliminando valores undefined y vacíos
      const cleanedCriteria: any = {};
      
      if (formData.inclusion_criteria.edad_minima !== undefined && formData.inclusion_criteria.edad_minima !== null) {
        cleanedCriteria.edad_minima = formData.inclusion_criteria.edad_minima;
      }
      if (formData.inclusion_criteria.edad_maxima !== undefined && formData.inclusion_criteria.edad_maxima !== null) {
        cleanedCriteria.edad_maxima = formData.inclusion_criteria.edad_maxima;
      }
      if (formData.inclusion_criteria.genero && formData.inclusion_criteria.genero !== 'todos') {
        cleanedCriteria.genero = formData.inclusion_criteria.genero;
      }
      if (formData.inclusion_criteria.condiciones_requeridas && formData.inclusion_criteria.condiciones_requeridas.length > 0) {
        cleanedCriteria.condiciones_requeridas = formData.inclusion_criteria.condiciones_requeridas;
      }
      if (formData.inclusion_criteria.condiciones_excluidas && formData.inclusion_criteria.condiciones_excluidas.length > 0) {
        cleanedCriteria.condiciones_excluidas = formData.inclusion_criteria.condiciones_excluidas;
      }
      if (formData.inclusion_criteria.medicamentos_prohibidos && formData.inclusion_criteria.medicamentos_prohibidos.length > 0) {
        cleanedCriteria.medicamentos_prohibidos = formData.inclusion_criteria.medicamentos_prohibidos;
      }
      if (formData.inclusion_criteria.otros_criterios && formData.inclusion_criteria.otros_criterios.trim()) {
        cleanedCriteria.otros_criterios = formData.inclusion_criteria.otros_criterios.trim();
      }

      const payload: CreateTrialPayload = {
        title: formData.title.trim(),
        public_description: formData.public_description.trim(),
        clinic_city: formData.clinic_city.trim(),
        status: formData.status,
        inclusion_criteria: cleanedCriteria,
        // Solo incluir sponsor_id si tiene un valor
        ...(formData.sponsor_id && { sponsor_id: formData.sponsor_id }),
      };

      console.log('Enviando payload:', JSON.stringify(payload, null, 2));

      if (trial) {
        await updateTrial(trial.id, payload);
      } else {
        const result = await createTrial(payload);
        console.log('Ensayo creado:', result);
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Error guardando ensayo:', err);
      console.error('Status del error:', err.status);
      console.error('Detalles del error:', err.response?.data || err);
      
      // Detectar errores de autenticación/autorización usando el status code
      if (err.status === 401 || err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        setError('Tu sesión ha expirado. Redirigiendo al login...');
        // El redirect ya se hace automáticamente en fetchWithAuth
      } else if (err.status === 403 || err.message?.includes('403') || err.message?.includes('Forbidden')) {
        setError('No tienes permisos para crear ensayos. Verifica que tu usuario tenga rol ADMIN o DOCTOR.');
      } else {
        setError(err.response?.data?.message || err.message || 'Error al guardar el ensayo. Por favor, intenta nuevamente.');
      }
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {trial ? 'Editar Ensayo Clínico' : 'Crear Nuevo Ensayo Clínico'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 1 && 'Información básica del ensayo'}
            {currentStep === 2 && 'Ubicación y patrocinador'}
            {currentStep === 3 && 'Criterios de inclusión (opcional)'}
          </DialogDescription>
        </DialogHeader>

        {/* Indicador de pasos */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep
                    ? 'bg-blue-600 text-white'
                    : step < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step < currentStep ? '✓' : step}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-1 ${
                    step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Paso 1: Información Básica */}
          {currentStep === 1 && (
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
          )}

          {/* Paso 2: Ubicación y Sponsor */}
          {currentStep === 2 && (
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
            </div>
          )}

          {/* Paso 3: Criterios de Inclusión */}
          {currentStep === 3 && (
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
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Botones de navegación */}
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                >
                  Atrás
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleCreateTrial}
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : trial ? 'Actualizar Ensayo' : 'Crear Ensayo'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
