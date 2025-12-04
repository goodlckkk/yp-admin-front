/**
 * Modal para agregar un nuevo patrocinador/sponsor
 * 
 * Características:
 * - Formulario con nombre, tipo (SPONSOR/CRO)
 * - Validación de campos requeridos
 * - Callback onSuccess para actualizar la lista
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { createSponsor } from '../../lib/api';

interface AddSponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSponsor: any) => void;
  initialName?: string;
}

export function AddSponsorModal({ isOpen, onClose, onSuccess, initialName = '' }: AddSponsorModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: initialName,
    description: '',
    web_site: '',
    sponsor_type: 'SPONSOR' as 'SPONSOR' | 'CRO',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Preparar payload: convertir strings vacíos a undefined para campos opcionales
      const payload = {
        name: formData.name,
        description: formData.description.trim() || undefined,
        web_site: formData.web_site.trim() || undefined,
        sponsor_type: formData.sponsor_type,
      };
      
      const newSponsor = await createSponsor(payload);
      // Reset form
      setFormData({ name: '', description: '', web_site: '', sponsor_type: 'SPONSOR' });
      onSuccess(newSponsor);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear el patrocinador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#04BFAD]">Agregar Nuevo Patrocinador</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre del Patrocinador *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Pfizer Inc."
              required
              disabled={loading}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="sponsor_type">Tipo *</Label>
            <Select
              value={formData.sponsor_type}
              onValueChange={(value: 'SPONSOR' | 'CRO') => setFormData({ ...formData, sponsor_type: value })}
              disabled={loading}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SPONSOR">Patrocinador</SelectItem>
                <SelectItem value="CRO">CRO (Organización de Investigación por Contrato)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="web_site">Sitio Web (Opcional)</Label>
            <Input
              id="web_site"
              value={formData.web_site}
              onChange={(e) => setFormData({ ...formData, web_site: e.target.value })}
              placeholder="https://www.ejemplo.com"
              disabled={loading}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Breve descripción del patrocinador"
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
              {loading ? 'Guardando...' : 'Guardar Patrocinador'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
