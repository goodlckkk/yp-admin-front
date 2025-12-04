/**
 * Modal para agregar una nueva institución/sitio de investigación
 * 
 * Características:
 * - Formulario con nombre, región, comuna, dirección
 * - Validación de campos requeridos
 * - Callback onSuccess para actualizar la lista
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { createResearchSite, type CreateResearchSitePayload } from '../../lib/api';

// Regiones de Chile
const REGIONES_CHILE = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana de Santiago",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes"
];

interface AddInstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSite: any) => void;
  initialName?: string;
}

export function AddInstitutionModal({ isOpen, onClose, onSuccess, initialName = '' }: AddInstitutionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateResearchSitePayload>({
    nombre: initialName,
    region: '',
    comuna: '',
    direccion: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newSite = await createResearchSite(formData);
      // Reset form
      setFormData({ nombre: '', region: '', comuna: '', direccion: '' });
      onSuccess(newSite);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear la institución');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#04BFAD]">Agregar Nueva Institución</DialogTitle>
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
                onValueChange={(value) => setFormData({ ...formData, region: value })}
                disabled={loading}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar región" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONES_CHILE.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="comuna">Comuna *</Label>
              <Input
                id="comuna"
                value={formData.comuna}
                onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                placeholder="Ej: Santiago"
                required
                disabled={loading}
                className="mt-1"
              />
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
              {loading ? 'Guardando...' : 'Guardar Institución'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
