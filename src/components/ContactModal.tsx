/**
 * Modal de Contacto
 * 
 * Permite a los usuarios enviar mensajes de contacto desde cualquier parte del sitio.
 * El formulario recopila: nombre, email, asunto y mensaje.
 * 
 * TODO: Implementar envío de email real cuando esté listo el backend
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Icons } from './ui/icons';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implementar envío de email real
      // Por ahora, simulamos el envío
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Mensaje de contacto:', formData);
      
      setSuccess(true);
      
      // Resetear formulario después de 2 segundos
      setTimeout(() => {
        setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
        setSuccess(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#024959] flex items-center gap-2">
            <Icons.Mail className="w-6 h-6 text-[#04BFAD]" />
            Contáctanos
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            ¿Tienes preguntas o necesitas ayuda? Envíanos un mensaje y te responderemos a la brevedad.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-[#024959] mb-2">
              ¡Mensaje Enviado!
            </h3>
            <p className="text-gray-600">
              Gracias por contactarnos. Te responderemos pronto.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  required
                  disabled={loading}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@email.com"
                  required
                  disabled={loading}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="asunto">Asunto *</Label>
              <Input
                id="asunto"
                value={formData.asunto}
                onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                placeholder="¿En qué podemos ayudarte?"
                required
                disabled={loading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="mensaje">Mensaje *</Label>
              <Textarea
                id="mensaje"
                value={formData.mensaje}
                onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                placeholder="Escribe tu mensaje aquí..."
                required
                disabled={loading}
                rows={5}
                className="mt-1 resize-none"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <Icons.Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                También puedes contactarnos directamente al email:{' '}
                <a href="mailto:contacto@yoparticipo.cl" className="font-semibold hover:underline">
                  contacto@yoparticipo.cl
                </a>
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#04BFAD] hover:bg-[#024959] text-white"
              >
                {loading ? (
                  <>
                    <Icons.Loader className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Icons.Send className="w-4 h-4 mr-2" />
                    Enviar Mensaje
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
