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
import { createResearchSite, updateResearchSite, getResearchSite, type CreateResearchSitePayload } from '../../lib/api';
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
  const [formData, setFormData] = useState<CreateResearchSitePayload>({
    nombre: initialName,
    region: '',
    comuna: '',
    direccion: '',
  });

  // Cargar datos del sitio si estamos editando
  useEffect(() => {
    if (isOpen && siteId) {
      setLoading(true);
      getResearchSite(siteId)
        .then((site) => {
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
    }
  }, [isOpen, siteId, initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (siteId) {
        // Actualizar sitio existente
        result = await updateResearchSite(siteId, formData);
      } else {
        // Crear nuevo sitio
        result = await createResearchSite(formData);
      }
      
      // Reset form
      setFormData({ nombre: '', region: '', comuna: '', direccion: '' });
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
