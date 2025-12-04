/**
 * PatientEditForm.tsx
 * 
 * Formulario de edición de pacientes
 * - Permite editar información médica
 * - Permite cambiar el estado del paciente
 * - Muestra el ensayo asignado
 * - Campos personales en solo lectura
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TrialSuggestions } from './TrialSuggestions';
import type { PatientIntake } from '../../lib/api';
import { fetchWithAuth } from '../../lib/api';
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

interface PatientEditFormProps {
  patient: PatientIntake | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Estados disponibles para el paciente
const PATIENT_STATUSES = [
  { value: 'RECEIVED', label: 'Recibido', color: 'bg-[#dfe3e3] text-[#044c64]' },
  { value: 'REVIEWING', label: 'En Revisión', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'CONTACTED', label: 'Contactado', color: 'bg-green-100 text-green-700' },
  { value: 'DISCARDED', label: 'Descartado', color: 'bg-rose-100 text-rose-700' },
];

export function PatientEditForm({ patient, isOpen, onClose, onSuccess }: PatientEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Estado del formulario editable
  const [formData, setFormData] = useState({
    condicionPrincipal: '',
    descripcionCondicion: '',
    medicamentosActuales: '',
    alergias: '',
    cirugiasPrevias: '',
    status: 'RECEIVED',
  });

  // Cargar datos del paciente cuando cambia
  useEffect(() => {
    if (patient && isOpen) {
      setFormData({
        condicionPrincipal: patient.condicionPrincipal || '',
        descripcionCondicion: patient.descripcionCondicion || '',
        medicamentosActuales: patient.medicamentosActuales || '',
        alergias: patient.alergias || '',
        cirugiasPrevias: patient.cirugiasPrevias || '',
        status: patient.status || 'RECEIVED',
      });
    }
  }, [patient, isOpen]);

  // Si no está abierto o no hay paciente, no renderizar nada
  if (!isOpen || !patient) return null;

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

  // Guardar cambios
  const handleSave = async () => {
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
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900"
        >
          ✕ Cerrar
        </Button>
      </div>

      {/* Formulario */}
      <div className="space-y-6">
        {/* Sección 1: Información Personal (Solo lectura) */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-[#024959] font-semibold">Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombres</Label>
                <Input
                  value={patient.nombres || 'N/A'}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div>
                <Label>Apellidos</Label>
                <Input
                  value={patient.apellidos || 'N/A'}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>RUT</Label>
                <Input
                  value={patient.rut || 'N/A'}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div>
                <Label>Fecha de Nacimiento</Label>
                <Input
                  value={formatDate(patient.fechaNacimiento)}
                  disabled
                  className="mt-1 bg-gray-50"
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
                  value={patient.sexo || 'N/A'}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección 2: Información de Contacto (Solo lectura) */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-[#024959] font-semibold">Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  value={patient.email || 'N/A'}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={patient.telefono || 'N/A'}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Región</Label>
                <Input
                  value={patient.region || 'N/A'}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div>
                <Label>Comuna</Label>
                <Input
                  value={patient.comuna || 'N/A'}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
            </div>

            <div>
              <Label>Dirección</Label>
              <Input
                value={patient.direccion || 'N/A'}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sección 3: Información Médica (EDITABLE) */}
        <Card className="border border-[#04BFAD]">
          <CardHeader className="bg-[#A7F2EB]/10">
            <CardTitle className="text-lg text-[#024959] font-semibold flex items-center gap-2">
              <span>📋</span> Información Médica (Editable)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            <div>
              <Label htmlFor="condicionPrincipal">Condición Principal *</Label>
              <Input
                id="condicionPrincipal"
                value={formData.condicionPrincipal}
                onChange={(e) => setFormData({ ...formData, condicionPrincipal: e.target.value })}
                placeholder="Ej: Diabetes tipo 2"
                className="mt-1"
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

            <div>
              <Label htmlFor="medicamentosActuales">Medicamentos Actuales</Label>
              <Textarea
                id="medicamentosActuales"
                value={formData.medicamentosActuales}
                onChange={(e) => setFormData({ ...formData, medicamentosActuales: e.target.value })}
                placeholder="Lista de medicamentos que el paciente está tomando actualmente..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="alergias">Alergias</Label>
              <Textarea
                id="alergias"
                value={formData.alergias}
                onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                placeholder="Alergias conocidas del paciente..."
                rows={2}
                className="mt-1"
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
              <span>🎯</span> Estado y Asignación (Editable)
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
                value={formatDate(patient.createdAt)}
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
