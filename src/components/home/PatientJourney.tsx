/**
 * Componente PatientJourney - Camino del Paciente
 * 
 * Muestra los pasos que debe seguir un paciente para participar en un estudio clínico.
 * Diseño inspirado en el flujo: Busca → Postúlate → Te Contactamos → Participa
 */

import { Icons } from '../ui/icons';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface PatientJourneyProps {
  onPostularClick?: () => void;
}

export default function PatientJourney({ onPostularClick }: PatientJourneyProps) {
  const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.2 });
  
  const steps = [
    {
      number: 1,
      title: 'Inscripción Inicial',
      description: 'Completa un formulario breve con tus datos e intereses en participar.',
      icon: Icons.FileText,
      color: 'from-[#04BFAD] to-[#024959]',
      iconBg: "bg-[#04BFAD]/10",
      iconColor: "text-[#04BFAD]"
    },
    {
      number: 2,
      title: 'Evaluación y Contacto',
      description: 'Nuestro equipo revisará tu información y te contactará para explicarte los siguientes pasos.',
      icon: Icons.Phone,
      color: 'from-[#024959] to-[#04BFAD]',
      iconBg: "bg-[#024959]/10",
      iconColor: "text-[#024959]"
    },
    {
      number: 3,
      title: 'Participación en el Estudio',
      description: 'Si eres elegible, te guiaremos en cada paso para que participes de forma segura en el ensayo clínico.',
      icon: Icons.Activity,
      color: 'from-[#04BFAD] to-[#024959]',
      iconBg: "bg-[#04BFAD]/10",
      iconColor: "text-[#04BFAD]"
    },
    {
      number: 4,
      title: 'Seguimiento y Resultados',
      description: 'Recibirás actualizaciones y acompañamiento durante todo el proceso, con total transparencia.',
      icon: Icons.CheckCircle,
      color: 'from-[#024959] to-[#04BFAD]',
      iconBg: "bg-[#024959]/10",
      iconColor: "text-[#024959]"
    }
  ];

  return (
    <section 
      ref={elementRef as any}
      className={`min-h-screen flex items-center py-20 bg-white relative overflow-hidden transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#A7F2EB]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#04BFAD]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#A7F2EB] text-[#024959] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Icons.MapPin className="w-4 h-4" />
            Tu camino hacia la participación
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#024959] mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-xl text-[#4D4D59] max-w-3xl mx-auto">
            Participar en un estudio clínico es simple y seguro. Sigue estos pasos:
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Línea conectora (solo en desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#04BFAD]/30 to-[#04BFAD]/10 z-0" />
              )}

              {/* Card */}
              <div className="relative bg-white rounded-2xl p-6 border-2 border-[#A7F2EB]/30 hover:border-[#04BFAD]/50 transition-all duration-300 hover:shadow-xl group h-full">
                {/* Número del paso */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-[#04BFAD] to-[#024959] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {step.number}
                </div>

                {/* Icono */}
                <div className="mb-6">
                  <div className={`w-16 h-16 rounded-2xl ${step.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                  </div>
                </div>

                {/* Contenido */}
                <h3 className="text-2xl font-bold text-[#024959] mb-3">
                  {step.title}
                </h3>
                <p className="text-[#4D4D59] leading-relaxed">
                  {step.description}
                </p>

                {/* Decoración inferior */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-[#4D4D59] mb-6">
            ¿Listo para comenzar tu camino?
          </p>
          <button
            onClick={onPostularClick}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#04BFAD] to-[#024959] hover:from-[#024959] hover:to-[#04BFAD] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Icons.Heart className="w-5 h-5" />
            Comenzar mi postulación
            <Icons.ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
