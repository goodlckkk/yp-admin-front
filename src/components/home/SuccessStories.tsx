/**
 * Componente SuccessStories - Historias que Inspiran
 * 
 * Muestra las historias de éxito de pacientes que participaron en estudios clínicos.
 * Solo muestra historias activas, cargadas dinámicamente desde la API.
 */

import { useState, useEffect } from 'react';
import { Icons } from '../ui/icons';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface SuccessStory {
  id: string;
  imageUrl: string;
  patientName: string | null;
  condition: string | null;
  story: string;
  quote: string | null;
  order: number;
}

export default function SuccessStories() {
  const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * Cargar historias activas desde la API
   */
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/success-stories/active`);
        
        if (!response.ok) {
          throw new Error('Error al cargar historias');
        }
        
        const data = await response.json();
        setStories(data);
      } catch (error) {
        console.error('Error al cargar historias:', error);
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  /**
   * Auto-cambio de historia cada 8 segundos
   */
  useEffect(() => {
    if (stories.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stories.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [stories.length]);

  // Loading state
  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Icons.Spinner className="h-8 w-8 animate-spin text-[#04BFAD]" />
          </div>
        </div>
      </section>
    );
  }

  // Sin historias
  if (stories.length === 0) {
    return null;
  }

  const currentStory = stories[currentIndex];

  return (
    <section 
      ref={elementRef as any}
      className={`min-h-screen flex items-center py-20 bg-[#F2F2F2] relative overflow-hidden transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Decoración de fondo */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#04BFAD]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#A7F2EB]/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#A7F2EB] text-[#024959] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Icons.Heart className="w-4 h-4" />
            Historias reales de esperanza
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#024959] mb-4">
            Historias que Inspiran
          </h2>
          <p className="text-xl text-[#4D4D59] max-w-3xl mx-auto">
            Conoce las experiencias de pacientes que transformaron sus vidas participando en estudios clínicos
          </p>
        </div>

        {/* Historia actual */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Imagen */}
              <div className="relative h-64 md:h-auto bg-gray-100">
                <img
                  src={currentStory.imageUrl}
                  alt={currentStory.patientName || 'Paciente'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
              </div>

              {/* Contenido */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                {/* Nombre y condición */}
                <div className="mb-6">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#024959] mb-2">
                    {currentStory.patientName || 'Paciente Anónimo'}
                  </h3>
                  {currentStory.condition && (
                    <p className="text-[#04BFAD] font-medium">
                      {currentStory.condition}
                    </p>
                  )}
                </div>

                {/* Cita destacada */}
                {currentStory.quote && (
                  <blockquote className="mb-6 relative">
                    <Icons.Quote className="absolute -top-2 -left-2 w-8 h-8 text-[#A7F2EB]" />
                    <p className="text-lg md:text-xl italic text-[#024959] pl-6">
                      "{currentStory.quote}"
                    </p>
                  </blockquote>
                )}

                {/* Historia */}
                <p className="text-[#4D4D59] leading-relaxed mb-6">
                  {currentStory.story}
                </p>

                {/* Indicadores */}
                {stories.length > 1 && (
                  <div className="flex gap-2 mt-auto">
                    {stories.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentIndex
                            ? 'bg-[#04BFAD] w-8'
                            : 'bg-[#A7F2EB] w-2 hover:bg-[#04BFAD]/50'
                        }`}
                        aria-label={`Ver historia ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-[#4D4D59] mb-4">
            ¿Quieres ser parte de una historia de éxito?
          </p>
          <button
            onClick={() => {
              const form = document.getElementById('patient-form-section');
              if (form) {
                form.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#04BFAD] to-[#024959] hover:from-[#024959] hover:to-[#04BFAD] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Icons.Heart className="w-5 h-5" />
            Postula ahora
            <Icons.ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
