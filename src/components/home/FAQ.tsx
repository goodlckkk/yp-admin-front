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
    answer: 'Es un estudio para probar nuevos tratamientos y ver si son seguros y efectivos.',
  },
  {
    question: '¿Cómo sé si puedo participar?',
    answer: 'Completa un formulario y nuestro equipo te contactará si hay un estudio para ti.',
  },
  {
    question: '¿Es seguro participar en un ensayo clínico?',
    answer: 'Sí, los ensayos siguen normas de seguridad y siempre te explicamos todo antes de que decidas.',
  },
  {
    question: '¿Tiene algún costo participar?',
    answer: 'No, es totalmente gratuito y en algunos casos te reembolsan gastos.',
  },
  {
    question: '¿Qué tipo de estudios hay?',
    answer: 'Hay estudios para distintas condiciones de salud y en distintas ciudades. Te ayudamos a encontrar el adecuado.',
  },
  {
    question: '¿Puedo salir del estudio si cambio de opinión?',
    answer: 'Por supuesto, puedes dejar de participar en cualquier momento sin ningún problema.',
  },
  {
    question: '¿Qué pasa si tengo efectos secundarios?',
    answer: 'Tendrás atención médica y apoyo. Tu seguridad es lo más importante.',
  },
  {
    question: '¿Cómo se protege mi privacidad?',
    answer: 'Tus datos son confidenciales y solo se usan para encontrar estudios adecuados para ti.',
  },
  {
    question: '¿Cuánto tiempo dura un ensayo clínico?',
    answer: 'Depende del estudio, pero siempre te diremos la duración aproximada antes de que empieces.',
  },
  {
    question: '¿Qué beneficios puedo obtener al participar?',
    answer: 'Puedes acceder a tratamientos nuevos y ayudar a mejorar la salud de otras personas en el futuro.',
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
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
                style={{
                  overflow: 'hidden',
                }}
              >
                <div className="px-6 pb-5 pt-2">
                  <div className="pl-4 border-l-4 border-[#04BFAD]">
                    <p className="text-[#4D4D59] leading-relaxed">
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
