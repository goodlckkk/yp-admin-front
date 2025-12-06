/**
 * Componente FAQ - Preguntas Frecuentes
 * 
 * Muestra las preguntas más comunes de los pacientes sobre ensayos clínicos.
 * Diseño accordion con animaciones suaves.
 */

import { useState } from 'react';
import { Icons } from '../ui/icons';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: '¿Qué es un ensayo clínico?',
    answer: 'Un ensayo clínico es un estudio de investigación médica diseñado para evaluar la seguridad y eficacia de nuevos tratamientos, medicamentos, dispositivos médicos o procedimientos. Estos estudios son fundamentales para el avance de la medicina y se realizan bajo estrictos protocolos de seguridad aprobados por autoridades sanitarias. Los participantes reciben atención médica especializada y contribuyen al desarrollo de tratamientos que pueden beneficiar a futuras generaciones.',
  },
  {
    question: '¿Cómo sé si puedo participar?',
    answer: 'Para determinar tu elegibilidad, primero completa nuestro formulario de registro con tu información médica básica. Nuestro equipo médico revisará tu perfil y lo comparará con los criterios de inclusión de los estudios activos. Si hay un estudio adecuado para ti, te contactaremos para explicarte los detalles, responder tus preguntas y programar una evaluación inicial. Cada estudio tiene requisitos específicos como edad, condición de salud, historial médico y ubicación geográfica.',
  },
  {
    question: '¿Es seguro participar en un ensayo clínico?',
    answer: 'Sí, la seguridad de los participantes es la máxima prioridad. Todos los ensayos clínicos en Chile están regulados por el Instituto de Salud Pública (ISP) y deben ser aprobados por Comités de Ética Científica independientes. Antes de participar, recibirás información detallada sobre los posibles riesgos y beneficios a través del proceso de consentimiento informado. Durante el estudio, serás monitoreado constantemente por profesionales médicos especializados y puedes retirarte en cualquier momento si lo deseas.',
  },
  {
    question: '¿Tiene algún costo participar?',
    answer: 'No, participar en un ensayo clínico es completamente gratuito. De hecho, todos los exámenes médicos, consultas, medicamentos del estudio y procedimientos relacionados con la investigación son proporcionados sin costo para ti. Además, muchos estudios ofrecen compensación por gastos de transporte, estacionamiento y tiempo invertido. Nunca tendrás que pagar por participar en un ensayo clínico legítimo.',
  },
  {
    question: '¿Qué tipo de estudios hay?',
    answer: 'Ofrecemos una amplia variedad de estudios clínicos que abarcan múltiples áreas de la medicina: oncología (cáncer), cardiología, neurología, diabetes, enfermedades respiratorias, dermatología, salud mental, enfermedades raras y muchas más. Los estudios se realizan en diferentes ciudades de Chile y pueden incluir tratamientos preventivos, terapéuticos o de diagnóstico. Nuestro equipo te ayudará a encontrar el estudio más adecuado según tu condición de salud, ubicación y preferencias personales.',
  },
  {
    question: '¿Puedo salir del estudio si cambio de opinión?',
    answer: 'Absolutamente. Tu participación es completamente voluntaria y tienes el derecho de retirarte del estudio en cualquier momento, por cualquier razón, sin tener que dar explicaciones y sin que esto afecte tu atención médica futura. Si decides retirarte, simplemente informa al equipo del estudio. Es importante que, si es posible, asistas a una visita final para asegurar tu seguridad y bienestar, pero esto no es obligatorio. Tu decisión será respetada sin ningún tipo de presión o consecuencia negativa.',
  },
  {
    question: '¿Qué pasa si tengo efectos secundarios?',
    answer: 'Si experimentas cualquier efecto secundario o reacción adversa durante el estudio, recibirás atención médica inmediata y especializada sin costo alguno. El equipo médico del estudio está disponible 24/7 para atender cualquier emergencia. Todos los efectos secundarios son cuidadosamente monitoreados, documentados y reportados a las autoridades regulatorias. Tu seguridad es la prioridad absoluta, y el estudio puede ser pausado o modificado si se identifican riesgos inesperados. Además, cuentas con seguro médico proporcionado por el patrocinador del estudio.',
  },
  {
    question: '¿Cómo se protege mi privacidad?',
    answer: 'Tu privacidad y confidencialidad están protegidas por estrictas leyes chilenas e internacionales, incluyendo la Ley N° 19.628 sobre Protección de Datos Personales. Toda tu información médica es codificada y almacenada de forma segura. Solo el equipo médico autorizado del estudio tiene acceso a tus datos personales. En las publicaciones científicas, tu identidad nunca será revelada. Utilizamos sistemas encriptados para el manejo de datos y cumplimos con los más altos estándares de confidencialidad médica. Tus datos solo se usan para fines de investigación y para conectarte con estudios relevantes.',
  },
  {
    question: '¿Cuánto tiempo dura un ensayo clínico?',
    answer: 'La duración varía significativamente según el tipo de estudio y la condición que se investiga. Algunos estudios pueden durar semanas, mientras que otros pueden extenderse por varios meses o incluso años. Antes de comprometerte, recibirás información detallada sobre: la duración total del estudio, la frecuencia de las visitas médicas, el tiempo estimado de cada visita, y los procedimientos que se realizarán en cada etapa. También te informaremos si hay un período de seguimiento después de completar el tratamiento. Esta información te permitirá tomar una decisión informada sobre tu participación.',
  },
  {
    question: '¿Qué beneficios puedo obtener al participar?',
    answer: 'Los beneficios de participar en un ensayo clínico son múltiples: acceso a tratamientos innovadores que aún no están disponibles para el público general, atención médica especializada y monitoreo constante de tu salud, exámenes y pruebas médicas sin costo, posible mejora en tu condición de salud, compensación por gastos de transporte y tiempo, y la satisfacción de contribuir al avance de la ciencia médica que puede ayudar a millones de personas en el futuro. Además, muchos participantes reportan sentirse empoderados al tomar un rol activo en su tratamiento y en la investigación médica.',
  },
];

