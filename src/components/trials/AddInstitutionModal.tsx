/**
 * Modal para agregar una nueva institución/sitio de investigación
 * 
 * Características:
 * - Formulario con nombre, región, comuna, dirección
 * - Validación de campos requeridos
 * - Callback onSuccess para actualizar la lista
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { createResearchSite, updateResearchSite, getResearchSite, createUser, getUserByInstitution, UserRole, type CreateResearchSitePayload, type User } from '../../lib/api';
import { Eye, EyeOff } from 'lucide-react';
import { regionesChile, getComunasByRegion } from '../../lib/regiones-comunas';

// Las regiones y comunas ahora se importan desde el archivo compartido

interface AddInstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSite: any) => void;
  initialName?: string;
  siteId?: string | null; // ID del sitio a editar
}

export function AddInstitutionModal({ isOpen, onClose, onSuccess, initialName = '', siteId = null }: AddInstitutionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateResearchSitePayload>({
    nombre: initialName,
    region: '',
    comuna: '',
    direccion: '',
  });

  // Estado para creación de usuario
  const [createUserAccount, setCreateUserAccount] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estado para usuario existente vinculado a la institución
  const [existingUser, setExistingUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Cargar datos del sitio si estamos editando
  useEffect(() => {
    if (isOpen && siteId) {
      setLoading(true);
      setExistingUser(null);
      setCreateUserAccount(false);
      setUserEmail('');
      setUserPassword('');
      setSuccessMessage(null);
      setError(null);

      // Cargar datos del sitio y verificar si tiene usuario vinculado en paralelo
      Promise.all([
        getResearchSite(siteId),
        getUserByInstitution(siteId),
      ])
        .then(([site, user]) => {
          setFormData({
            nombre: site.nombre,
            region: site.region || '',
            comuna: site.comuna || '',
            direccion: site.direccion || '',
            ciudad: site.ciudad || '',
            telefono: site.telefono || '',
            email: site.email || '',
            sitio_web: site.sitio_web || '',
            descripcion: site.descripcion || '',
          });
          setExistingUser(user);
        })
        .catch((err) => {
          setError('Error al cargar los datos del sitio');
          console.error(err);
        })
        .finally(() => setLoading(false));
    } else if (isOpen && !siteId) {
      // Reset form para nuevo sitio
      setFormData({
        nombre: initialName,
        region: '',
        comuna: '',
        direccion: '',
      });
      setExistingUser(null);
      setCreateUserAccount(false);
      setUserEmail('');
      setUserPassword('');
      setSuccessMessage(null);
      setError(null);
    }
  }, [isOpen, siteId, initialName]);

  // Limpiar campos vacíos del payload para evitar errores de validación (email, sitio_web, etc.)
  const cleanPayload = (data: CreateResearchSitePayload): CreateResearchSitePayload => {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== '' && value !== undefined && value !== null) {
        cleaned[key] = value;
      }
    }
    return cleaned as CreateResearchSitePayload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = cleanPayload(formData);
      let result;
      if (siteId) {
        // Actualizar sitio existente
        result = await updateResearchSite(siteId, payload);
      } else {
        // Crear nuevo sitio
        result = await createResearchSite(payload);
      }

      // Crear usuario asociado si se solicitó (al crear nueva institución O al editar una sin usuario)
      if (createUserAccount && userEmail && userPassword && !existingUser) {
        try {
          await createUser({
            fullName: formData.nombre,
            email: userEmail,
            role: UserRole.INSTITUTION,
            institutionId: result.id || siteId || undefined,
            password: userPassword,
          });
          setSuccessMessage(siteId 
            ? 'Institución actualizada y usuario creado exitosamente.' 
            : 'Institución y usuario creados exitosamente.');
        } catch (userErr: any) {
          setError(`Institución ${siteId ? 'actualizada' : 'creada'} exitosamente, pero hubo un error al crear el usuario: ${userErr.message}`);
          onSuccess(result);
          return;
        }
      }
      
      // Reset form
      setFormData({ nombre: '', region: '', comuna: '', direccion: '' });
      setCreateUserAccount(false);
      setUserEmail('');
      setUserPassword('');
      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err.message || `Error al ${siteId ? 'actualizar' : 'crear'} la institución`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#04BFAD]">
            {siteId ? 'Editar Institución' : 'Agregar Nueva Institución'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre de la Institución *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Clínica Vanguardia"
              required
              disabled={loading}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="region">Región *</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => {
                  setFormData({ ...formData, region: value, comuna: '' }); // Limpiar comuna al cambiar región
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
                onValueChange={(value) => setFormData({ ...formData, comuna: value })}
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
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              placeholder="Ej: Av. Providencia 1234"
              disabled={loading}
              className="mt-1"
            />
          </div>

          {/* Sección de cuenta de usuario vinculada */}
          <div className="border-t pt-4 mt-4">
            {/* Si ya tiene usuario vinculado, mostrar info */}
            {existingUser ? (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-800 mb-1">✓ Esta institución tiene una cuenta de usuario</p>
                <p className="text-sm text-green-700">Correo: <span className="font-medium">{existingUser.email}</span></p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="createUser"
                    checked={createUserAccount}
                    onChange={(e) => setCreateUserAccount(e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 rounded border-gray-300 text-[#04BFAD] focus:ring-[#04BFAD]"
                  />
                  <Label htmlFor="createUser" className="text-sm font-semibold text-[#024959] cursor-pointer">
                    {siteId ? 'Crear cuenta de usuario para esta institución' : 'Crear cuenta de usuario para esta institución'}
                  </Label>
                </div>
                {siteId && (
                  <p className="text-xs text-amber-600 mb-3 flex items-center gap-1">
                    <span>⚠️</span> Esta institución aún no tiene un usuario vinculado. Active la opción para crear uno.
                  </p>
                )}
                <p className="text-xs text-gray-500 mb-3">
                  Al activar esta opción, se creará un usuario con rol "Institución" que podrá acceder al dashboard con permisos limitados (solo ver sus pacientes y solicitar estudios).
                </p>

                {createUserAccount && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <Label htmlFor="userEmail">Correo electrónico del usuario *</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="correo@institucion.cl"
                        required={createUserAccount}
                        disabled={loading}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="userPassword">Contraseña *</Label>
                      <div className="relative mt-1">
                        <Input
                          id="userPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          required={createUserAccount}
                          minLength={6}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">La institución usará este correo y contraseña para iniciar sesión en el dashboard.</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#04BFAD] hover:bg-[#024959] text-white"
            >
              {loading ? 'Guardando...' : (siteId ? 'Actualizar Institución' : 'Guardar Institución')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
