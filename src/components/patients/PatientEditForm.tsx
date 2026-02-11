/**
 * PatientEditForm.tsx
 * 
 * Formulario de edición de pacientes
 * - Permite editar información médica
 * - Permite cambiar el estado del paciente
 * - Muestra el ensayo asignado
 * - Permite editar información personal y de contacto (modo edición completa)
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TrialSuggestions } from './TrialSuggestions';
import type { PatientIntake } from '../../lib/api';
import { fetchWithAuth } from '../../lib/api';
// Usar componentes con lista COMPLETA de CIE-10 (14,000+ enfermedades) para el dashboard
import { Cie10SingleAutocompleteComplete } from '../ui/Cie10SingleAutocompleteComplete';
import { Cie10MultipleAutocomplete } from '../ui/Cie10MultipleAutocomplete';
import { MedicamentoSimpleAutocomplete } from '../ui/MedicamentoSimpleAutocomplete';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { regionesChile, getComunasByRegion } from '../../lib/regiones-comunas';
import { ChangeHistory } from '../ui/ChangeHistory';

interface PatientEditFormProps {
  patient: PatientIntake | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Estados disponibles para el paciente (flujo completo)
const PATIENT_STATUSES = [
  { value: 'RECEIVED', label: 'Recibido', color: 'bg-blue-100 text-blue-700', icon: '📥' },
  { value: 'VERIFIED', label: 'Verificado', color: 'bg-green-100 text-green-700', icon: '✅' },
  { value: 'STUDY_ASSIGNED', label: 'Estudio Asignado', color: 'bg-purple-100 text-purple-700', icon: '🔬' },
  { value: 'AWAITING_STUDY', label: 'En Espera de Estudio', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  { value: 'PENDING_CONTACT', label: 'Pendiente de Contacto', color: 'bg-orange-100 text-orange-700', icon: '📞' },
  { value: 'DISCARDED', label: 'Descartado', color: 'bg-rose-100 text-rose-700', icon: '🗑️' },
];

// Patologías prevalentes en Chile
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
  "Fumador/a"
];

export function PatientEditForm({ patient, isOpen, onClose, onSuccess }: PatientEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isFullEditMode, setIsFullEditMode] = useState(false);
  
  // Estado del formulario editable
  const [formData, setFormData] = useState({
    // Personal Info
    nombres: '',
    apellidos: '',
    rut: '',
    fechaNacimiento: '',
    sexo: '',
    // Contact Info
    email: '',
    telefono: '',
    region: '',
    comuna: '',
    direccion: '',
    // Medical Info
    condicionPrincipal: '',
    condicionPrincipalCodigo: '', // Código CIE-10
    descripcionCondicion: '',
    patologias: [] as string[], // Patologías prevalentes seleccionadas
    medicamentosActuales: '', // Legacy (texto libre)
    medicamentosEstructurados: [] as string[], // Nuevo (solo nombres)
    alergias: '', // Legacy (texto libre)
    alergiasEstructuradas: [] as Array<{ codigo: string; nombre: string }>, // Nuevo (CIE-10)
    otrasEnfermedades: '', // Legacy (texto libre)
    otrasEnfermedadesEstructuradas: [] as Array<{ codigo: string; nombre: string }>, // Nuevo (CIE-10)
    cirugiasPrevias: '',
    status: 'RECEIVED',
  });

  // Cargar datos del paciente cuando cambia
  useEffect(() => {
    if (patient && isOpen) {
      setFormData({
        nombres: patient.nombres || '',
        apellidos: patient.apellidos || '',
        rut: patient.rut || '',
        fechaNacimiento: patient.fechaNacimiento ? new Date(patient.fechaNacimiento).toISOString().split('T')[0] : '',
        sexo: patient.sexo || '',
        email: patient.email || '',
        telefono: patient.telefono || '',
        region: patient.region || '',
        comuna: patient.comuna || '',
        direccion: patient.direccion || '',
        condicionPrincipal: patient?.condicionPrincipal || '',
        condicionPrincipalCodigo: patient?.condicionPrincipalCodigo || '', // Código CIE-10
        descripcionCondicion: patient?.descripcionCondicion || '',
        patologias: (patient as any)?.patologias || [], // Patologías prevalentes
        medicamentosActuales: patient?.medicamentosActuales || '', // Legacy
        medicamentosEstructurados: (patient as any)?.medicamentosEstructurados || [], // Nuevo
        alergias: patient?.alergias || '', // Legacy
        alergiasEstructuradas: (patient as any)?.alergiasEstructuradas || [], // Nuevo
        otrasEnfermedades: (patient as any)?.otrasEnfermedades || '', // Legacy
        otrasEnfermedadesEstructuradas: (patient as any)?.otrasEnfermedadesEstructuradas || [], // Nuevo
        cirugiasPrevias: patient?.cirugiasPrevias || '',
        status: patient?.status || 'RECEIVED',
      });
      setIsFullEditMode(false); // Reset edit mode on open
    }
  }, [patient, isOpen]);

  // Si no está abierto o no hay paciente, no renderizar nada
  if (!isOpen || !patient) return null;

  // Formatear RUT
  const formatRut = (value: string) => {
    const cleaned = value.replace(/[^0-9kK]/g, '');
    if (cleaned.length <= 1) return cleaned;
    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);
    return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
  };

  // Calcular edad
  const calculateAge = (birthDate: string | undefined): string => {
    if (!birthDate) return 'N/A';
    try {
      const birth = new Date(birthDate);
      if (isNaN(birth.getTime())) return 'N/A';
      const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return `${age} años`;
    } catch {
      return 'N/A';
    }
  };

  // Formatear fecha para display
  const formatDateDisplay = (date: string | undefined): string => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Guardar cambios
  const handleSave = async () => {
    // Validar longitud del RUT si se está editando
    if (isFullEditMode && formData.rut) {
      const cleanRut = formData.rut.replace(/[^0-9kK]/g, '');
      if (cleanRut.length < 8 || cleanRut.length > 9) {
        setError('El RUT debe tener entre 8 y 9 caracteres');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      await fetchWithAuth(`/patient-intakes/${patient.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al actualizar paciente:', err);
      setError(err.message || 'No se pudo actualizar el paciente');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar paciente
  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await fetchWithAuth(`/patient-intakes/${patient.id}`, {
        method: 'DELETE'
      });
      
      setShowDeleteDialog(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al eliminar paciente:', err);
      setError(err.message || 'No se pudo eliminar el paciente');
      setShowDeleteDialog(false);
    } finally {
      setLoading(false);
    }
  };

  // Obtener el color del badge según el estado
  const getStatusColor = (status: string) => {
    const statusConfig = PATIENT_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#04BFAD]">
            Editar Paciente
          </h2>
          <p className="text-gray-600 mt-1">
            Modifica la información médica y el estado del paciente
          </p>
        </div>
        <div className="flex gap-2">
            <Button
            variant="outline"
            onClick={() => setIsFullEditMode(!isFullEditMode)}
            className="text-[#04BFAD] border-[#04BFAD] hover:bg-[#04BFAD]/10"
            >
            {isFullEditMode ? 'Bloquear Edición' : 'Editar paciente completo'}
            </Button>
            <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
            >
            ✕ Cerrar
            </Button>
        </div>
      </div>

      {/* Banner Confidencial */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400 text-xl">🔒</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <span className="font-bold">Registro médico confidencial.</span> La información aquí contenida está protegida y es sensible.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="space-y-6">
        {/* Sección 1: Información Personal */}
        <Card className={`border ${isFullEditMode ? 'border-[#04BFAD]' : 'border-gray-200'}`}>
          <CardHeader className={isFullEditMode ? 'bg-[#A7F2EB]/10' : ''}>
            <CardTitle className="text-lg text-[#024959] font-semibold flex items-center gap-2">
                Información Personal {isFullEditMode && <Badge className="bg-[#04BFAD]">Editable</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombres</Label>
                <Input
                  value={formData.nombres}
                  onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                  disabled={!isFullEditMode}
                  className={!isFullEditMode ? "mt-1 bg-gray-50" : "mt-1"}
                />
              </div>
              <div>
                <Label>Apellidos</Label>
                <Input
                  value={formData.apellidos}
                  onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                  disabled={!isFullEditMode}
                  className={!isFullEditMode ? "mt-1 bg-gray-50" : "mt-1"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>RUT</Label>
                <Input
                  value={formData.rut}
                  onChange={(e) => setFormData({...formData, rut: formatRut(e.target.value)})}
                  disabled={!isFullEditMode}
                  className={!isFullEditMode ? "mt-1 bg-gray-50" : "mt-1"}
                />
              </div>
              <div>
                <Label>Fecha de Nacimiento</Label>
                <Input
                  type={isFullEditMode ? "date" : "text"}
                  value={isFullEditMode ? formData.fechaNacimiento : formatDateDisplay(formData.fechaNacimiento)}
                  onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})}
                  disabled={!isFullEditMode}
                  className={!isFullEditMode ? "mt-1 bg-gray-50" : "mt-1"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Edad</Label>
                <Input
                  value={calculateAge(formData.fechaNacimiento)}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div>
                <Label>Sexo</Label>
                {isFullEditMode ? (
                    <Select
                        value={formData.sexo}
                        onValueChange={(value) => setFormData({...formData, sexo: value})}
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Hombre">Hombre</SelectItem>
                            <SelectItem value="Mujer">Mujer</SelectItem>
                        </SelectContent>
                    </Select>
                ) : (
                    <Input
                    value={formData.sexo || 'N/A'}
                    disabled
                    className="mt-1 bg-gray-50"
                    />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección 2: Información de Contacto */}
        <Card className={`border ${isFullEditMode ? 'border-[#04BFAD]' : 'border-gray-200'}`}>
          <CardHeader className={isFullEditMode ? 'bg-[#A7F2EB]/10' : ''}>
            <CardTitle className="text-lg text-[#024959] font-semibold flex items-center gap-2">
                Información de Contacto {isFullEditMode && <Badge className="bg-[#04BFAD]">Editable</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!isFullEditMode}
                  className={!isFullEditMode ? "mt-1 bg-gray-50" : "mt-1"}
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  disabled={!isFullEditMode}
                  className={!isFullEditMode ? "mt-1 bg-gray-50" : "mt-1"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Región</Label>
                {isFullEditMode ? (
                    <Select
                        value={formData.region}
                        onValueChange={(value) => setFormData({...formData, region: value, comuna: ''})}
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
                ) : (
                    <Input
                    value={formData.region || 'N/A'}
                    disabled
                    className="mt-1 bg-gray-50"
                    />
                )}
              </div>
              <div>
                <Label>Comuna</Label>
                {isFullEditMode ? (
                    <Select
                        value={formData.comuna}
                        onValueChange={(value) => setFormData({...formData, comuna: value})}
                        disabled={!formData.region}
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Seleccionar comuna" />
                        </SelectTrigger>
                        <SelectContent>
                            {formData.region && getComunasByRegion(formData.region).map((comuna) => (
                                <SelectItem key={comuna.value} value={comuna.value}>
                                    {comuna.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Input
                    value={formData.comuna || 'N/A'}
                    disabled
                    className="mt-1 bg-gray-50"
                    />
                )}
              </div>
            </div>

            <div>
              <Label>Dirección</Label>
              <Input
                value={formData.direccion}
                onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                disabled={!isFullEditMode}
                className={!isFullEditMode ? "mt-1 bg-gray-50" : "mt-1"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sección 2.5: Origen del Paciente (Solo lectura) */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-[#024959] font-semibold">Origen del Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fuente de Registro</Label>
                <div className="mt-1">
                  <Badge 
                    className={
                      patient.source === 'WEB_FORM' 
                        ? 'bg-blue-100 text-blue-700 border-blue-300' 
                        : 'bg-purple-100 text-purple-700 border-purple-300'
                    }
                  >
                    {patient.source === 'WEB_FORM' ? '🌐 Formulario Web' : '✍️ Ingreso Manual'}
                  </Badge>
                </div>
              </div>
              
              {/* Solo mostrar institución si es MANUAL_ENTRY y tiene referralResearchSiteId */}
              {patient.source === 'MANUAL_ENTRY' && patient.referralResearchSiteId && (
                <div>
                  <Label>Institución que Deriva</Label>
                  <Input
                    value={patient.referralResearchSite?.nombre || 'Cargando...'}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>
              )}
              
              {/* Mensaje si es MANUAL_ENTRY pero NO tiene institución */}
              {patient.source === 'MANUAL_ENTRY' && !patient.referralResearchSiteId && (
                <div>
                  <Label>Institución que Deriva</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-500">
                    Sin institución asociada
                  </div>
                </div>
              )}
            </div>

            {/* Información adicional de la institución si existe */}
            {patient.source === 'MANUAL_ENTRY' && patient.referralResearchSite && (
              <div className="mt-4 p-4 bg-gradient-to-r from-[#A7F2EB]/10 to-transparent rounded-lg border border-[#04BFAD]/20">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>📍 Ubicación:</strong>{' '}
                  {[
                    patient.referralResearchSite.ciudad,
                    patient.referralResearchSite.comuna,
                    patient.referralResearchSite.region
                  ].filter(Boolean).join(', ') || 'No especificada'}
                </p>
                {patient.referralResearchSite.telefono && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>📞 Teléfono:</strong> {patient.referralResearchSite.telefono}
                  </p>
                )}
                {patient.referralResearchSite.email && (
                  <p className="text-sm text-gray-600">
                    <strong>📧 Email:</strong> {patient.referralResearchSite.email}
                  </p>
                )}
              </div>
            )}

            {/* Mensaje informativo para pacientes de WEB */}
            {patient.source === 'WEB_FORM' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>ℹ️ Información:</strong> Este paciente se registró directamente desde el formulario web de la plataforma.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sección 3: Información Médica (EDITABLE) */}
        <Card className="border border-[#04BFAD]">
          <CardHeader className="bg-[#A7F2EB]/10">
            <CardTitle className="text-lg text-[#024959] font-semibold flex items-center gap-2">
              <span>📋</span> Información Médica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            <div>
              <Cie10SingleAutocompleteComplete
                label="Condición Principal *"
                value={formData.condicionPrincipal}
                selectedCode={formData.condicionPrincipalCodigo}
                onChange={(nombre: string, codigo: string) => {
                  setFormData({ 
                    ...formData, 
                    condicionPrincipal: nombre,
                    condicionPrincipalCodigo: codigo
                  });
                }}
                placeholder="Buscar enfermedad por nombre o código CIE-10..."
                required
              />
            </div>

            <div>
              <Label htmlFor="descripcionCondicion">Descripción de la Condición</Label>
              <Textarea
                id="descripcionCondicion"
                value={formData.descripcionCondicion}
                onChange={(e) => setFormData({ ...formData, descripcionCondicion: e.target.value })}
                placeholder="Describe los síntomas y detalles de la condición..."
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Patologías Prevalentes */}
            <div>
              <Label className="mb-3 block">Patologías Prevalentes</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-[#F2F2F2]/50 rounded-xl">
                {PATOLOGIAS_PREVALENTES.map((patologia) => (
                  <Checkbox
                    key={patologia}
                    id={`edit-${patologia}`}
                    checked={formData.patologias.includes(patologia)}
                    onChange={(checked) => {
                      const newPatologias = checked
                        ? [...formData.patologias, patologia]
                        : formData.patologias.filter((p) => p !== patologia);
                      setFormData({ ...formData, patologias: newPatologias });
                    }}
                    label={patologia}
                  />
                ))}
              </div>
              {formData.patologias.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.patologias.map((pat) => (
                    <Badge key={pat} variant="outline" className="bg-[#04BFAD]/10 text-[#024959]">
                      {pat}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Otras Enfermedades */}
            <div>
              <Cie10MultipleAutocomplete
                label="Otras Enfermedades (CIE-10)"
                value={formData.otrasEnfermedadesEstructuradas}
                onChange={(enfermedades) => setFormData({ ...formData, otrasEnfermedadesEstructuradas: enfermedades })}
                placeholder="Buscar enfermedades por nombre o código CIE-10..."
              />
            </div>

            {/* Alergias */}
            <div>
              <Cie10MultipleAutocomplete
                label="Alergias (CIE-10)"
                value={formData.alergiasEstructuradas}
                onChange={(alergias) => setFormData({ ...formData, alergiasEstructuradas: alergias })}
                placeholder="Buscar alergias por nombre o código CIE-10..."
              />
            </div>

            {/* Medicamentos Actuales */}
            <div>
              <MedicamentoSimpleAutocomplete
                label="Medicamentos Actuales"
                value={formData.medicamentosEstructurados}
                onChange={(medicamentos) => setFormData({ ...formData, medicamentosEstructurados: medicamentos })}
                placeholder="Buscar medicamento o escribir uno personalizado..."
              />
            </div>

            <div>
              <Label htmlFor="cirugiasPrevias">Cirugías Previas</Label>
              <Textarea
                id="cirugiasPrevias"
                value={formData.cirugiasPrevias}
                onChange={(e) => setFormData({ ...formData, cirugiasPrevias: e.target.value })}
                placeholder="Historial de cirugías..."
                rows={2}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sección 4: Estado y Ensayo (EDITABLE) */}
        <Card className="border border-[#04BFAD]">
          <CardHeader className="bg-[#A7F2EB]/10">
            <CardTitle className="text-lg text-[#024959] font-semibold flex items-center gap-2">
              <span>🎯</span> Estado y Asignación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Estado del Paciente *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PATIENT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{status.icon}</span>
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Estado actual del proceso del paciente
                </p>
              </div>
              <div>
                <Label>Ensayo Asignado</Label>
                <Input
                  value={patient.trial?.title || 'Sin asignar'}
                  disabled
                  className="mt-1 bg-gray-50"
                />
                {patient.trial && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> Paciente asignado a este ensayo
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>Fecha de Registro</Label>
              <Input
                value={formatDateDisplay(patient.createdAt)}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Mensaje de error */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Sugerencias de estudios clínicos - Solo si NO tiene ensayo asignado */}
        {!patient.trialId && (
          <div className="mt-6">
            <TrialSuggestions
              patientId={patient.id}
              currentTrialId={patient.trialId}
              onAssign={onSuccess}
            />
          </div>
        )}

        {/* Historial de Cambios */}
        <ChangeHistory entityName="PatientIntake" entityId={patient.id} />

        {/* Botones de acción */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <Button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => setShowDeleteDialog(true)}
            disabled={loading}
          >
            🗑️ Eliminar Paciente
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              style={{ background: 'linear-gradient(to right, #04bcbc, #346c84)' }}
              className="text-white hover:opacity-90 transition-opacity"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Guardando...' : '💾 Guardar Cambios'}
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
            Contacta a soporte.
          </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
