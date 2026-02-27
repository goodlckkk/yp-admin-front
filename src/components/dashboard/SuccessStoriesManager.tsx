/**
 * Componente SuccessStoriesManager - Gestor de Historias de Éxito
 * 
 * Permite a los administradores gestionar las historias inspiradoras que se muestran
 * en la página de inicio. Incluye funcionalidades de CRUD completo y validación de imágenes.
 */

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { Icons } from '../ui/icons';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { useToast } from '../../hooks/useToast';

interface SuccessStory {
  id: string;
  imageUrl: string;
  patientName: string | null;
  condition: string | null;
  story: string;
  quote: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  imageUrl: string;
  patientName: string;
  condition: string;
  story: string;
  quote: string;
  isActive: boolean;
}

export default function SuccessStoriesManager() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    imageUrl: '',
    patientName: '',
    condition: '',
    story: '',
    quote: '',
    isActive: true,
  });

  /**
   * Cargar historias al montar el componente
   */
  useEffect(() => {
    fetchStories();
  }, []);

  /**
   * Obtener todas las historias desde la API
   */
  const fetchStories = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/success-stories') as SuccessStory[];
      setStories(data);
    } catch (error) {
      console.error('Error al cargar historias:', error);
      showToast('Error al cargar las historias', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validar imagen antes de subirla
   */
  const validateImage = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      return 'Solo se permiten imágenes JPG, PNG o WebP';
    }

    if (file.size > maxSize) {
      return 'La imagen no debe superar los 2MB';
    }

    return null;
  };

  /**
   * Manejar selección de imagen
   */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImage(file);
    if (error) {
      showToast(error, 'error');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Subir imagen a Cloudinary
   */
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'yoparticipo_stories');
    formData.append('folder', 'yoparticipo/success-stories');

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dkr62nbmh/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Error al subir imagen');
    }

    const data = await response.json();
    return data.secure_url;
  };

  /**
   * Guardar historia (crear o actualizar)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = formData.imageUrl;

      // Si hay una nueva imagen, subirla primero
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Validar campos obligatorios
      if (!imageUrl || !formData.story.trim()) {
        showToast('La imagen y la historia son obligatorias', 'error');
        setUploading(false);
        return;
      }

      const payload = {
        imageUrl,
        patientName: formData.patientName.trim() || null,
        condition: formData.condition.trim() || null,
        story: formData.story.trim(),
        quote: formData.quote.trim() || null,
        isActive: formData.isActive,
        order: editingStory ? editingStory.order : stories.length,
      };

      const url = editingStory 
        ? `/success-stories/${editingStory.id}`
        : '/success-stories';
      
      const method = editingStory ? 'PATCH' : 'POST';

      await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      showToast(
        editingStory ? 'Historia actualizada correctamente' : 'Historia creada correctamente',
        'success'
      );

      await fetchStories();
      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar historia:', error);
      showToast('Error al guardar la historia', 'error');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Eliminar historia
   */
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta historia?')) return;

    try {
      await fetchWithAuth(`/success-stories/${id}`, {
        method: 'DELETE',
      });

      showToast('Historia eliminada correctamente', 'success');
      await fetchStories();
    } catch (error) {
      console.error('Error al eliminar historia:', error);
      showToast('Error al eliminar la historia', 'error');
    }
  };

  /**
   * Activar/desactivar historia
   */
  const handleToggleActive = async (story: SuccessStory) => {
    try {
      await fetchWithAuth(`/success-stories/${story.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !story.isActive }),
      });

      showToast('Estado actualizado correctamente', 'success');
      await fetchStories();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      showToast('Error al actualizar el estado', 'error');
    }
  };

  /**
   * Abrir dialog para crear
   */
  const handleOpenCreate = () => {
    setEditingStory(null);
    setFormData({
      imageUrl: '',
      patientName: '',
      condition: '',
      story: '',
      quote: '',
      isActive: true,
    });
    setImageFile(null);
    setImagePreview('');
    setDialogOpen(true);
  };

  /**
   * Abrir dialog para editar
   */
  const handleOpenEdit = (story: SuccessStory) => {
    setEditingStory(story);
    setFormData({
      imageUrl: story.imageUrl,
      patientName: story.patientName || '',
      condition: story.condition || '',
      story: story.story,
      quote: story.quote || '',
      isActive: story.isActive,
    });
    setImageFile(null);
    setImagePreview(story.imageUrl);
    setDialogOpen(true);
  };

  /**
   * Cerrar dialog
   */
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStory(null);
    setImageFile(null);
    setImagePreview('');
    setFormData({
      imageUrl: '',
      patientName: '',
      condition: '',
      story: '',
      quote: '',
      isActive: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icons.Spinner className="h-8 w-8 animate-spin text-[#04BFAD]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#024959]">Historias que Inspiran</h2>
          <p className="text-[#4D4D59] mt-1">
            Gestiona las historias de éxito que se muestran en la página principal
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-[#04BFAD] hover:bg-[#024959] text-white"
        >
          Nueva Historia
        </Button>
      </div>

      {/* Especificaciones de imagen */}
      <Card className="border-[#A7F2EB]/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icons.Image className="h-5 w-5 text-[#04BFAD]" />
            Especificaciones de Imagen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[#4D4D59]">
            <div>
              <strong>Formatos:</strong> JPG, PNG, WebP
            </div>
            <div>
              <strong>Tamaño máximo:</strong> 2MB
            </div>
            <div>
              <strong>Recomendación:</strong> 800x800px (cuadrada)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de historias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <Card key={story.id} className="overflow-hidden border-[#A7F2EB]/30 hover:border-[#04BFAD]/50 transition-colors">
            <div className="relative h-48 bg-gray-100">
              <img
                src={story.imageUrl}
                alt={story.patientName || 'Historia'}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant={story.isActive ? 'default' : 'secondary'} className={story.isActive ? 'bg-green-500' : ''}>
                  {story.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-lg text-[#024959]">
                {story.patientName || 'Anónimo'}
              </CardTitle>
              {story.condition && (
                <CardDescription className="text-[#4D4D59]">
                  {story.condition}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#4D4D59] line-clamp-3 mb-4">
                {story.story}
              </p>
              {story.quote && (
                <blockquote className="text-sm italic text-[#024959] border-l-4 border-[#04BFAD] pl-3 mb-4">
                  "{story.quote}"
                </blockquote>
              )}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={story.isActive}
                    onCheckedChange={() => handleToggleActive(story)}
                  />
                  <span className="text-sm text-[#4D4D59]">
                    {story.isActive ? 'Visible' : 'Oculta'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEdit(story)}
                    className="border-[#04BFAD] text-[#04BFAD] hover:bg-[#04BFAD] hover:text-white"
                  >
                    <Icons.Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(story.id)}
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Icons.Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mensaje si no hay historias */}
      {stories.length === 0 && (
        <Card className="border-dashed border-2 border-[#A7F2EB]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.Image className="h-16 w-16 text-[#A7F2EB] mb-4" />
            <p className="text-[#4D4D59] text-center mb-4">
              No hay historias creadas aún
            </p>
            <Button
              onClick={handleOpenCreate}
              className="bg-[#04BFAD] hover:bg-[#024959] text-white"
            >
              Crear Primera Historia
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog para crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#024959]">
              {editingStory ? 'Editar Historia' : 'Nueva Historia'}
            </DialogTitle>
            <DialogDescription>
              {editingStory 
                ? 'Modifica los datos de la historia de éxito'
                : 'Crea una nueva historia inspiradora para mostrar en el home'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Imagen */}
            <div className="space-y-2">
              <Label htmlFor="image">
                Imagen <span className="text-red-500">*</span>
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageSelect}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-2 relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-xs text-[#4D4D59]">
                JPG, PNG o WebP - Máx 2MB - Recomendado: 800x800px
              </p>
            </div>

            {/* Nombre del paciente */}
            <div className="space-y-2">
              <Label htmlFor="patientName">Nombre del Paciente (opcional)</Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                placeholder="Ej: María González (puede dejarse en blanco para anónimo)"
                maxLength={200}
              />
            </div>

            {/* Condición */}
            <div className="space-y-2">
              <Label htmlFor="condition">Condición Médica (opcional)</Label>
              <Input
                id="condition"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                placeholder="Ej: Diabetes Tipo 2"
                maxLength={200}
              />
            </div>

            {/* Historia */}
            <div className="space-y-2">
              <Label htmlFor="story">
                Historia <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="story"
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                placeholder="Cuenta la historia del paciente, su experiencia en el estudio clínico y cómo le ayudó..."
                rows={6}
                required
                className="resize-none"
              />
            </div>

            {/* Cita */}
            <div className="space-y-2">
              <Label htmlFor="quote">Cita Destacada (opcional)</Label>
              <Input
                id="quote"
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                placeholder="Ej: Este estudio cambió mi vida completamente"
                maxLength={500}
              />
            </div>

            {/* Estado activo */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked: boolean) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Mostrar en la página principal
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={uploading}
                className="bg-[#04BFAD] hover:bg-[#024959] text-white"
              >
                {uploading ? (
                  <>
                    <Icons.Spinner className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Icons.Save className="h-4 w-4 mr-2" />
                    {editingStory ? 'Actualizar' : 'Crear'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
