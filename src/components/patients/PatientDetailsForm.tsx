/**
 * PatientDetailsForm.tsx
 * 
 * Formulario de visualización y edición de detalles de pacientes
 * - Muestra toda la información del paciente
 * - Campos deshabilitados para solo lectura
 * - Opción para eliminar paciente
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
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
    REVIEWING: 'En Revisión',
    CONTACTED: 'Contactado',
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
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900"
        >
          ✕ Cerrar
        </Button>
      </div>

      {/* Formulario de solo lectura */}
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

        {/* Sección 3: Información Médica */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-[#04BFAD] font-semibold">Información Médica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Condición Principal</Label>
              <Input
                value={patient.condicionPrincipal || 'N/A'}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>

            <div>
              <Label>Descripción de la Condición</Label>
              <Textarea
                value={patient.descripcionCondicion || 'N/A'}
                disabled
                rows={3}
                className="mt-1 bg-gray-50"
              />
            </div>

            <div>
              <Label>Medicamentos Actuales</Label>
              <Textarea
                value={patient.medicamentosActuales || 'N/A'}
                disabled
                rows={3}
                className="mt-1 bg-gray-50"
              />
            </div>

            <div>
              <Label>Alergias</Label>
              <Textarea
                value={patient.alergias || 'N/A'}
                disabled
                rows={2}
                className="mt-1 bg-gray-50"
              />
            </div>

            <div>
              <Label>Cirugías Previas</Label>
              <Textarea
                value={patient.cirugiasPrevias || 'N/A'}
                disabled
                rows={2}
                className="mt-1 bg-gray-50"
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
                      patient.status === 'CONTACTED'
                        ? 'bg-green-100 text-green-700'
                        : patient.status === 'REVIEWING'
                        ? 'bg-yellow-100 text-yellow-700'
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
                  disabled
                  className="mt-1 bg-gray-50"
                />
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
