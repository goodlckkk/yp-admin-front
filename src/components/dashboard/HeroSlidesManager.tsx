/**
 * Componente para gestionar los slides del hero desde el dashboard
 * 
 * Permite a los administradores:
 * - Ver todos los slides (activos e inactivos)
 * - Crear nuevos slides con imagen, título, descripción y CTA
 * - Editar slides existentes
 * - Eliminar slides
 * - Reordenar slides con drag & drop
 * - Activar/desactivar slides
 * 
 * Validaciones de imagen:
 * - Formatos: JPG, PNG, WebP
 * - Tamaño máximo: 2MB
 * - Resolución recomendada: 1920x1080px o 1920x600px
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Icons } from '../ui/icons';
import { useToast } from '../../hooks/useToast';
import { fetchWithAuth } from '../../lib/api';

interface HeroSlide {
  id: string;
  imageUrl: string;
  title: string | null;
  description: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HeroSlideFormData {
  imageUrl: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  isActive: boolean;
}

export default function HeroSlidesManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState<HeroSlideFormData>({
    imageUrl: '',
    title: '',
    description: '',
    ctaText: '',
    ctaUrl: '',
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  // Cargar slides al montar el componente
  useEffect(() => {
    fetchSlides();
  }, []);

  /**
   * Obtener todos los slides desde la API
   */
  const fetchSlides = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/hero-slides') as HeroSlide[];
      setSlides(data);
    } catch (error) {
      console.error('Error al cargar slides:', error);
      showToast('Error al cargar los slides', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validar archivo de imagen
   */
  const validateImage = (file: File): string | null => {
    // Validar formato
    const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      return 'Formato no válido. Use JPG, PNG o WebP';
    }

    // Validar tamaño (2MB máximo)
    const maxSize = 2 * 1024 * 1024; // 2MB en bytes
    if (file.size > maxSize) {
      return 'La imagen es muy grande. Tamaño máximo: 2MB';
    }

    return null;
  };

  /**
   * Manejar selección de imagen
   */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar imagen
    const error = validateImage(file);
    if (error) {
      showToast(error, 'error');
      e.target.value = '';
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setImageFile(file);
  };

  /**
   * Subir imagen (simulado - en producción usarías un servicio como Cloudinary o S3)
   */
  const uploadImage = async (file: File): Promise<string> => {
    // Por ahora, convertir a base64 (en producción subirías a un CDN)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * Crear o actualizar slide
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUploading(true);

      let imageUrl = formData.imageUrl;

      // Si hay una imagen nueva, subirla
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Validar que haya imagen
      if (!imageUrl) {
        showToast('Debe seleccionar una imagen', 'error');
        return;
      }

      const payload = {
        imageUrl,
        title: formData.title || null,
        description: formData.description || null,
        ctaText: formData.ctaText || null,
        ctaUrl: formData.ctaUrl || null,
        isActive: formData.isActive,
        order: editingSlide ? editingSlide.order : slides.length,
      };

      const url = editingSlide 
        ? `/hero-slides/${editingSlide.id}`
        : '/hero-slides';
      
      const method = editingSlide ? 'PATCH' : 'POST';

      await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      showToast(
        editingSlide ? 'Slide actualizado correctamente' : 'Slide creado correctamente',
        'success'
      );

      // Recargar slides y cerrar dialog
      await fetchSlides();
      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar slide:', error);
      showToast('Error al guardar el slide', 'error');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Eliminar slide
   */
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este slide?')) return;

    try {
      await fetchWithAuth(`/hero-slides/${id}`, {
        method: 'DELETE',
      });

      showToast('Slide eliminado correctamente', 'success');
      await fetchSlides();
    } catch (error) {
      console.error('Error al eliminar slide:', error);
      showToast('Error al eliminar el slide', 'error');
    }
  };

  /**
   * Toggle estado activo/inactivo
   */
  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      await fetchWithAuth(`/hero-slides/${slide.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !slide.isActive }),
      });

      showToast('Estado actualizado correctamente', 'success');
      await fetchSlides();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      showToast('Error al actualizar el estado', 'error');
    }
  };

  /**
   * Abrir dialog para crear nuevo slide
   */
  const handleOpenCreate = () => {
    setEditingSlide(null);
    setFormData({
      imageUrl: '',
      title: '',
      description: '',
      ctaText: '',
      ctaUrl: '',
      isActive: true,
    });
    setImageFile(null);
    setImagePreview('');
    setShowDialog(true);
  };

  /**
   * Abrir dialog para editar slide
   */
  const handleOpenEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      imageUrl: slide.imageUrl,
      title: slide.title || '',
      description: slide.description || '',
      ctaText: slide.ctaText || '',
      ctaUrl: slide.ctaUrl || '',
      isActive: slide.isActive,
    });
    setImageFile(null);
    setImagePreview(slide.imageUrl);
    setShowDialog(true);
  };

  /**
   * Cerrar dialog
   */
  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingSlide(null);
    setFormData({
      imageUrl: '',
      title: '',
      description: '',
      ctaText: '',
      ctaUrl: '',
      isActive: true,
    });
    setImageFile(null);
    setImagePreview('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.Spinner className="h-8 w-8 animate-spin text-[#04BFAD]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#024959]">Slider Principal (Hero)</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona las imágenes del slider de la página de inicio
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-[#04BFAD] hover:bg-[#024959] text-white"
        >
          Nuevo Slide
        </Button>
      </div>

      {/* Especificaciones de imagen */}
      <Card className="border-[#04BFAD]/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[#024959]">
            📸 Especificaciones de Imagen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-semibold text-[#024959]">Formatos</p>
              <p className="text-gray-600">JPG, PNG, WebP</p>
            </div>
            <div>
              <p className="font-semibold text-[#024959]">Tamaño máximo</p>
              <p className="text-gray-600">2 MB</p>
            </div>
            <div>
              <p className="font-semibold text-[#024959]">Resolución</p>
              <p className="text-gray-600">1920x1080px (Full HD)</p>
            </div>
            <div>
              <p className="font-semibold text-[#024959]">Relación de aspecto</p>
              <p className="text-gray-600">16:9 o 3:1</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de slides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.map((slide) => (
          <Card key={slide.id} className="overflow-hidden border-[#04BFAD]/20">
            {/* Imagen */}
            <div className="relative h-48 bg-gray-100">
              <img
                src={slide.imageUrl}
                alt={slide.title || 'Slide'}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Badge
                  variant={slide.isActive ? 'default' : 'secondary'}
                  className={slide.isActive ? 'bg-green-500' : 'bg-gray-400'}
                >
                  {slide.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
                <Badge variant="outline" className="bg-white">
                  Orden: {slide.order}
                </Badge>
              </div>
            </div>

            {/* Contenido */}
            <CardContent className="p-4 space-y-3">
              {slide.title && (
                <h3 className="font-semibold text-[#024959] line-clamp-1">
                  {slide.title}
                </h3>
              )}
              {slide.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {slide.description}
                </p>
              )}
              {slide.ctaText && (
                <div className="flex items-center gap-2 text-sm text-[#04BFAD]">
                  <Icons.ExternalLink className="h-3 w-3" />
                  <span>{slide.ctaText}</span>
                </div>
              )}

              {/* Acciones */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(slide)}
                  className="flex-1"
                >
                  <Icons.Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleActive(slide)}
                  className="flex-1"
                >
                  {slide.isActive ? (
                    <>
                      <Icons.EyeOff className="h-3 w-3 mr-1" />
                      Desactivar
                    </>
                  ) : (
                    <>
                      <Icons.Eye className="h-3 w-3 mr-1" />
                      Activar
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(slide.id)}
                >
                  <Icons.Trash className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mensaje si no hay slides */}
      {slides.length === 0 && (
        <Card className="border-dashed border-2 border-[#04BFAD]/30">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.Image className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No hay slides configurados</p>
            <Button
              onClick={handleOpenCreate}
              className="bg-[#04BFAD] hover:bg-[#024959] text-white"
            >
              Crear primer slide
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog para crear/editar */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#024959]">
              {editingSlide ? 'Editar Slide' : 'Nuevo Slide'}
            </DialogTitle>
            <DialogDescription>
              {editingSlide
                ? 'Modifica los datos del slide'
                : 'Completa los datos para crear un nuevo slide'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Imagen */}
            <div>
              <Label htmlFor="image">
                Imagen * <span className="text-xs text-gray-500">(JPG, PNG, WebP - Máx 2MB)</span>
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                className="mt-1"
              />
              {imagePreview && (
                <div className="mt-3 relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Título */}
            <div>
              <Label htmlFor="title">Título (Opcional)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Encuentra tu estudio clínico ideal"
                maxLength={200}
                className="mt-1"
              />
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ej: Conectamos pacientes con estudios clínicos innovadores"
                rows={3}
                className="mt-1"
              />
            </div>

            {/* CTA Text */}
            <div>
              <Label htmlFor="ctaText">Texto del Botón (Opcional)</Label>
              <Input
                id="ctaText"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                placeholder="Ej: Comenzar ahora"
                maxLength={100}
                className="mt-1"
              />
            </div>

            {/* CTA URL */}
            <div>
              <Label htmlFor="ctaUrl">URL del Botón (Opcional)</Label>
              <Input
                id="ctaUrl"
                value={formData.ctaUrl}
                onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                placeholder="Ej: /test o https://..."
                maxLength={500}
                className="mt-1"
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
                Slide activo (visible en el home)
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
                className="bg-[#04BFAD] hover:bg-[#024959] text-white"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Icons.Spinner className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Icons.Save className="h-4 w-4 mr-2" />
                    {editingSlide ? 'Actualizar' : 'Crear'}
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
