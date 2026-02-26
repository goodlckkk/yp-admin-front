/**
 * Componente ClinicalStudyExplainer - ¿Qué es un estudio clínico?
 *
 * Sección informativa en la Landing Page que explica de manera sencilla
 * en qué consiste un ensayo clínico, sus fases y beneficios para el paciente.
 */

import { Icons } from '../ui/icons';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export default function ClinicalStudyExplainer() {
  const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.15 });

  const benefits = [
    {
      icon: Icons.Heart,
      title: 'Acceso anticipado',
      description: 'Accede a tratamientos innovadores antes de que estén disponibles al público general.',
    },
    {
      icon: Icons.Shield,
      title: 'Sin costo',
      description: 'Los estudios clínicos son gratuitos para los participantes. Todos los gastos son cubiertos.',
    },
    {
      icon: Icons.Microscope,
      title: 'Contribuyes a la ciencia',
      description: 'Tu participación ayuda a desarrollar mejores tratamientos para futuras generaciones.',
    },
    {
      icon: Icons.User,
      title: 'Seguimiento médico',
      description: 'Recibes atención y monitoreo médico especializado durante todo el estudio.',
    },
  ];

  return (
    <section
      ref={elementRef as any}
      className={`min-h-screen flex items-center py-20 bg-white transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#024959] mb-4">
              ¿Qué es un estudio clínico?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Un estudio clínico es una investigación científica que evalúa nuevos tratamientos,
              medicamentos o procedimientos médicos en personas voluntarias, bajo estrictos
              controles éticos y de seguridad.
            </p>
          </div>

          {/* Beneficios */}
          <div className="bg-gradient-to-br from-[#024959] to-[#04BFAD] rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Beneficios de participar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                  <h4 className="font-bold text-white mb-1">{benefit.title}</h4>
                  <p className="text-sm text-white/80 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>

            {/* Nota de seguridad */}
            <div className="mt-8 flex items-start gap-3 bg-white/10 rounded-2xl p-4 border border-white/20">
              <Icons.Info className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white/90 leading-relaxed">
                <strong>Tu participación es 100% voluntaria.</strong> Puedes retirarte en cualquier momento
                sin consecuencias. Todos los estudios en YoParticipo cumplen con la normativa ética
                chilena e internacional (ICH-GCP).
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
