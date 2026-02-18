/**
 * PatientDetailsForm.tsx
 * 
 * Formulario de visualización y edición de detalles de pacientes
 * - Muestra toda la información del paciente
 * - Campos deshabilitados para solo lectura
 * - Opción para eliminar paciente
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrialSuggestions } from './TrialSuggestions';
import type { PatientIntake } from '../../lib/api';
import { fetchWithAuth, updatePatientIntake } from '../../lib/api';
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

interface PatientDetailsFormProps {
  patient: PatientIntake | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PatientDetailsForm({ patient, isOpen, onClose, onSuccess }: PatientDetailsFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PatientIntake>>({});

  useEffect(() => {
    if (patient) {
      setFormData(patient);
      setIsEditing(false);
    }
  }, [patient]);

  // Si no está abierto o no hay paciente, no renderizar nada
  if (!isOpen || !patient) return null;

  const handleInputChange = (field: keyof PatientIntake, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Limpiar campos nulos o undefined
      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== null && v !== undefined && v !== '')
      );
      
      // Asegurarse de enviar el estado correcto
      if (cleanData.status && !Object.keys(statusLabels).includes(cleanData.status as string)) {
        delete cleanData.status;
      }

      await updatePatientIntake(patient.id, cleanData);
      setIsEditing(false);
      onSuccess(); // Recargar datos
    } catch (err: any) {
      console.error('Error al actualizar paciente:', err);
      setError(err.message || 'No se pudo actualizar el paciente');
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Cancelar edición: revertir cambios
      setFormData(patient);
    }
    setIsEditing(!isEditing);
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

  // Formatear fecha
  const formatDate = (date: string | undefined): string => {
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

  // Mapeo de estados
  const statusLabels: Record<string, string> = {
    RECEIVED: 'Recibido',
    VERIFIED: 'Verificado',
    STUDY_ASSIGNED: 'Asignado a Estudio',
    AWAITING_STUDY: 'Esperando Estudio',
    PENDING_CONTACT: 'Pendiente de Contacto',
    DISCARDED: 'Descartado'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#04BFAD]">
            Detalles del Paciente
          </h2>
          <p className="text-gray-600 mt-1">
            Información completa del paciente registrado en el sistema
          </p>
        </div>
        <div className="flex gap-2">
            {!isEditing ? (
              <Button 
                variant="outline" 
                onClick={toggleEdit}
                className="border-[#04BFAD] text-[#04BFAD] hover:bg-[#04BFAD] hover:text-white"
              >
                ✏️ Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  onClick={toggleEdit}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-[#04BFAD] hover:bg-[#03a091] text-white"
                >
                  {loading ? 'Guardando...' : '💾 Guardar'}
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
            >
              ✕ Cerrar
            </Button>
        </div>
      </div>

      {/* Formulario */}
      <div className="space-y-6">
        {/* Sección 1: Información Personal */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-[#04BFAD] font-semibold">Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombres</Label>
                <Input
                  value={isEditing ? (formData.nombres || '') : (patient.nombres || 'N/A')}
                  onChange={(e) => handleInputChange('nombres', e.target.value)}
                  disabled={!isEditing}
                  className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''}`}
                />
              </div>
              <div>
                <Label>Apellidos</Label>
                <Input
                  value={isEditing ? (formData.apellidos || '') : (patient.apellidos || 'N/A')}
                  onChange={(e) => handleInputChange('apellidos', e.target.value)}
                  disabled={!isEditing}
                  className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>RUT</Label>
                <Input
                  value={isEditing ? (formData.rut || '') : (patient.rut || 'N/A')}
                  onChange={(e) => handleInputChange('rut', e.target.value)}
                  disabled={!isEditing}
                  className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''}`}
                />
              </div>
              <div>
                <Label>Fecha de Nacimiento</Label>
                <Input
                  type={isEditing ? "date" : "text"}
                  value={isEditing ? (formData.fechaNacimiento ? new Date(formData.fechaNacimiento).toISOString().split('T')[0] : '') : formatDate(patient.fechaNacimiento)}
                  onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                  disabled={!isEditing}
                  className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Edad</Label>
                <Input
                  value={calculateAge(patient.fechaNacimiento)}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div>
                <Label>Sexo</Label>
                <Input
                  value={isEditing ? (formData.sexo || '') : (patient.sexo || 'N/A')}
                  onChange={(e) => handleInputChange('sexo', e.target.value)}
                  disabled={!isEditing}
                  className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección 2: Información de Contacto */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-[#04BFAD] font-semibold">Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  value={isEditing ? (formData.email || '') : (patient.email || 'N/A')}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''}`}
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={isEditing ? (formData.telefono || formData.telefonoNumero || '') : (patient.telefono || patient.telefonoNumero || 'N/A')}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  disabled={!isEditing}
                  className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Región</Label>
                <Input
                  value={isEditing ? (formData.region || '') : (patient.region || 'N/A')}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  disabled={!isEditing}
                  className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''}`}
                />
              </div>
              <div>
                <Label>Comuna</Label>
                <Input
                  value={isEditing ? (formData.comuna || '') : (patient.comuna || 'N/A')}
                  onChange={(e) => handleInputChange('comuna', e.target.value)}
                  disabled={!isEditing}
                  className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''}`}
                />
              </div>
            </div>

            <div>
              <Label>Dirección</Label>
              <Input
                value={isEditing ? (formData.direccion || '') : (patient.direccion || 'N/A')}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                disabled={!isEditing}
                className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sección 3: Información Médica */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-[#04BFAD] font-semibold">Información Médica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Condición Principal</Label>
              <Input
                value={isEditing ? (formData.condicionPrincipal || '') : (patient.condicionPrincipal || 'N/A')}
                onChange={(e) => handleInputChange('condicionPrincipal', e.target.value)}
                disabled={!isEditing}
                className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''}`}
              />
            </div>

            <div>
              <Label>Descripción de la Condición</Label>
              <Textarea
                value={isEditing ? (formData.descripcionCondicion || '') : (patient.descripcionCondicion || 'N/A')}
                onChange={(e) => handleInputChange('descripcionCondicion', e.target.value)}
                disabled={!isEditing}
                rows={3}
                className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''}`}
              />
            </div>

            <div>
              <Label>Medicamentos Actuales</Label>
              <Textarea
                value={isEditing ? (formData.medicamentosActuales || '') : (patient.medicamentosActuales || 'N/A')}
                onChange={(e) => handleInputChange('medicamentosActuales', e.target.value)}
                disabled={!isEditing}
                rows={3}
                className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''}`}
              />
            </div>

            <div>
              <Label>Alergias</Label>
              <Textarea
                value={isEditing ? (formData.alergias || '') : (patient.alergias || 'N/A')}
                onChange={(e) => handleInputChange('alergias', e.target.value)}
                disabled={!isEditing}
                rows={2}
                className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''}`}
              />
            </div>

            <div>
              <Label>Cirugías Previas</Label>
              <Textarea
                value={isEditing ? (formData.cirugiasPrevias || '') : (patient.cirugiasPrevias || 'N/A')}
                onChange={(e) => handleInputChange('cirugiasPrevias', e.target.value)}
                disabled={!isEditing}
                rows={2}
                className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sección 4: Estado y Ensayo */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-[#04BFAD] font-semibold">Estado y Asignación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Estado</Label>
                <div className="mt-2">
                  <Badge
                    className={
                      patient.status === 'VERIFIED'
                        ? 'bg-green-100 text-green-700'
                        : patient.status === 'STUDY_ASSIGNED'
                        ? 'bg-indigo-100 text-indigo-700'
                        : patient.status === 'AWAITING_STUDY'
                        ? 'bg-yellow-100 text-yellow-700'
                        : patient.status === 'PENDING_CONTACT'
                        ? 'bg-orange-100 text-orange-700'
                        : patient.status === 'DISCARDED'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-[#dfe3e3] text-[#044c64]'
                    }
                  >
                    {statusLabels[patient.status || 'RECEIVED'] || patient.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Ensayo Asignado</Label>
                <Input
                  value={patient.trial?.title || 'Sin asignar'}
                  disabled={true}
                  className="mt-1 bg-gray-50"
                />
              </div>
            </div>

            <div>
              <Label>Fecha de Registro</Label>
              <Input
                value={formatDate(patient.createdAt)}
                disabled={true}
                className="mt-1 bg-gray-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sección 5: Consentimiento Informado */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-[#04BFAD] font-semibold">Consentimiento Informado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Aceptó Términos y Condiciones</Label>
                <Input
                  value={patient.aceptaTerminos ? '✅ Sí' : '❌ No'}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div>
                <Label>Aceptó Política de Privacidad</Label>
                <Input
                  value={patient.aceptaPrivacidad ? '✅ Sí' : '❌ No'}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
            </div>
            <div>
              <Label>Consentimiento de Almacenamiento</Label>
              <Input
                value={patient.aceptaAlmacenamiento15Anos ? '✅ Sí (15 años)' : '❌ No'}
                disabled
                className="mt-1 bg-gray-50"
              />
              {patient.aceptaAlmacenamiento15Anos && (
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Consentimiento válido por una duración de 15 años después del registro.</strong>
                </p>
              )}
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
          <Button
            type="button"
            style={{ background: 'linear-gradient(to right, #04bcbc, #346c84)' }}
            className="text-white hover:opacity-90 transition-opacity"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el registro de{' '}
              <strong>{patient.nombres} {patient.apellidos}</strong> del sistema.
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
