import { Avatar, AvatarFallback } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { FooterPage } from "./footer"
import { HeaderPage } from "./header"
import { Input } from "./ui/input"
import { useState, useEffect } from "react"
import MedicsPage from "./medics"
import PatientForm from "./ui/patientform"
import TrialsPage from "./trials"
import { Icons } from "./ui/icons"
import { createPatientIntake, getTrials } from "@/lib/api"
import type { Trial } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [activeTab, setActiveTab] = useState("pacientes")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showPatientForm, setShowPatientForm] = useState(false)
  const [selectedCondition, setSelectedCondition] = useState("")
  const [isSubmittingIntake, setIsSubmittingIntake] = useState(false)
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [trials, setTrials] = useState<Trial[]>([])
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    const fetchTrials = async () => {
      try {
        const paginatedTrials = await getTrials({ page: 1, limit: 3, status: 'RECRUITING' });
        setTrials(paginatedTrials.data);
      } catch (error) {
        console.error("Error fetching trials:", error);
      }
    };
    fetchTrials();
  }, []);


  // Data para Pacientes
  const estadisticasPacientes = [
    { numero: "2,847", label: "Pacientes Conectados", Icono: Icons.Users, color: "text-blue-600" },
    { numero: "156", label: "Ensayos Activos", Icono: Icons.Microscope, color: "text-green-600" },
    { numero: "89%", label: "Tasa de Éxito", Icono: Icons.Heart, color: "text-red-600" },
    { numero: "45", label: "Centros Médicos", Icono: Icons.Shield, color: "text-purple-600" },
  ]

  const testimonios = [
    {
      nombre: "Patricia Silva",
      edad: 52,
      condicion: "Artritis Reumatoide",
      testimonio:
        "La plataforma me conectó con un ensayo que cambió mi vida. Ahora puedo volver a hacer las cosas que amo.",
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
      testimonio: "Gracias a este ensayo tengo acceso a tratamientos que antes eran imposibles de conseguir.",
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSubmissionMessage(null)
      setSubmissionError(null)
      setSelectedCondition(searchQuery)
      setShowPatientForm(true)
    }
  }

  const handlePatientFormSubmit = async (data: any) => {
    setIsSubmittingIntake(true)
    setSubmissionError(null)
    try {
      const response = await createPatientIntake({
        ...data,
        condicionPrincipal: data.condicionPrincipal || selectedCondition,
      })
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
      <HeaderPage setActiveTab={setActiveTab} activeTab={activeTab} showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} />

      {/* CONTENIDO PARA PACIENTES */}
      {activeTab === "pacientes" && (
        <>
          {/* Hero Pacientes */}
          <section className="pt-32 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Icons.Heart className="w-4 h-4" />
                  Tu salud es nuestra prioridad
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold mb-6">
                  <span className="text-gradient">Encuentra</span> el ensayo
                  <br />
                  <span className="text-gray-900">perfecto para ti</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                  Accede a tratamientos innovadores y sé parte del futuro de la medicina. Miles de pacientes ya
                  confiaron en nosotros.
                </p>

                <div className="max-w-2xl mx-auto mb-12">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20"></div>
                    <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-white/20">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            <Icons.Search className="w-5 h-5 text-gray-400" />
                          </div>
                          <Input
                            placeholder="Ingresa tu condición médica y postula a nuestros ensayos"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="pl-12 h-14 text-lg border-0 bg-gray-50 rounded-xl"
                          />
                        </div>
                        <Button
                          onClick={handleSearch}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14 px-8 rounded-xl"
                        >
                          <Icons.Search className="w-5 h-5 mr-2" />
                          Postular
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {estadisticasPacientes.map((stat, index) => (
                    <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center justify-center mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                          <stat.Icono className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{stat.numero}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Ensayos Destacados */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Ensayos Clínicos Destacados</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Descubre oportunidades únicas de investigación médica
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {trials.map((trial) => (
                  <Card key={trial.id} className="group hover:shadow-2xl transition-all border-0 bg-white/80">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <Badge className={trial.status === "RECRUITING" ? "bg-green-500 text-white" : ""}>
                          {trial.status}
                        </Badge>
                      </div>
                      <CardTitle className="group-hover:text-blue-600 transition-colors">{trial.title}</CardTitle>
                      <CardDescription>{trial.public_description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Icons.MapPin className="w-4 h-4 text-blue-500" />
                          <span>{trial.clinic_city}</span>
                        </div>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl">
                        <Icons.Target className="w-4 h-4 mr-2" />
                        Aplicar Ahora
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonios */}
          <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Historias que Inspiran</h2>
              <p className="text-xl text-blue-100 mb-12">
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
                      index === currentSlide ? "bg-white w-8" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
      {/* CONTENIDO PARA INSTITUCIONES */}
      {activeTab === "instituciones" && <TrialsPage />}

      {/* CONTENIDO PARA MÉDICOS */}
      {activeTab === "medicos" && <MedicsPage />}

      {/* Footer */}
      <FooterPage />

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
            <Button onClick={() => setShowSuccessModal(false)} className="bg-gradient-to-r from-blue-600 to-purple-600">
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
