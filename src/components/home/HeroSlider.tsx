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

  // Frases por defecto cuando no hay imágenes
  const defaultSlides = [
    {
      id: 'default-1',
      title: 'Tu salud es lo más importante',
      description: 'Participa en estudios clínicos con seguimiento médico y acompañamiento profesional.',
      imageUrl: '/Slider-1.png',
      ctaText: 'Quiero participar',
      align: 'left' // Nuevo campo para alineación
    },
    {
      id: 'default-2',
      title: 'Decide con tranquilidad',
      description: 'Tu participación es voluntaria, segura y respaldada por equipos de salud especializados.',
      imageUrl: '/slider-2.png',
      ctaText: 'Quiero participar',
      align: 'left'
    },
    {
      id: 'default-3',
      title: 'Sin costo y con un propósito real',
      description: 'Participar es gratuito y ayuda a mejorar los tratamientos del futuro.',
      imageUrl: '/slider-3.png',
      ctaText: 'Quiero participar',
      align: 'left'
    }
  ];

  /**
   * Cargar slides activos desde la API
   */
  useEffect(() => {
    // Usar slides locales directamente para esta versión
    setSlides(defaultSlides as any);
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

  // Sin slides configurados - mostrar slider con frases por defecto
  if (slides.length === 0) {
    // Helper para renderizar el ícono correcto
    const renderIcon = (iconName: string) => {
      // Si es el logo, mostrar la imagen
      if (iconName === 'Logo') {
        return (
          <img 
            src="/logo-blanco.svg" 
            alt="yoParticipo" 
            className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-48 lg:h-48 mb-8 opacity-90 object-contain"
          />
        );
      }
      
      // Para otros íconos, usar el componente de Icons
      const IconComponent = Icons[iconName as keyof typeof Icons];
      if (!IconComponent) return null;
      return <IconComponent className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 mb-8 opacity-90" />;
    };

    return (
      <div className="relative w-full h-screen overflow-hidden">
        {defaultSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === defaultIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className={`w-full h-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center`}>
              <div className="text-center text-white px-4 max-w-4xl mx-auto">
                {/* Ícono */}
                <div className="flex justify-center animate-fade-in">
                  {renderIcon(slide.icon)}
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-delay">
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

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Imagen de fondo */}
            <div className="absolute inset-0">
              <img
                src={slide.imageUrl}
                alt={slide.title || 'Slide'}
                className="w-full h-full object-cover"
              />
              {/* Overlay oscuro para mejorar legibilidad del texto */}
              <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Contenido del slide */}
            {(slide.title || slide.description || slide.ctaText) && (
              <div className={`relative z-10 h-full flex flex-col 
                ${(slide as any).align === 'left' ? 'items-start justify-center' : 
                  (slide as any).align === 'left-bottom' ? 'items-start justify-end pb-32' : 
                  (slide as any).align === 'left-top' ? 'items-start justify-start pt-48' :
                  'items-center justify-center'
                }`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className={`max-w-3xl 
                    ${(slide as any).align === 'left' || (slide as any).align === 'left-bottom' || (slide as any).align === 'left-top' ? 'text-left ml-0 sm:ml-10 lg:ml-20' : 'mx-auto text-center'} 
                    text-white`}>
                    {slide.title && (
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in text-shadow-lg">
                        {slide.title}
                      </h1>
                    )}
                    {slide.description && (
                      <p className={`text-lg sm:text-xl md:text-2xl mb-8 opacity-90 animate-fade-in-delay 
                        ${(slide as any).align === 'left' || (slide as any).align === 'left-bottom' || (slide as any).align === 'left-top' ? '' : 'mx-auto'} 
                        max-w-2xl text-shadow-md`}>
                        {slide.description}
                      </p>
                    )}
                    {(slide.ctaText || onPostularClick) && (
                        (slide.ctaUrl) ? (
                            <a
                                href={slide.ctaUrl}
                                className="inline-flex items-center gap-2 bg-[#04BFAD] hover:bg-[#024959] text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg animate-fade-in-delay-2"
                            >
                                {slide.ctaText || 'Quiero participar'}
                                <Icons.ArrowRight className="h-5 w-5" />
                            </a>
                        ) : (
                             onPostularClick && (
                                <button
                                    onClick={onPostularClick}
                                    className="inline-flex items-center gap-2 bg-[#04BFAD] hover:bg-[#024959] text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg animate-fade-in-delay-2"
                                >
                                    {slide.ctaText || 'Quiero participar'}
                                    <Icons.ArrowRight className="h-5 w-5" />
                                </button>
                             )
                        )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controles de navegación - solo si hay más de 1 slide */}
      {slides.length > 1 && (
        <>
          {/* Flechas de navegación */}
          <button
            onClick={handlePrev}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Slide anterior"
          >
            <Icons.ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Siguiente slide"
          >
            <Icons.ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots de navegación */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                } disabled:cursor-not-allowed`}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Estilos para animaciones */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.2s both;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.6s ease-out 0.4s both;
        }
      `}</style>
    </div>
  );
}
