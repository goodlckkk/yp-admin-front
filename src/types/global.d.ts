// Declaraciones de tipos globales para módulos que no tienen tipos definidos
declare module 'date-fns/locale/es';
declare module 'date-fns';
declare module 'lucide-react';

// Tipos para módulos de Astro
declare module 'astro:transitions/client' {
  export const navigate: (to: string) => void;
}

// Extender el tipo Window para incluir propiedades globales
declare global {
  interface Window {
    // Aquí puedes agregar propiedades globales si es necesario
  }
}

export {};
