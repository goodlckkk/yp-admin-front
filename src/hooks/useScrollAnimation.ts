/**
 * Hook useScrollAnimation
 * 
 * Detecta cuando un elemento entra en el viewport y aplica animaciones de fade-in.
 * Útil para crear efectos de scroll suaves y dinámicos.
 */

import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number; // Porcentaje del elemento visible para activar (0-1)
  rootMargin?: string; // Margen adicional para activar antes/después
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px' } = options;
  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Solo activar una vez cuando entra
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, isVisible]);

  return { elementRef, isVisible };
}
