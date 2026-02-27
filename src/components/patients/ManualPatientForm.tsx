/**
 * Formulario para crear pacientes manualmente desde el dashboard
 * 
 * Este componente permite a los administradores agregar pacientes directamente,
 * marcándolos con source: 'MANUAL' para distinguirlos de los que vienen del formulario web.
 * 
 * Características:
 * - Validación de campos requeridos
 * - Formateo automático de RUT y teléfono
 * - Selección de regiones y comunas de Chile
 * - Integración con el mismo endpoint que el formulario web
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
// Componentes CIE-10 COMPLETOS para el dashboard (14,000+ enfermedades)
import { Cie10SingleAutocompleteComplete } from '../ui/Cie10SingleAutocompleteComplete';
import { Cie10MultipleAutocomplete } from '../ui/Cie10MultipleAutocomplete';
import { MedicamentoSimpleAutocomplete } from '../ui/MedicamentoSimpleAutocomplete';
import { ResearchSiteAutocomplete } from '../ui/research-site-autocomplete';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { createPatientIntake } from '../../lib/api';
import type { CreatePatientIntakePayload } from '../../lib/api';
import { useCommunes } from '../../hooks/useCommunes';
import { formatRut, validateRutModulo11 } from '../../utils/rut-utils';

interface ManualPatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userRole?: string | null;
}

// Las regiones y comunas ahora se importan desde el archivo compartido

export function ManualPatientForm({ isOpen, onClose, onSuccess, userRole }: ManualPatientFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  
  // Hook para obtener comunas desde la API
  const { communes, loading: communesLoading, getCommunesByRegion, getAllRegions } = useCommunes();
  
  const [formData, setFormData] = useState<any>({
    nombres: '',
    apellidos: '',
    rut: '',
    fechaNacimiento: '',
    sexo: '',
    telefono: '', 
    email: '',
    region: '',
    comuna: '',
    direccion: '',
    condicionPrincipal: '',
    condicionPrincipalCodigo: '', // ← Código CIE-10 de la condición principal
    patologias: [], // ← Checkboxes de patologías prevalentes
    // Campos estructurados (nuevos)
    medicamentosEstructurados: [] as string[], // Solo nombres de medicamentos
    alergiasEstructuradas: [] as Array<{ codigo: string; nombre: string }>,
    otrasEnfermedadesEstructuradas: [] as Array<{ codigo: string; nombre: string }>,
    // Campos legacy (texto libre)
    otrasEnfermedades: '',
    alergias: '',
    medicamentosActuales: '',
    aceptaTerminos: true,
    aceptaPrivacidad: true,
    aceptaAlmacenamiento15Anos: true,
    source: 'MANUAL_ENTRY',
    referralResearchSiteId: '',
  });

  // Patologías prevalentes en Chile (sincronizado con formulario web)
  const patologiasPrevalentes = [
    'Hipertensión',
    'Diabetes',
    'Enfermedad coronaria (infarto agudo al miocardio)',
    'EPOC (Enfermedad Pulmonar Obstructiva Crónica)',
    'Enfermedad pulmonar',
    'Insuficiencia cardíaca',
    'Enfermedad renal crónica',
    'Asma',
    'Obesidad',
    'Fumador/a'
  ];

  // Manejar selección de patologías
  const handlePatologiaToggle = (patologia: string) => {
    setFormData((prev: any) => {
      const patologias = prev.patologias?.includes(patologia)
        ? prev.patologias.filter((p: string) => p !== patologia)
        : [...(prev.patologias || []), patologia];
      return { ...prev, patologias };
    });
  };

  // formatRut importado desde utils/rut-utils.ts

  // Formatear número de teléfono chileno (+56 fijo y 9 dígitos exactos)
  const formatPhoneNumber = (value: string) => {
    // Solo permitir dígitos, máximo 9 caracteres
    const cleaned = value.replace(/[^0-9]/g, '');
    
    // Validar que tenga exactamente 9 dígitos
    if (cleaned.length > 9) {
      return cleaned.slice(0, 9); // Cortar a 9 dígitos máximo
    }
    
    return cleaned;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setError(null);
    setFieldErrors(prev => ({ ...prev, [field]: false }));
  };

  const handleRutChange = (value: string) => {
    handleInputChange('rut', formatRut(value));
  };

  // Validar RUT en tiempo real (onBlur) usando utilidad compartida
  const validateRutField = (): boolean => {
    if (!formData.rut?.trim()) return true;
    const result = validateRutModulo11(formData.rut);
    if (!result.valid && result.error) {
      setError(result.error);
      return false;
    }
    return true;
  };

  // Validar email en tiempo real (onBlur)
  const validateEmail = (): boolean => {
    if (!formData.email?.trim()) return true;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('El formato del email es inválido');
      return false;
    }
    
    return true;
  };

  const handlePhoneNumberChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('telefono', formatted);
  };


  const validateForm = (): boolean => {
    if (!formData.nombres?.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.apellidos?.trim()) {
      setError('Los apellidos son requeridos');
      return false;
    }
    if (!formData.rut?.trim()) {
      setError('El RUT es requerido');
      return false;
    }
    
    // Validar RUT con algoritmo módulo 11
    const rutResult = validateRutModulo11(formData.rut);
    if (!rutResult.valid) {
      setError(rutResult.error || 'El RUT no es válido');
      return false;
    }

    if (!formData.fechaNacimiento) {
      setError('La fecha de nacimiento es requerida');
      return false;
    }
    if (!formData.sexo) {
      setError('El sexo es requerido');
      return false;
    }
    if (!formData.telefono?.trim()) {
      setError('El número de teléfono es requerido');
      return false;
    }
    
    // Validar que el teléfono tenga exactamente 9 dígitos
    if (formData.telefono.replace(/[^0-9]/g, '').length !== 9) {
      setError('El número de teléfono debe tener exactamente 9 dígitos');
      return false;
    }
    if (!formData.email?.trim()) {
      setError('El email es requerido');
      return false;
    }
    if (!formData.region) {
      setError('La región es requerida');
      return false;
    }
    if (!formData.comuna?.trim()) {
      setError('La comuna es requerida');
      return false;
    }
    if (!formData.condicionPrincipal?.trim()) {
      setError('La condición principal es requerida');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar payload con teléfono formateado completo (+56 + 9 dígitos)
      const payload: any = {
        ...formData,
        telefono: `+56${formData.telefono.replace(/[^0-9]/g, '')}`,
        telefonoCodigoPais: '+56',
        telefonoNumero: formData.telefono.replace(/[^0-9]/g, ''),
      };

      // Eliminar referralResearchSiteId si está vacío para evitar error de validación UUID
      if (!payload.referralResearchSiteId) {
        delete payload.referralResearchSiteId;
      }
      
      await createPatientIntake(payload);
      
      // Resetear formulario
      setFormData({
        nombres: '',
        apellidos: '',
        rut: '',
        fechaNacimiento: '',
        sexo: '',
        telefono: '',
        email: '',
        region: '',
        comuna: '',
        direccion: '',
        referralResearchSiteId: '',
        condicionPrincipal: '',
        otrasEnfermedades: '',
        aceptaTerminos: true,
        aceptaPrivacidad: true,
        aceptaAlmacenamiento15Anos: true,
        source: 'MANUAL_ENTRY',
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al crear paciente manual:', err);
      const msg = err.message || 'Error al crear el paciente. Por favor, intenta nuevamente.';
      setError(msg);
      // Detectar campo con error según mensaje del backend
      if (msg.toLowerCase().includes('email')) {
        setFieldErrors(prev => ({ ...prev, email: true }));
      }
      if (msg.toLowerCase().includes('rut')) {
        setFieldErrors(prev => ({ ...prev, rut: true }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#024959]">
            Agregar Paciente Manualmente
          </DialogTitle>
          <DialogDescription>
            Complete los datos del paciente. Este registro se marcará como creado manualmente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Datos Personales */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#024959]">Datos Personales</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombres">Nombres *</Label>
                <Input
                  id="nombres"
                  value={formData.nombres}
                  onChange={(e) => handleInputChange('nombres', e.target.value)}
                  placeholder="Ej: Juan Carlos"
                  disabled={loading}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  id="apellidos"
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange('apellidos', e.target.value)}
                  placeholder="Ej: González Pérez"
                  disabled={loading}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="rut">RUT *</Label>
                <Input
                  id="rut"
                  value={formData.rut}
                  onChange={(e) => handleRutChange(e.target.value)}
                  onBlur={validateRutField}
                  placeholder="12.345.678-9"
                  disabled={loading}
                  className={`mt-1 ${fieldErrors.rut ? 'border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {fieldErrors.rut && (
                  <p className="text-xs text-red-500 mt-1">Este RUT ya está registrado</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  min={new Date(new Date().setFullYear(new Date().getFullYear() - 150)).toISOString().split('T')[0]}
                  disabled={loading}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="sexo">Sexo *</Label>
                <Select
                  value={formData.sexo}
                  onValueChange={(value) => handleInputChange('sexo', value)}
                  disabled={loading}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Hombre</SelectItem>
                    <SelectItem value="femenino">Mujer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#024959]">Contacto</h3>
            
            {/* Teléfono y Email en la misma fila */}
            <div className="grid grid-cols-2 gap-4">
              {/* Teléfono chileno con prefijo +56 fijo */}
              <div>
                <Label htmlFor="telefono">Teléfono *</Label>
                <div className="flex items-center mt-1">
                  <div className="inline-flex items-center px-3 h-10 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                    +56
                  </div>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    placeholder="912345678"
                    disabled={loading}
                    className="rounded-l-none flex-1"
                    maxLength={9}
                  />
                </div>
                {formData.telefono && formData.telefono.length !== 9 && (
                  <p className="text-sm text-red-500 mt-1">
                    El número debe tener exactamente 9 dígitos
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={validateEmail}
                  placeholder="paciente@ejemplo.cl"
                  disabled={loading}
                  className={`mt-1 ${fieldErrors.email ? 'border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 mt-1">Este email ya está registrado</p>
                )}
              </div>
            </div>
            </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#024959]">Ubicación</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="region">Región *</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => {
                    handleInputChange('region', value);
                    handleInputChange('comuna', ''); // Limpiar comuna al cambiar región
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar región" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllRegions().map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="comuna">Comuna *</Label>
                <Select
                  value={formData.comuna}
                  onValueChange={(value) => handleInputChange('comuna', value)}
                  disabled={loading || !formData.region}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={formData.region ? "Seleccionar comuna" : "Primero selecciona región"} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.region && getCommunesByRegion(formData.region).map((comuna) => (
                      <SelectItem key={comuna.value} value={comuna.value}>
                        {comuna.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="direccion">Dirección (Opcional)</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                placeholder="Ej: Av. Libertador Bernardo O'Higgins 123"
                disabled={loading}
                className="mt-1"
              />
            </div>
          </div>





          {/* Origen del Paciente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#024959]">Origen del Paciente</h3>
            
            {/* Ocultar selector de institución para usuarios INSTITUTION */}
            {userRole !== 'INSTITUTION' && (
              <div>
                <ResearchSiteAutocomplete
                  value={formData.referralResearchSiteId || ''}
                  onSelect={(siteId) => handleInputChange('referralResearchSiteId', siteId)}
                  label="Institución que deriva (Opcional)"
                  placeholder="Buscar hospital, clínica o centro médico..."
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {/* Información Médica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#024959]">Información Médica</h3>
            
            {/* Autocomplete CIE-10 COMPLETO para Condición Principal */}
            <Cie10SingleAutocompleteComplete
              label="Condición Médica Principal *"
              value={formData.condicionPrincipal || ''}
              selectedCode={formData.condicionPrincipalCodigo || ''}
              onChange={(nombre: string, codigo: string) => {
                handleInputChange('condicionPrincipal', nombre);
                handleInputChange('condicionPrincipalCodigo', codigo);
              }}
              placeholder="Buscar enfermedad por nombre o código CIE-10..."
              disabled={loading}
              required
            />

            {/* Patologías Prevalentes (Checkboxes) */}
            <div>
              <label className="block text-sm font-medium text-[#024959] mb-3">
                ¿Tiene alguna de estas patologías? (Selecciona todas las que apliquen)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-[#F2F2F2]/50 rounded-xl">
                {patologiasPrevalentes.map((patologia) => (
                  <Checkbox
                    key={patologia}
                    id={`manual-${patologia}`}
                    checked={formData.patologias?.includes(patologia) || false}
                    onChange={(checked) => handlePatologiaToggle(patologia)}
                    label={patologia}
                  />
                ))}
              </div>
              {formData.patologias && formData.patologias.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.patologias.map((pat: string) => (
                    <Badge key={pat} variant="outline" className="bg-[#04BFAD]/10 text-[#024959]">
                      {pat}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Otras Enfermedades (CIE-10 Múltiple) */}
            <div>
              <Cie10MultipleAutocomplete
                label="Otras Enfermedades (CIE-10)"
                value={formData.otrasEnfermedadesEstructuradas}
                onChange={(enfermedades) => handleInputChange('otrasEnfermedadesEstructuradas', enfermedades)}
                placeholder="Buscar enfermedades por nombre o código CIE-10..."
                disabled={loading}
              />
            </div>

            {/* Alergias (CIE-10 Múltiple) */}
            <div>
              <Cie10MultipleAutocomplete
                label="Alergias (CIE-10)"
                value={formData.alergiasEstructuradas}
                onChange={(alergias) => handleInputChange('alergiasEstructuradas', alergias)}
                placeholder="Buscar alergias por nombre o código CIE-10..."
                disabled={loading}
              />
            </div>

            {/* Medicamentos Actuales (Solo Nombres) */}
            <div>
              <MedicamentoSimpleAutocomplete
                label="Medicamentos Actuales"
                value={formData.medicamentosEstructurados}
                onChange={(medicamentos) => handleInputChange('medicamentosEstructurados', medicamentos)}
                placeholder="Buscar medicamento o escribir uno personalizado..."
                disabled={loading}
              />
            </div>

          </div>

          {/* Consentimiento Informado */}
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consentimiento"
                  checked={formData.aceptaPrivacidad || false}
                  onChange={(e) => handleInputChange('aceptaPrivacidad', e.target.checked)}
                  disabled={loading}
                  className="mt-1 h-4 w-4 text-[#04BFAD] border-gray-300 rounded focus:ring-[#024959]"
                />
                <div className="flex-1">
                  <Label htmlFor="consentimiento" className="text-sm font-medium text-gray-900 cursor-pointer">
                    Consentimiento de Privacidad *
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Confirmo que el paciente ha dado su consentimiento para que yoparticipo.cl almacene y procese su información personal con fines de participación en estudios clínicos, de acuerdo con nuestra Política de Privacidad.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consentimiento15"
                  checked={formData.aceptaAlmacenamiento15Anos || false}
                  onChange={(e) => handleInputChange('aceptaAlmacenamiento15Anos', e.target.checked)}
                  disabled={loading}
                  className="mt-1 h-4 w-4 text-[#04BFAD] border-gray-300 rounded focus:ring-[#024959]"
                />
                <div className="flex-1">
                  <Label htmlFor="consentimiento15" className="text-sm font-medium text-gray-900 cursor-pointer">
                    Consentimiento de Almacenamiento (15 años) *
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Confirmo que el paciente acepta que sus datos sean almacenados por un periodo de 15 años después del registro.
                    <br /><strong>Consentimiento válido por una duración de 15 años después del registro.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Botones */}
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
              type="submit"
              disabled={loading}
              className="bg-[#04BFAD] hover:bg-[#024959] text-white"
            >
              {loading ? 'Guardando...' : 'Guardar Paciente'}
            </Button>
          </div>
        </form>
      </DialogContent>

    </Dialog>
  );
}
