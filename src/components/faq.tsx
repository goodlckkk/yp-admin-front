import { Icons } from "./ui/icons";
import { useState } from "react";
import { HeaderPage } from "./header";
import { FooterPage } from "./footer";

export default function FaqPage() {
  const [activeTab, setActiveTab] = useState("pacientes");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const isInstituciones = activeTab === "instituciones";
  
  const bgColor = isInstituciones
    ? "bg-gradient-to-b from-[#001B28] via-[#013C52] to-[#001021]"
    : "bg-white";
  
  const textPrimary = isInstituciones ? "text-white" : "text-[#024959]";
  const textSecondary = isInstituciones ? "text-white/70" : "text-gray-600";
  const borderColor = isInstituciones ? "border-white/10" : "border-gray-200";

  const faqsPacientes = [
    {
      question: "¿Cómo puedo participar en un ensayo clínico?",
      answer: "Regístrate en nuestra plataforma, completa tu perfil médico y explora los ensayos disponibles que coincidan con tu condición. Nuestro equipo te guiará en todo el proceso de selección y te proporcionará toda la información necesaria sobre el ensayo."
    },
    {
      question: "¿Los ensayos clínicos son seguros?",
      answer: "Todos los ensayos en nuestra plataforma están aprobados por autoridades regulatorias chilenas (ISP) y comités de ética independientes. La seguridad de los participantes es la máxima prioridad, y cada estudio cuenta con protocolos estrictos de monitoreo y seguimiento."
    },
    {
      question: "¿Cuánto cuesta participar?",
      answer: "La participación en ensayos clínicos es completamente gratuita. Además, muchos estudios cubren gastos de transporte, proporcionan compensación por el tiempo invertido, y todos los tratamientos y exámenes relacionados con el estudio son sin costo para el participante."
    },
    {
      question: "¿Puedo retirarme de un ensayo clínico una vez que he comenzado?",
      answer: "Sí, absolutamente. Tienes el derecho de retirarte de un ensayo clínico en cualquier momento, sin necesidad de dar explicaciones y sin que esto afecte tu atención médica futura. Tu participación es completamente voluntaria."
    },
    {
      question: "¿Cómo se protege mi información personal?",
      answer: "Cumplimos con todas las normativas de protección de datos personales de Chile (Ley 19.628). Tu información está encriptada, se almacena en servidores seguros, y solo es compartida con el equipo médico del ensayo bajo estrictos protocolos de confidencialidad."
    },
    {
      question: "¿Qué pasa si experimento efectos secundarios?",
      answer: "Cada ensayo cuenta con un equipo médico disponible 24/7 para atender cualquier efecto secundario. Se te proporcionará información de contacto de emergencia y un plan detallado de qué hacer en caso de presentar cualquier síntoma inusual."
    },
    {
      question: "¿Cuánto tiempo dura un ensayo clínico?",
      answer: "La duración varía según el tipo de estudio. Puede ir desde unas pocas semanas hasta varios años. Antes de participar, se te informará claramente sobre la duración estimada, la frecuencia de visitas requeridas y el compromiso de tiempo necesario."
    },
    {
      question: "¿Necesito tener una enfermedad específica para participar?",
      answer: "Depende del ensayo. Algunos estudios buscan personas con condiciones médicas específicas, mientras que otros necesitan voluntarios sanos. Cada ensayo tiene criterios de inclusión y exclusión claramente definidos que te ayudarán a determinar si eres elegible."
    },
    {
      question: "¿Cómo se seleccionan los participantes?",
      answer: "La selección se basa en criterios médicos específicos del estudio, como edad, condición de salud, historial médico y otros factores. El proceso incluye una evaluación inicial, revisión de tu historial médico y, si calificas, una serie de exámenes para confirmar tu elegibilidad."
    }
  ];

  const faqsInstituciones = [
    {
      question: "¿Qué requisitos necesita mi institución para registrarse?",
      answer: "Tu institución debe ser un centro médico, hospital, clínica o centro de investigación reconocido. Necesitarás proporcionar documentación que acredite tu institución y el contacto de un representante autorizado."
    },
    {
      question: "¿Cuánto tiempo toma el proceso de aprobación?",
      answer: "El proceso de verificación y aprobación generalmente toma entre 3 a 5 días hábiles. Nuestro equipo revisará la documentación y se pondrá en contacto contigo para confirmar los detalles."
    },
    {
      question: "¿Cómo funciona la publicación de ensayos clínicos?",
      answer: "Una vez aprobada tu institución, podrás acceder a un panel de administración donde podrás crear, editar y publicar tus ensayos clínicos. Cada ensayo será revisado por nuestro equipo antes de ser visible para los pacientes."
    },
    {
      question: "¿Qué información debo proporcionar sobre los ensayos?",
      answer: "Deberás incluir título del ensayo, descripción detallada, criterios de inclusión/exclusión, fases del estudio, ubicación, contacto del investigador principal, y cualquier información relevante para los pacientes potenciales."
    },
    {
      question: "¿Cómo se protegen los datos de los pacientes?",
      answer: "Cumplimos con todas las normativas de protección de datos y privacidad. Los datos de los pacientes están encriptados y solo son compartidos con las instituciones autorizadas cuando el paciente da su consentimiento explícito."
    },
    {
      question: "¿Hay algún costo por usar la plataforma?",
      answer: "El modelo de precios se discute individualmente con cada institución según sus necesidades. Completa el formulario y nuestro equipo te contactará para discutir las opciones disponibles."
    },
    {
      question: "¿Puedo gestionar múltiples ensayos simultáneamente?",
      answer: "Sí, tu institución puede gestionar múltiples ensayos clínicos de forma simultánea. El panel de administración te permite organizar y monitorear todos tus estudios desde un solo lugar."
    },
    {
      question: "¿Qué soporte técnico ofrecen?",
      answer: "Ofrecemos soporte técnico completo que incluye capacitación inicial, documentación detallada, y asistencia continua por email y teléfono. Para instituciones con múltiples ensayos, ofrecemos soporte prioritario."
    }
  ];

  const faqs = isInstituciones ? faqsInstituciones : faqsPacientes;

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* Header */}
      <HeaderPage 
        setActiveTab={(tab: string) => {
          setActiveTab(tab);
          window.location.href = "/";
        }} 
        activeTab={activeTab} 
      />

      {/* Contenido Principal */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Encabezado */}
          <div className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 ${
              isInstituciones ? "bg-[#04BFAD]/20 text-[#04BFAD]" : "bg-[#A7F2EB] text-[#024959]"
            } px-4 py-2 rounded-full text-sm font-medium mb-6`}>
              <Icons.HelpCircle className="w-4 h-4" />
              Centro de Ayuda
            </div>
            <h1 className={`text-5xl lg:text-6xl font-bold mb-6 ${textPrimary}`}>
              Preguntas Frecuentes
            </h1>
            <p className={`text-xl ${textSecondary} max-w-2xl mx-auto`}>
              Encuentra respuestas a las preguntas más comunes sobre ensayos clínicos y nuestra plataforma
            </p>
          </div>

          {/* Lista de Preguntas */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`border ${borderColor} rounded-xl overflow-hidden transition-all ${
                  isInstituciones ? "bg-white/5 hover:bg-white/10" : "bg-white hover:shadow-md"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className={`w-full px-6 py-5 flex items-center justify-between ${textPrimary} hover:opacity-80 transition-opacity text-left`}
                >
                  <span className="font-semibold text-lg pr-4">{faq.question}</span>
                  <Icons.ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className={`px-6 pb-5 ${textSecondary}`}>
                    <p className="leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sección de Contacto */}
          <div className={`mt-16 p-8 rounded-2xl border ${borderColor} ${
            isInstituciones ? "bg-white/5" : "bg-gradient-to-br from-[#A7F2EB]/20 to-[#04BFAD]/10"
          }`}>
            <div className="text-center">
              <h3 className={`text-2xl font-bold mb-4 ${textPrimary}`}>
                ¿No encontraste lo que buscabas?
              </h3>
              <p className={`${textSecondary} mb-6`}>
                Nuestro equipo está disponible para ayudarte con cualquier consulta
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:contacto@yoparticipo.cl"
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                    isInstituciones
                      ? "bg-[#04BFAD] text-[#024959] hover:bg-[#04BFAD]/90"
                      : "bg-gradient-to-r from-[#04BFAD] to-[#024959] text-white hover:opacity-90"
                  }`}
                >
                  <Icons.Mail className="w-5 h-5" />
                  Enviar un correo
                </a>
                <a
                  href="tel:+56234567890"
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                    isInstituciones
                      ? "border border-white/20 text-white hover:bg-white/10"
                      : "border border-[#024959]/20 text-[#024959] hover:bg-[#E6F6F4]"
                  }`}
                >
                  <Icons.Phone className="w-5 h-5" />
                  +56 2 3456 7890
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <FooterPage activeTab={activeTab} />
    </div>
  );
}
