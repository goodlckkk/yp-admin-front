/**
 * Componente PrivacySecurity - Privacidad y Seguridad
 * 
 * Sección que comunica el compromiso de YoParticipo con la privacidad
 * y seguridad de los datos de los pacientes.
 */

import { Icons } from '../ui/icons';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export default function PrivacySecurity() {
  const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.2 });
  
  return (
    <section 
      ref={elementRef as any}
      className={`min-h-screen flex items-center py-20 bg-gradient-to-br from-[#024959] to-[#04BFAD] relative overflow-hidden transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Decoración de fondo */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      {/* Patrón de puntos decorativo */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full" />
        <div className="absolute top-20 right-20 w-2 h-2 bg-white rounded-full" />
        <div className="absolute bottom-10 left-20 w-2 h-2 bg-white rounded-full" />
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-white rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header con icono */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-6 border-2 border-white/20">
              <Icons.Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Tu privacidad y seguridad son nuestra prioridad
            </h2>
          </div>

          {/* Contenido principal */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border-2 border-white/20 shadow-2xl">
            <div className="space-y-6 text-white">
              <p className="text-lg md:text-xl leading-relaxed">
                En <span className="font-bold">YoParticipo</span>, protegemos tu información con los más altos estándares de seguridad. Usamos tecnología confiable para resguardar tus datos y te garantizamos que se utilizarán únicamente con el fin de conectarte con ensayos clínicos que puedan ofrecerte nuevas opciones de tratamiento.
              </p>
              
              <p className="text-lg md:text-xl leading-relaxed">
                Siempre lo haremos con tu consentimiento explícito y para tu beneficio, manteniendo la transparencia en cada paso.
              </p>

              <p className="text-lg md:text-xl leading-relaxed">
                Así, puedes tener la tranquilidad de que tu información está segura y de que solo se comparte en el contexto de los estudios clínicos. Estamos aquí para cuidarte y para ayudarte a encontrar la mejor opción de salud posible.
              </p>
            </div>

            {/* Características de seguridad */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-10 border-t border-white/20">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Icons.Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Datos Encriptados</h3>
                  <p className="text-sm text-white/80">
                    Tecnología de encriptación de última generación
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Icons.CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Consentimiento Explícito</h3>
                  <p className="text-sm text-white/80">
                    Siempre con tu autorización previa
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Icons.Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Total Transparencia</h3>
                  <p className="text-sm text-white/80">
                    Información clara en cada paso del proceso
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Badge de confianza */}
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
              <Icons.Shield className="w-5 h-5 text-white" />
              <span className="text-white font-medium">
                Cumplimos con todas las normativas de protección de datos
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
