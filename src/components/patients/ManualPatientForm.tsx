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

import { useState } from 'react';
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
import { AddInstitutionModal } from '../trials/AddInstitutionModal';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { createPatientIntake } from '../../lib/api';
import type { CreatePatientIntakePayload } from '../../lib/api';
import { regionesChile, comunasPorRegion, getComunasByRegion } from '../../lib/regiones-comunas';

interface ManualPatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Las regiones y comunas ahora se importan desde el archivo compartido

// Patologías más prevalentes en Chile
const PATOLOGIAS_PREVALENTES = [
  "Hipertensión",
  "Diabetes",
  "Enfermedad pulmonar",
  "EPOC (Enfermedad Pulmonar Obstructiva Crónica)",
  "Enfermedad coronaria (infarto agudo al miocardio)",
  "Insuficiencia cardíaca",
  "Enfermedad renal crónica",
  "Asma",
  "Obesidad",
  "Fumador/a",
  "Otros"
];

// Códigos de país más comunes
const CODIGOS_PAIS = [
  { codigo: "+56", pais: "CL" },
  { codigo: "+54", pais: "AR" },
  { codigo: "+55", pais: "BR" },
  { codigo: "+57", pais: "CO" },
  { codigo: "+51", pais: "PE" },
  { codigo: "+52", pais: "MX" },
  { codigo: "+1", pais: "US" },
  { codigo: "+34", pais: "ES" },
  { codigo: "+44", pais: "UK" },
];

export function ManualPatientForm({ isOpen, onClose, onSuccess }: ManualPatientFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddInstitutionModalOpen, setIsAddInstitutionModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<any>({
    nombres: '',
    apellidos: '',
    rut: '',
    fechaNacimiento: '',
    sexo: '',
    telefonoCodigoPais: '+56', // ← Código de país por defecto (Chile)
    telefonoNumero: '', // ← Número sin código
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
    // Sitio/Institución de referencia (opcional)
    referralResearchSiteId: '',
    aceptaTerminos: true,
    aceptaPrivacidad: true,
    source: 'MANUAL_ENTRY',
  });

  // Patologías prevalentes en Chile
  const patologiasPrevalentes = [
    'Hipertensión',
    'Diabetes',
    'Enfermedad pulmonar',
    'EPOC (Enfermedad Pulmonar Obstructiva Crónica)',
    'Enfermedad coronaria (infarto agudo al miocardio)',
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

  // Formatear RUT chileno: 12.345.678-9
  const formatRut = (value: string) => {
    const cleaned = value.replace(/[^0-9kK]/g, '');
    if (cleaned.length === 0) return '';
    
    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);
    
    const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return body.length > 0 ? `${formatted}-${dv}` : cleaned;
  };

  // Formatear número de teléfono (solo dígitos, máximo 15)
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    return cleaned.slice(0, 15); // Máximo 15 dígitos según estándar E.164
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleRutChange = (value: string) => {
    const formatted = formatRut(value);
    handleInputChange('rut', formatted);
  };

  const handlePhoneNumberChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('telefonoNumero', formatted);
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
    if (!formData.fechaNacimiento) {
      setError('La fecha de nacimiento es requerida');
      return false;
    }
    if (!formData.sexo) {
      setError('El sexo es requerido');
      return false;
    }
    if (!formData.telefonoNumero?.trim()) {
      setError('El número de teléfono es requerido');
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
      // Preparar payload: si referralResearchSiteId está vacío, no enviarlo
      const payload = {
        ...formData,
        ...(formData.referralResearchSiteId ? { referralResearchSiteId: formData.referralResearchSiteId } : {}),
      };
      
      await createPatientIntake(payload);
      
      // Resetear formulario
      setFormData({
        nombres: '',
        apellidos: '',
        rut: '',
        fechaNacimiento: '',
        sexo: '',
        telefonoCodigoPais: '+56',
        telefonoNumero: '',
        email: '',
        region: '',
        comuna: '',
        direccion: '',
        condicionPrincipal: '',
        otrasEnfermedades: '',
        aceptaTerminos: true,
        aceptaPrivacidad: true,
        source: 'MANUAL_ENTRY',
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al crear paciente manual:', err);
      setError(err.message || 'Error al crear el paciente. Por favor, intenta nuevamente.');
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
                  placeholder="12.345.678-9"
                  disabled={loading}
                  className="mt-1"
                />
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
                    <SelectItem value="Hombre">Hombre</SelectItem>
                    <SelectItem value="Mujer">Mujer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#024959]">Contacto</h3>
            
            {/* Teléfono con selector de código de país */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefono">Teléfono *</Label>
                <div className="flex gap-2 mt-1">
                  <Select
                    value={formData.telefonoCodigoPais}
                    onValueChange={(value) => handleInputChange('telefonoCodigoPais', value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-[90px]">
                      <SelectValue placeholder="Código" />
                    </SelectTrigger>
                    <SelectContent>
                      {CODIGOS_PAIS.map((item) => (
                        <SelectItem key={item.codigo} value={item.codigo}>
                          {item.codigo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="telefonoNumero"
                    value={formData.telefonoNumero}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    placeholder="912345678"
                    maxLength={9}
                    disabled={loading}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ejemplo: {formData.telefonoCodigoPais} 912345678
                </p>
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="ejemplo@correo.cl"
                  disabled={loading}
                  className="mt-1"
                />
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
                    {regionesChile.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
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
                    {formData.region && getComunasByRegion(formData.region).map((comuna) => (
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

          {/* Sitio/Institución de Referencia */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#024959]">Sitio/Institución de Referencia</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Opcional</span>
            </div>
            
            <ResearchSiteAutocomplete
              value={formData.referralResearchSiteId}
              onSelect={(siteId) => handleInputChange('referralResearchSiteId', siteId)}
              onAddNew={() => setIsAddInstitutionModalOpen(true)}
              disabled={loading}
              placeholder="Buscar sitio/institución que derivó al paciente..."
              label="Sitio/Institución que Deriva"
              required={false}
            />
            
            <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <strong>💡 Información:</strong> Este campo es <strong>opcional</strong>. Solo complétalo si el paciente fue derivado por un sitio/institución específica 
              (ej: Clínica Alemana, Hospital Regional, Clínica Vanguardia). 
              Si el paciente ingresó directamente, puedes dejarlo en blanco.
            </p>
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

          {/* Consentimiento de Privacidad */}
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

      {/* Modal para agregar nuevo sitio/institución */}
      <AddInstitutionModal
        isOpen={isAddInstitutionModalOpen}
        onClose={() => setIsAddInstitutionModalOpen(false)}
        onSuccess={(newSite) => {
          setFormData({ ...formData, referralResearchSiteId: newSite.id });
          setIsAddInstitutionModalOpen(false);
        }}
      />
    </Dialog>
  );
}
