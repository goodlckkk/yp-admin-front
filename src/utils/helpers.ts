/**
 * Funciones de utilidad compartidas
 * 
 * Centraliza funciones helper que se usan en múltiples lugares
 * para evitar duplicación y facilitar el mantenimiento.
 * 
 * @module utils/helpers
 */

/**
 * Combina clases CSS de forma segura
 * Filtra valores falsy y une las clases con espacios
 * 
 * @param {...(string | undefined | null | false)[]} classes - Clases a combinar
 * @returns {string} String con las clases combinadas
 * 
 * @example
 * cn('base-class', condition && 'conditional-class', 'another-class')
 * // => 'base-class conditional-class another-class' (si condition es true)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formatea una fecha a formato legible en español
 * 
 * @param {string | Date} date - Fecha a formatear
 * @param {boolean} includeTime - Si debe incluir la hora
 * @returns {string} Fecha formateada
 * 
 * @example
 * formatDate('2024-01-15T10:30:00Z')
 * // => '15 de enero de 2024'
 * 
 * formatDate('2024-01-15T10:30:00Z', true)
 * // => '15 de enero de 2024, 10:30'
 */
export function formatDate(date: string | Date, includeTime: boolean = false): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return dateObj.toLocaleDateString('es-CL', options);
}

/**
 * Formatea una fecha a formato corto (DD/MM/YYYY)
 * 
 * @param {string | Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 * 
 * @example
 * formatDateShort('2024-01-15')
 * // => '15/01/2024'
 */
export function formatDateShort(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Valida un RUT chileno
 * 
 * @param {string} rut - RUT a validar (formato: 12.345.678-9)
 * @returns {boolean} True si el RUT es válido
 * 
 * @example
 * validateRut('12.345.678-9')
 * // => true o false
 */
export function validateRut(rut: string): boolean {
  if (!rut) return false;
  
  // Limpiar el RUT
  const cleanRut = rut.replace(/[.-]/g, '');
  
  if (cleanRut.length < 2) return false;
  
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDv = 11 - (sum % 11);
  const calculatedDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();
  
  return dv === calculatedDv;
}

/**
 * Formatea un RUT chileno
 * 
 * @param {string} rut - RUT sin formato
 * @returns {string} RUT formateado (12.345.678-9)
 * 
 * @example
 * formatRut('123456789')
 * // => '12.345.678-9'
 */
export function formatRut(rut: string): string {
  if (!rut) return '';
  
  // Limpiar el RUT
  const cleanRut = rut.replace(/[.-]/g, '');
  
  if (cleanRut.length < 2) return cleanRut;
  
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  
  // Formatear el cuerpo con puntos
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedBody}-${dv}`;
}

/**
 * Valida un email
 * 
 * @param {string} email - Email a validar
 * @returns {boolean} True si el email es válido
 * 
 * @example
 * validateEmail('usuario@ejemplo.com')
 * // => true
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Valida un teléfono chileno
 * 
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} True si el teléfono es válido
 * 
 * @example
 * validatePhone('+56912345678')
 * // => true
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  
  const phonePattern = /^(\+?56)?[2-9]\d{8}$/;
  return phonePattern.test(phone.replace(/\s/g, ''));
}

/**
 * Trunca un texto a una longitud máxima
 * 
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @param {string} suffix - Sufijo a agregar (default: '...')
 * @returns {string} Texto truncado
 * 
 * @example
 * truncate('Este es un texto muy largo', 10)
 * // => 'Este es un...'
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitaliza la primera letra de un string
 * 
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 * 
 * @example
 * capitalize('hola mundo')
 * // => 'Hola mundo'
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Genera un ID único
 * 
 * @returns {string} ID único
 * 
 * @example
 * generateId()
 * // => 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce de una función
 * 
 * @param {Function} func - Función a debounce
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función con debounce
 * 
 * @example
 * const debouncedSearch = debounce((query) => search(query), 300);
 * debouncedSearch('texto');
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle de una función
 * 
 * @param {Function} func - Función a throttle
 * @param {number} limit - Límite de tiempo en ms
 * @returns {Function} Función con throttle
 * 
 * @example
 * const throttledScroll = throttle(() => handleScroll(), 100);
 * window.addEventListener('scroll', throttledScroll);
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Formatea un número como moneda chilena
 * 
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Cantidad formateada
 * 
 * @example
 * formatCurrency(1234567)
 * // => '$1.234.567'
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calcula la edad a partir de una fecha de nacimiento
 * 
 * @param {string | Date} birthDate - Fecha de nacimiento
 * @returns {number} Edad en años
 * 
 * @example
 * calculateAge('1990-01-15')
 * // => 34 (en 2024)
 */
export function calculateAge(birthDate: string | Date): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Copia texto al portapapeles
 * 
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} True si se copió exitosamente
 * 
 * @example
 * await copyToClipboard('Texto a copiar');
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para navegadores antiguos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (error) {
        textArea.remove();
        return false;
      }
    }
  } catch (error) {
    console.error('Error al copiar al portapapeles:', error);
    return false;
  }
}

/**
 * Descarga un archivo desde una URL
 * 
 * @param {string} url - URL del archivo
 * @param {string} filename - Nombre del archivo
 * 
 * @example
 * downloadFile('https://ejemplo.com/archivo.pdf', 'documento.pdf');
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