export default function FAQ() {
  const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section 
      id="faq"
      ref={elementRef as any}
      className={`min-h-screen flex items-center py-20 bg-white relative overflow-hidden transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#A7F2EB]/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#04BFAD]/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#A7F2EB] text-[#024959] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Icons.HelpCircle className="w-4 h-4" />
            Resolvemos tus dudas
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#024959] mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-xl text-[#4D4D59] max-w-3xl mx-auto">
            Todo lo que necesitas saber sobre participar en ensayos clínicos
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="bg-white border-2 border-[#A7F2EB]/30 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#04BFAD]/50 hover:shadow-lg"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors duration-300 hover:bg-[#F2F2F2]/50"
              >
                <span className="text-lg font-semibold text-[#024959] pr-4">
                  {item.question}
                </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full bg-[#04BFAD] flex items-center justify-center transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                >
                  <Icons.ChevronDown className="w-5 h-5 text-white" />
                </div>
              </button>

              {/* Respuesta con animación */}
              <div
                className={`transition-all duration-500 ease-in-out ${
                  openIndex === index
                    ? 'max-h-[800px] opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
                style={{
                  overflow: 'hidden',
                }}
              >
                <div className="px-6 pb-6 pt-2">
                  <div className="pl-4 border-l-4 border-[#04BFAD]">
                    <p className="text-[#4D4D59] leading-relaxed text-base">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA final */}
        <div className="text-center mt-16">
          <p className="text-[#4D4D59] mb-6 text-lg">
            ¿Tienes más preguntas? Estamos aquí para ayudarte
          </p>
          <button
            onClick={() => {
              const form = document.getElementById('patient-form-section');
              if (form) {
                form.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#04BFAD] to-[#024959] hover:from-[#024959] hover:to-[#04BFAD] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Icons.MessageCircle className="w-5 h-5" />
            Contáctanos
            <Icons.ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
