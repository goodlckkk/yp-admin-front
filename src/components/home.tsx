import { Avatar, AvatarFallback } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { FooterPage } from "./footer"
import { HeaderPage } from "./header"
import { Input } from "./ui/input"
import { useState, useEffect, useRef } from "react"
import { useScrollAnimation } from "../hooks/useScrollAnimation"
import PatientForm from "./ui/patientform"
import TrialPage from "./trials"
import { Icons } from "./ui/icons"
import HeroSlider from "./home/HeroSlider"
import PatientJourney from "./home/PatientJourney"
import SuccessStories from "./home/SuccessStories"
import PrivacySecurity from "./home/PrivacySecurity"
import FAQ from "./home/FAQ"
import { ContactModal } from "./ContactModal"
import { createPatientIntake, getTrials, getPublicStats } from "@/lib/api"
import type { Trial, PublicStats } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"

export default function HomePage() {
  const { elementRef: studiesRef, isVisible: studiesVisible } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: testimonialsRef, isVisible: testimonialsVisible } = useScrollAnimation({ threshold: 0.2 });
  
  const [activeTab, setActiveTab] = useState("pacientes")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showPatientForm, setShowPatientForm] = useState(false)
  const [selectedCondition, setSelectedCondition] = useState("")
  const [isSubmittingIntake, setIsSubmittingIntake] = useState(false)
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [trials, setTrials] = useState<Trial[]>([])
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [publicStats, setPublicStats] = useState<PublicStats | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Intentar cargar estudios clínicos
        const paginatedTrials = await getTrials({ page: 1, limit: 3, status: 'RECRUITING' });
        setTrials(paginatedTrials.data);
        console.log("Estudios clínicos cargados:", paginatedTrials.data);
      } catch (error) {
        console.error("Error fetching trials:", error);
      }

      try {
        // Intentar cargar estadísticas (puede fallar si el endpoint no existe aún)
        const stats = await getPublicStats();
        setPublicStats(stats);
        console.log("Estadísticas cargadas:", stats);
      } catch (error) {
        console.warn("Estadísticas no disponibles (endpoint no desplegado aún):", error);
        // Usar valores por defecto mientras tanto
        setPublicStats({
          patientsConnected: 0,
          activeTrials: 0,
          medicalCenters: 0
        });
      }
    };
    fetchData();
  }, []);


  // Data para Pacientes
  const estadisticasPacientes = [
    { numero: publicStats ? publicStats.patientsConnected.toLocaleString() : "...", label: "Pacientes Incluidos", Icono: Icons.Users, color: "text-blue-600" },
    { numero: publicStats ? publicStats.activeTrials.toString() : "...", label: "Estudios Clínicos Reclutando", Icono: Icons.Microscope, color: "text-green-600" },
    { numero: publicStats ? publicStats.medicalCenters.toString() : "...", label: "Centros Médicos", Icono: Icons.Shield, color: "text-purple-600" },
  ]

  const testimonios = [
    {
      nombre: "Patricia Silva",
      edad: 52,
      condicion: "Artritis Reumatoide",
      testimonio:
        "La plataforma me conectó con un estudio clínico que cambió mi vida. Ahora puedo volver a hacer las cosas que amo.",
      rating: 5,
      ubicacion: "Región Metropolitana",
      avatar: "PS",
    },
    {
      nombre: "Roberto Morales",
      edad: 67,
      condicion: "Parkinson",
      testimonio: "Increíble cómo la tecnología puede ayudar a encontrar esperanza. El proceso fue muy profesional.",
      rating: 5,
      ubicacion: "Región de Valparaíso",
      avatar: "RM",
    },
    {
      nombre: "Carmen López",
      edad: 43,
      condicion: "Esclerosis Múltiple",
      testimonio: "Gracias a este estudio clínico tengo acceso a tratamientos que antes eran imposibles de conseguir.",
      rating: 4,
      ubicacion: "Región del Biobío",
      avatar: "CL",
    },
  ]

  // Data para Médicos

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonios.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handlePatientFormSubmit = async (data: any) => {
    setIsSubmittingIntake(true)
    setSubmissionError(null)
    try {
      const response = await createPatientIntake(data)
      setSubmissionMessage("Solicitud enviada correctamente. Nuestro equipo se comunicará contigo pronto.")
      setShowSuccessModal(true)
      setShowPatientForm(false)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("patient-intake-created", { detail: { intake: response } }))
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo enviar la solicitud"
      setSubmissionError(message)
    } finally {
      setIsSubmittingIntake(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {submissionError && (
        <div className="fixed top-6 inset-x-0 flex justify-center px-4 z-40">
          <div className="bg-white border border-red-200 text-red-700 shadow-lg rounded-2xl px-6 py-4 flex items-center gap-3 max-w-2xl w-full">
            <Icons.AlertTriangle className="w-5 h-5" />
            <span>{submissionError}</span>
            <button
              type="button"
              onClick={() => setSubmissionError(null)}
              className="ml-auto text-red-700 hover:text-red-900"
            >
              <Icons.X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <HeaderPage 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onPostularClick={() => {
          setSelectedCondition("");
          setShowPatientForm(true);
        }}
      />

      {/* CONTENIDO PARA PACIENTES */}
      {activeTab === "pacientes" && (
        <>
          {/* Hero Slider Dinámico */}
          <HeroSlider autoPlayInterval={5000} />

          {/* Camino del Paciente */}
          <PatientJourney onPostularClick={() => setShowPatientForm(true)} />

          {/* Historias que Inspiran */}
          <SuccessStories />

          {/* Privacidad y Seguridad */}
          <PrivacySecurity />

          {/* Estudios Clínicos Destacados */}
          <section 
            ref={studiesRef as any}
            className={`min-h-screen flex items-center py-20 bg-[#F2F2F2] transition-all duration-1000 ${
              studiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-[#024959] mb-4">Estudios Clínicos Destacados</h2>
                <p className="text-xl text-[#4D4D59] max-w-3xl mx-auto">
                  Descubre oportunidades únicas de investigación médica
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {trials.length > 0 ? (
                  trials.map((trial) => (
                    <Card key={trial.id} className="group hover:shadow-2xl transition-all duration-300 border-2 border-[#04BFAD]/20 hover:border-[#04BFAD] bg-white overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-[#04BFAD] to-[#024959]"></div>
                      
                      <CardHeader className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge className={trial.status === "RECRUITING" ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0 px-4 py-1" : "bg-gray-400 text-white border-0 px-4 py-1"}>
                            {trial.status === "RECRUITING" ? "🟢 Reclutando" : trial.status === "CLOSED" ? "⭕ Cerrado" : ""}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-[#4D4D59] bg-[#F2F2F2] px-3 py-1 rounded-full">
                            <Icons.Users className="w-3 h-3 text-[#04BFAD]" />
                            <span className="font-semibold">{trial.current_participants || 0}/{trial.max_participants || 30}</span>
                          </div>
                        </div>
                        
                        <CardTitle className="group-hover:text-[#04BFAD] transition-colors text-[#024959] text-xl leading-tight">
                          {trial.title}
                        </CardTitle>
                        
                        <CardDescription className="text-[#4D4D59] line-clamp-3">
                          {trial.public_description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-[#4D4D59] bg-[#F2F2F2] p-3 rounded-lg">
                          <Icons.MapPin className="w-4 h-4 text-[#04BFAD] flex-shrink-0" />
                          <span className="font-medium">{trial.researchSite?.nombre || 'No especificado'}</span>
                        </div>

                        {/* Barra de progreso de participantes */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs text-[#4D4D59]">
                            <span className="font-medium">Progreso de reclutamiento</span>
                            <span className="font-bold text-[#04BFAD]">
                              {trial.max_participants ? Math.round(((trial.current_participants || 0) / trial.max_participants) * 100) : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#04BFAD] to-[#024959] transition-all duration-500 rounded-full"
                              style={{ width: `${trial.max_participants ? ((trial.current_participants || 0) / trial.max_participants) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <Icons.Microscope className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-xl text-gray-600">Aún no se han agregado estudios clínicos</p>
                    <p className="text-sm text-gray-500 mt-2">Pronto habrá nuevas oportunidades disponibles</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Testimonios */}
          <section 
            ref={testimonialsRef as any}
            className={`min-h-screen flex items-center py-20 px-4 bg-gradient-to-r from-[#024959] to-[#04BFAD] transition-all duration-1000 ${
              testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Historias que Inspiran</h2>
              <p className="text-xl text-[#F2F2F2] mb-12">
                Conoce cómo hemos transformado vidas a través de la investigación médica
              </p>

              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="flex items-center justify-center mb-6">
                  <Avatar className="w-20 h-20 border-4 border-white/30">
                    <AvatarFallback className="text-xl">{testimonios[currentSlide].avatar}</AvatarFallback>
                  </Avatar>
                </div>

                <div className="mb-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Icons.Star
                        key={i}
                        className={`w-5 h-5 ${i < testimonios[currentSlide].rating ? "text-yellow-400" : "text-white/30"}`}
                        filled={i < testimonios[currentSlide].rating}
                      />
                    ))}
                  </div>
                  <blockquote className="text-xl text-white italic mb-6">
                    "{testimonios[currentSlide].testimonio}"
                  </blockquote>
                </div>

                <div className="text-center">
                  <h4 className="text-lg font-semibold text-white">{testimonios[currentSlide].nombre}</h4>
                  <p className="text-blue-100">
                    {testimonios[currentSlide].edad} años • {testimonios[currentSlide].ubicacion}
                  </p>
                  <Badge variant="outline" className="mt-2 border-white/30 text-white bg-white/10">
                    {testimonios[currentSlide].condicion}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-center mt-6 gap-2">
                {testimonios.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide ? "bg-white w-8" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Preguntas Frecuentes */}
          <FAQ />
        </>
      )}

      {/* CONTENIDO PARA INSTITUCIONES */}
      {activeTab === "instituciones" && <TrialPage />}

      {/* Footer */}
      <FooterPage 
        activeTab={activeTab} 
        onContactClick={() => setShowContactModal(true)}
        onFaqClick={() => {
          setActiveTab('pacientes');
          setTimeout(() => {
            const faqSection = document.getElementById('faq');
            if (faqSection) {
              faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        }}
      />

      {/* Modal del Formulario */}
      {showPatientForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {submissionError && (
              <div className="bg-red-50 text-red-700 px-6 py-3 border-b border-red-200 flex items-center gap-2">
                <Icons.AlertTriangle className="w-5 h-5" />
                <span>{submissionError}</span>
                <button
                  type="button"
                  onClick={() => setSubmissionError(null)}
                  className="ml-auto text-red-700 hover:text-red-900"
                >
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>
            )}
            <PatientForm
              condition={selectedCondition}
              onClose={() => {
                setShowPatientForm(false)
                setSubmissionError(null)
              }}
              onSubmit={handlePatientFormSubmit}
              isSubmitting={isSubmittingIntake}
            />
          </div>
        </div>
      )}

      <Dialog
        open={showSuccessModal}
        onOpenChange={(open) => {
          setShowSuccessModal(open)
          if (!open) {
            setSubmissionMessage(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Icons.CheckCircle className="w-5 h-5" />
              Postulación enviada
            </DialogTitle>
            <DialogDescription>
              Hemos recibido tu información y nuestro equipo se pondrá en contacto contigo a la brevedad.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessModal(false)} className="bg-gradient-to-r from-[#04BFAD] to-[#024959]">
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Contacto */}
      <ContactModal 
        isOpen={showContactModal} 
        onClose={() => setShowContactModal(false)} 
      />
    </div>
  )
}
