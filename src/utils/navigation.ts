/**
 * Utilidad para manejar la navegación en la aplicación
 * Proporciona una capa de abstracción sobre la API de enrutamiento
 */

/**
 * Navegar a una ruta específica
 * @param path Ruta de destino
 * @param options Opciones de navegación
 */
export function navigate(
  path: string,
  options: { replace?: boolean; state?: any } = {}
): void {
  try {
    // Usar la API de navegación del navegador si está disponible
    if (window.history && window.history.pushState) {
      if (options.replace) {
        window.history.replaceState(options.state || {}, '', path);
      } else {
        window.history.pushState(options.state || {}, '', path);
      }
      
      // Disparar evento de cambio de ruta para que los componentes de React se actualicen
      const navEvent = new PopStateEvent('popstate');
      window.dispatchEvent(navEvent);
    } else {
      // Fallback para navegadores antiguos
      window.location.href = path;
    }
  } catch (error) {
    console.error('Error al navegar:', error);
    window.location.href = path;
  }
}

/**
 * Obtener la ruta actual
 */
export function getCurrentPath(): string {
  return window.location.pathname + window.location.search;
}

/**
 * Volver a la página anterior
 */
export function goBack(): void {
  if (window.history && window.history.back) {
    window.history.back();
  } else {
    navigate('/');
  }
}

/**
 * Recargar la página actual
 */
export function reload(): void {
  window.location.reload();
}
