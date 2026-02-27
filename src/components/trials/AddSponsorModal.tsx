/**
 * Modal para agregar o editar un patrocinador/sponsor
 * 
 * Características:
 * - Formulario con nombre, tipo (SPONSOR/CRO)
 * - Validación de campos requeridos
 * - Modo edición cuando se pasa sponsorId
 * - Historial de cambios visible para ADMIN
 * - Callback onSuccess para actualizar la lista
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { createSponsor, getSponsor, updateSponsor } from '../../lib/api';
import { ChangeHistory } from '../ui/ChangeHistory';

interface AddSponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSponsor: any) => void;
  initialName?: string;
  sponsorId?: string | null;
  userRole?: string | null;
}

export function AddSponsorModal({ isOpen, onClose, onSuccess, initialName = '', sponsorId = null, userRole }: AddSponsorModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: initialName,
    description: '',
    web_site: '',
    sponsor_type: 'SPONSOR' as 'SPONSOR' | 'CRO',
  });

  // Cargar datos del sponsor si estamos editando
  useEffect(() => {
    if (isOpen && sponsorId) {
      setLoading(true);
      setError(null);
      getSponsor(sponsorId)
        .then((sponsor) => {
          setFormData({
            name: sponsor.name,
            description: sponsor.description || '',
            web_site: sponsor.web_site || '',
            sponsor_type: sponsor.sponsor_type || 'SPONSOR',
          });
        })
        .catch((err) => {
          setError('Error al cargar los datos del patrocinador');
          console.error(err);
        })
        .finally(() => setLoading(false));
    } else if (isOpen && !sponsorId) {
      // Reset form para nuevo sponsor
      setFormData({
        name: initialName,
        description: '',
        web_site: '',
        sponsor_type: 'SPONSOR',
      });
      setError(null);
    }
  }, [isOpen, sponsorId, initialName]);

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

      let result;
      if (sponsorId) {
        // Actualizar sponsor existente
        result = await updateSponsor(sponsorId, payload);
      } else {
        // Crear nuevo sponsor
        result = await createSponsor(payload);
      }
      // Reset form
      setFormData({ name: '', description: '', web_site: '', sponsor_type: 'SPONSOR' });
      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err.message || `Error al ${sponsorId ? 'actualizar' : 'crear'} el patrocinador`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#04BFAD]">
            {sponsorId ? 'Editar Patrocinador' : 'Agregar Nuevo Patrocinador'}
          </DialogTitle>
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

          {/* Historial de Cambios - Solo visible para ADMIN en modo edición */}
          {userRole === 'ADMIN' && sponsorId && (
            <ChangeHistory entityName="Sponsor" entityId={sponsorId} />
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
              {loading ? 'Guardando...' : (sponsorId ? 'Actualizar Patrocinador' : 'Guardar Patrocinador')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
