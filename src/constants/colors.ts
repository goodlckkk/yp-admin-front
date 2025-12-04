/**
 * Paleta de colores oficial de Yo Participo
 * 
 * Esta paleta debe ser utilizada en toda la aplicación para mantener
 * consistencia visual y facilitar cambios futuros de branding.
 * 
 * @module colors
 */

/**
 * Colores principales de la marca
 */
export const COLORS = {
  /** Gris oscuro - Color principal para textos y elementos oscuros */
  DARK_GRAY: '#4D4D59',
  
  /** Azul oscuro - Color secundario para acentos y elementos importantes */
  DARK_BLUE: '#024959',
  
  /** Turquesa - Color primario para botones y elementos interactivos */
  TURQUOISE: '#04BFAD',
  
  /** Turquesa claro - Color para fondos y elementos sutiles */
  LIGHT_TURQUOISE: '#A7F2EB',
  
  /** Gris claro - Color para fondos y elementos neutros */
  LIGHT_GRAY: '#F2F2F2',
} as const;

/**
 * Variantes de colores para diferentes estados
 */
export const COLOR_VARIANTS = {
  /** Variantes del turquesa para hover y estados activos */
  turquoise: {
    base: COLORS.TURQUOISE,
    hover: '#03a89a',
    active: '#038f82',
    light: COLORS.LIGHT_TURQUOISE,
  },
  
  /** Variantes del azul oscuro */
  darkBlue: {
    base: COLORS.DARK_BLUE,
    hover: '#013847',
    active: '#012835',
  },
  
  /** Variantes del gris */
  gray: {
    dark: COLORS.DARK_GRAY,
    light: COLORS.LIGHT_GRAY,
    medium: '#8B8B95',
  },
} as const;

/**
 * Colores semánticos para estados y acciones
 */
export const SEMANTIC_COLORS = {
  /** Color para acciones exitosas */
  success: '#10b981',
  
  /** Color para advertencias */
  warning: '#f59e0b',
  
  /** Color para errores */
  error: '#ef4444',
  
  /** Color para información */
  info: COLORS.TURQUOISE,
  
  /** Color para elementos primarios */
  primary: COLORS.TURQUOISE,
  
  /** Color para elementos secundarios */
  secondary: COLORS.DARK_BLUE,
} as const;

/**
 * Gradientes predefinidos usando la paleta oficial
 */
export const GRADIENTS = {
  /** Gradiente principal: turquesa a azul oscuro */
  primary: `linear-gradient(135deg, ${COLORS.TURQUOISE} 0%, ${COLORS.DARK_BLUE} 100%)`,
  
  /** Gradiente suave: turquesa claro a turquesa */
  soft: `linear-gradient(135deg, ${COLORS.LIGHT_TURQUOISE} 0%, ${COLORS.TURQUOISE} 100%)`,
  
  /** Gradiente de fondo: gris claro a blanco */
  background: `linear-gradient(180deg, ${COLORS.LIGHT_GRAY} 0%, #FFFFFF 100%)`,
} as const;

/**
 * Opacidades estándar para overlays y sombras
 */
export const OPACITY = {
  disabled: 0.5,
  hover: 0.8,
  overlay: 0.6,
  subtle: 0.1,
} as const;

/**
 * Exportar todo como un objeto único para facilitar importación
 */
export const THEME = {
  colors: COLORS,
  variants: COLOR_VARIANTS,
  semantic: SEMANTIC_COLORS,
  gradients: GRADIENTS,
  opacity: OPACITY,
} as const;

export default THEME;
