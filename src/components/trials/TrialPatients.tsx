/**
 * Componente para gestionar pacientes postulados a un ensayo
 * 
 * Muestra:
 * - Lista de pacientes postulados
 * - Filtros por estado y búsqueda
 * - Detalles de cada paciente
 * - Acciones (ver detalles, contactar)
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import type { PatientIntake } from '../../lib/api';
import { getPatientIntakesByTrial } from '../../lib/api';
import {
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Eye,
  Download,
  Filter,
  RefreshCw,
} from 'lucide-react';

interface TrialPatientsProps {
  trialId: string;
}

export function TrialPatients({ trialId }: TrialPatientsProps) {
  const [patients, setPatients] = useState<PatientIntake[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientIntake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientIntake | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadPatients();
  }, [trialId]);

  useEffect(() => {
    filterPatients();
  }, [patients, searchQuery]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPatientIntakesByTrial(trialId);
      setPatients(data);
    } catch (err: any) {
      console.error('Error cargando pacientes:', err);
      setError('No se pudieron cargar los pacientes. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (fechaNacimiento: string | undefined): number | null => {
    if (!fechaNacimiento) return null;
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filterPatients = () => {
    if (!searchQuery.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = patients.filter((patient) => {
      const fullName = `${patient.nombres} ${patient.apellidos}`.toLowerCase();
      const rut = patient.rut?.toLowerCase() || '';
      const email = patient.email?.toLowerCase() || '';
      const phone = patient.telefono?.toLowerCase() || '';
      const comuna = patient.comuna?.toLowerCase() || '';

      return (
        fullName.includes(query) ||
        rut.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        comuna.includes(query)
      );
    });

    setFilteredPatients(filtered);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewDetails = (patient: PatientIntake) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
  };

  const handleExport = () => {
    // Preparar datos para CSV
    const csvData = filteredPatients.map((p) => ({
      Nombre: `${p.nombres} ${p.apellidos}`,
      RUT: p.rut || '',
      Email: p.email || '',
      Teléfono: p.telefono || '',
      Edad: calculateAge(p.fechaNacimiento) || '',
      Comuna: p.comuna || '',
      Región: p.region || '',
      'Fecha Postulación': formatDate(p.createdAt),
    }));

    // Convertir a CSV
    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map((row) => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    // Descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pacientes_ensayo_${trialId}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pacientes Postulados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Cargando pacientes...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pacientes Postulados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-4">
            {error}
          </div>
          <Button onClick={loadPatients} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Pacientes Postulados
              </CardTitle>
              <CardDescription>
                {patients.length} {patients.length === 1 ? 'paciente postulado' : 'pacientes postulados'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadPatients}
                disabled={loading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar
              </Button>
              {filteredPatients.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de búsqueda */}
          {patients.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, RUT, email o teléfono..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Tabla de pacientes */}
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {patients.length === 0 ? (
                <>
                  <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No hay pacientes postulados aún</p>
                  <p className="text-sm mt-1">
                    Los pacientes que se postulen a este ensayo aparecerán aquí
                  </p>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No se encontraron resultados</p>
                  <p className="text-sm mt-1">
                    Intenta con otros términos de búsqueda
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Vigencia</TableHead>
                    <TableHead>Comuna</TableHead>
                    <TableHead>Fecha Postulación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {patient.nombres} {patient.apellidos}
                            </p>
                            {patient.rut && (
                              <p className="text-sm text-gray-500">
                                RUT: {patient.rut}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {patient.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{patient.email}</span>
                            </div>
                          )}
                          {patient.telefono && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{patient.telefono}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {calculateAge(patient.fechaNacimiento) ? `${calculateAge(patient.fechaNacimiento)} años` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {patient.aceptaAlmacenamiento15Anos ? (
                          <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
                            15 años
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                            Estándar
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {patient.comuna && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span>{patient.comuna}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span>{formatDate(patient.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(patient)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalles del Paciente */}
      {showDetailsModal && selectedPatient && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedPatient.nombres} {selectedPatient.apellidos}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Postulación del {formatDate(selectedPatient.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información Personal */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">RUT</p>
                    <p className="font-medium">{selectedPatient.rut || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Edad</p>
                    <p className="font-medium">
                      {calculateAge(selectedPatient.fechaNacimiento) ? `${calculateAge(selectedPatient.fechaNacimiento)} años` : 'No especificada'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Género</p>
                    <p className="font-medium">{selectedPatient.sexo || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Comuna</p>
                    <p className="font-medium">{selectedPatient.comuna || 'No especificada'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Región</p>
                    <p className="font-medium">{selectedPatient.region || 'No especificada'}</p>
                    {selectedPatient.aceptaAlmacenamiento15Anos ? (
                      <Badge variant="secondary" className="bg-green-50 text-green-700">
                        ✓ Acepta almacenamiento por 15 años
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        ✗ No acepta almacenamiento
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-1 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedPatient.email || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{selectedPatient.telefono || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dirección</p>
                    <p className="font-medium">{selectedPatient.direccion || 'No especificada'}</p>
                  </div>
                </div>
              </div>

              {/* Información Médica */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Información Médica
                </h3>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Condición Principal</p>
                    <p className="font-medium">{selectedPatient.condicionPrincipal || 'No especificada'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Descripción de la Condición</p>
                    <p className="font-medium">{selectedPatient.descripcionCondicion || 'No especificada'}</p>
                  </div>
                  {selectedPatient.medicamentosActuales && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Medicamentos Actuales</p>
                      <p className="font-medium">{selectedPatient.medicamentosActuales}</p>
                    </div>
                  )}
                  {selectedPatient.alergias && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Alergias</p>
                      <p className="font-medium">{selectedPatient.alergias}</p>
                    </div>
                  )}
                  {selectedPatient.cirugiasPrevias && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Cirugías Previas</p>
                      <p className="font-medium">{selectedPatient.cirugiasPrevias}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Consentimientos */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Consentimientos</h3>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    {selectedPatient.aceptaTerminos ? (
                      <Badge variant="secondary" className="bg-green-50 text-green-700">
                        ✓ Acepta términos y condiciones
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        ✗ No acepta términos
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedPatient.aceptaPrivacidad ? (
                      <Badge variant="secondary" className="bg-green-50 text-green-700">
                        ✓ Acepta política de privacidad
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        ✗ No acepta privacidad
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  if (selectedPatient.email) {
                    window.location.href = `mailto:${selectedPatient.email}`;
                  }
                }}
                disabled={!selectedPatient.email}
              >
                <Mail className="mr-2 h-4 w-4" />
                Contactar por Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
