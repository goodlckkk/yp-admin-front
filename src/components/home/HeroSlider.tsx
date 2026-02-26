/**
 * Componente HeroSlider - Slider principal de la página de inicio
 * 
 * Muestra un carrusel de imágenes dinámico que se gestiona desde el dashboard.
 * Solo muestra los slides marcados como activos, ordenados según configuración.
 * 
 * Características:
 * - Auto-play con intervalo configurable
 * - Navegación con flechas y dots
 * - Transiciones suaves
 * - Responsive (adapta altura según dispositivo)
 * - Soporte para título, descripción y botón CTA
 */

import { useState, useEffect } from 'react';
import { Icons } from '../ui/icons';

interface HeroSlide {
  id: string;
  imageUrl: string;
  title: string | null;
  description: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  order: number;
  align?: 'left' | 'center' | 'right' | 'left-bottom' | 'left-top';
}

interface HeroSliderProps {
  autoPlayInterval?: number; // Intervalo en milisegundos (default: 5000)
  onPostularClick?: () => void;
}

export default function HeroSlider({ autoPlayInterval = 5000, onPostularClick }: HeroSliderProps) {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [defaultIndex, setDefaultIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  // Frases por defecto cuando no hay imágenes - ACTUALIZADAS
  const defaultSlides = [
    {
      id: 'default-1',
      title: 'Tu salud es lo más importante',
      description: 'Participa en estudios clínicos con seguimiento médico y acompañamiento profesional.',
      imageUrl: '/Slider-1.png',
      ctaText: 'Quiero participar',
      align: 'left'
    },
    {
      id: 'default-2',
      title: 'Decide con tranquilidad',
      description: 'Tu participación es voluntaria, segura y respaldada por equipos de salud especializados.',
      imageUrl: '/slider-2.png',
      ctaText: 'Quiero participar',
      ctaUrl: null,
      order: 2,
      align: 'left'
    },
    {
      id: 'default-3',
      title: 'Sin costo y con un propósito real',
      description: 'Participar es gratuito y ayuda a mejorar los tratamientos del futuro.',
      imageUrl: '/slider-3.png',
      ctaText: 'Quiero participar',
      ctaUrl: null,
      order: 3,
      align: 'left'
    }
  ];

  /**
   * Cargar slides activos desde la API
   */
  useEffect(() => {
    // Usar slides locales directamente para esta versión
    setSlides(defaultSlides);
    setLoading(false);
  }, []);

  /**
   * Auto-play: cambiar slide automáticamente
   * Funciona tanto para slides con imágenes como para slides por defecto
   */
  useEffect(() => {
    if (loading) return; // No auto-play mientras está cargando

    const hasSlides = slides.length > 0;
    
    // Si hay slides con imágenes y solo hay 1, no hacer auto-play
    if (hasSlides && slides.length <= 1) return;
    
    // Si no hay slides, usar auto-play para slides por defecto
    const interval = setInterval(() => {
      if (hasSlides) {
        handleNext();
      } else {
        setDefaultIndex((prev) => (prev + 1) % 3);
      }
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, defaultIndex, slides.length, autoPlayInterval, loading]);

  /**
   * Navegar al siguiente slide
   */
  const handleNext = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    
    setTimeout(() => setIsTransitioning(false), 500);
  };

  /**
   * Navegar al slide anterior
   */
  const handlePrev = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    
    setTimeout(() => setIsTransitioning(false), 500);
  };

  /**
   * Navegar a un slide específico
   */
  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Loading state
  if (loading) {
    return (
      <div className="relative w-full h-screen bg-gradient-to-br from-[#024959] to-[#04BFAD] flex items-center justify-center">
        <Icons.Spinner className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }

  // Sin slides configurados - mostrar slider con frases por defecto (Fallback defensivo)
  if (slides.length === 0) {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        {defaultSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === defaultIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="w-full h-full bg-gradient-to-br from-[#024959] to-[#04BFAD] flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
                  {slide.title}
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl opacity-90 animate-fade-in-delay-2 mb-10">
                  {slide.description}
                </p>
                {slide.ctaText && onPostularClick && (
                  <button
                    onClick={onPostularClick}
                    className="inline-flex items-center gap-2 bg-white text-[#024959] hover:bg-gray-100 font-bold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg animate-fade-in-delay-2"
                  >
                    {slide.ctaText}
                    <Icons.ArrowRight className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Dots de navegación */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {defaultSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setDefaultIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === defaultIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => {
          const isLeft = (slide.align || 'center').includes('left');
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Imagen de fondo */}
              <img
                src={slide.imageUrl}
                alt={slide.title || ''}
                className="absolute inset-0 w-full h-full object-cover"
                onLoad={() => setImageLoaded(prev => ({ ...prev, [slide.id]: true }))}
              />
              <div className="absolute inset-0 bg-black/40" />

              {/* Contenido del slide */}
              {(slide.title || slide.description || slide.ctaText) && (
                <div className={`relative z-10 h-full flex flex-col 
                  ${isLeft ? 'items-start justify-center pl-8 md:pl-16' : 'items-center justify-center'}
                  px-4 sm:px-6 md:px-8 lg:px-12`}
                >
                  <div className="text-white max-w-4xl">
                    {slide.title && (
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
                        {slide.title}
                      </h1>
                    )}
                    {slide.description && (
                      <p className="text-xl sm:text-2xl md:text-3xl opacity-90 mb-6 md:mb-8">
                        {slide.description}
                      </p>
                    )}
                    {slide.ctaText && onPostularClick && (
                      <button
                        onClick={onPostularClick}
                        className="inline-flex items-center gap-2 bg-white text-[#024959] hover:bg-gray-100 font-bold px-6 py-3 md:px-8 md:py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        {slide.ctaText}
                        <Icons.ArrowRight className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navegación: flechas */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
            aria-label="Slide anterior"
          >
            <Icons.ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
            aria-label="Siguiente slide"
          >
            <Icons.ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Navegación: dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}