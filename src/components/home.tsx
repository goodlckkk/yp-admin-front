import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input, InputWithLabel } from "./ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Progress } from "./ui/progress"
import { Icons } from "./ui/Icons"
import PatientForm from "./ui/patientform"
import { Textarea, TextareaWithLabel } from "./ui/textarea"
import { Label } from "./ui/label"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [activeTab, setActiveTab] = useState("pacientes")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showPatientForm, setShowPatientForm] = useState(false)
  const [selectedCondition, setSelectedCondition] = useState("")
  const [formContactoInstitucion, setFormContactoInstitucion] = useState({
    nombreInstitucion: "",
    nombreContacto: "",
    email: "",
    telefono: "",
    mensaje: "",
  })
  const [formContactoMedico, setFormContactoMedico] = useState({
    nombreCompleto: "",
    especialidad: "",
    institucion: "",
    email: "",
    telefono: "",
    experiencia: "",
    mensaje: "",
  })

  // Data para Pacientes
  const estadisticasPacientes = [
    { numero: "2,847", label: "Pacientes Conectados", Icono: Icons.Users, color: "text-blue-600" },
    { numero: "156", label: "Ensayos Activos", Icono: Icons.Microscope, color: "text-green-600" },
    { numero: "89%", label: "Tasa de Éxito", Icono: Icons.Heart, color: "text-red-600" },
    { numero: "45", label: "Centros Médicos", Icono: Icons.Shield, color: "text-purple-600" },
  ]

  const ensayosDestacados = [
    {
      id: 1,
      titulo: "Innovación en Diabetes",
      descripcion: "Terapia génica revolucionaria para diabetes tipo 1 con células madre.",
      ubicacion: "Santiago",
      progreso: 75,
      participantes: "18-65 años",
      duracion: "24 meses",
      estado: "Reclutando",
      urgencia: "Alta",
      beneficios: ["Tratamiento gratuito", "Seguimiento especializado", "Medicación incluida"],
    },
    {
      id: 2,
      titulo: "Inmunoterapia Avanzada",
      descripcion: "Tratamiento personalizado contra el cáncer usando inteligencia artificial.",
      ubicacion: "Valparaíso",
      progreso: 60,
      participantes: "25-75 años",
      duracion: "18 meses",
      estado: "Reclutando",
      urgencia: "Media",
      beneficios: ["Terapia personalizada", "Análisis genético", "Equipo multidisciplinario"],
    },
    {
      id: 3,
      titulo: "Neuroplasticidad Cognitiva",
      descripcion: "Estimulación cerebral no invasiva para mejorar la memoria y cognición.",
      ubicacion: "Concepción",
      progreso: 40,
      participantes: "50-80 años",
      duracion: "12 meses",
      estado: "Próximamente",
      urgencia: "Baja",
      beneficios: ["Evaluación neurológica", "Terapia innovadora", "Seguimiento continuo"],
    },
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

  // Data para Instituciones
  const estadisticasInstituciones = [
    { numero: "300%", label: "Más Reclutamiento", Icono: Icons.Target, color: "text-indigo-600" },
    { numero: "45", label: "Instituciones Activas", Icono: Icons.Shield, color: "text-purple-600" },
    { numero: "2.8K", label: "Pacientes en Red", Icono: Icons.Users, color: "text-blue-600" },
    { numero: "24/7", label: "Soporte Técnico", Icono: Icons.Zap, color: "text-green-600" },
  ]

  const planesInstituciones = [
    {
      nombre: "Básico",
      precio: "Gratis",
      descripcion: "Ideal para comenzar",
      caracteristicas: ["Hasta 2 ensayos simultáneos", "Dashboard básico", "Soporte por email", "Reportes mensuales"],
      destacado: false,
    },
    {
      nombre: "Profesional",
      precio: "$99",
      periodo: "/mes",
      descripcion: "Para instituciones activas",
      caracteristicas: [
        "Ensayos ilimitados",
        "Dashboard avanzado con IA",
        "Soporte prioritario 24/7",
        "Reportes en tiempo real",
        "Matching automático de pacientes",
        "API de integración",
      ],
      destacado: true,
    },
    {
      nombre: "Enterprise",
      precio: "Personalizado",
      descripcion: "Solución a medida",
      caracteristicas: [
        "Todo de Profesional",
        "Cuenta dedicada",
        "Integración personalizada",
        "Capacitación on-site",
        "SLA garantizado",
      ],
      destacado: false,
    },
  ]

  // Data para Médicos
  const estadisticasMedicos = [
    { numero: "450+", label: "Médicos Registrados", Icono: Icons.User, color: "text-teal-600" },
    { numero: "85%", label: "Satisfacción", Icono: Icons.Star, color: "text-yellow-600" },
    { numero: "156", label: "Estudios Activos", Icono: Icons.Microscope, color: "text-blue-600" },
    { numero: "40h", label: "Ahorro Promedio", Icono: Icons.Clock, color: "text-purple-600" },
  ]

  const especialidades = [
    { nombre: "Oncología", ensayos: 34, medicos: 78, icon: Icons.Activity },
    { nombre: "Cardiología", ensayos: 28, medicos: 65, icon: Icons.Heart },
    { nombre: "Neurología", ensayos: 22, medicos: 52, icon: Icons.Target },
    { nombre: "Endocrinología", ensayos: 18, medicos: 43, icon: Icons.Zap },
    { nombre: "Reumatología", ensayos: 15, medicos: 38, icon: Icons.Shield },
    { nombre: "Hematología", ensayos: 12, medicos: 29, icon: Icons.Microscope },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonios.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSelectedCondition(searchQuery)
      setShowPatientForm(true)
    }
  }

  const handleSubmitContactoInstitucion = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Contacto Institución:", formContactoInstitucion)
    alert("¡Gracias por tu interés! Nos contactaremos contigo en menos de 24 horas.")
    setFormContactoInstitucion({
      nombreInstitucion: "",
      nombreContacto: "",
      email: "",
      telefono: "",
      mensaje: "",
    })
  }

  const handleSubmitContactoMedico = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Contacto Médico:", formContactoMedico)
    alert("¡Bienvenido! Revisaremos tu perfil y te contactaremos pronto.")
    setFormContactoMedico({
      nombreCompleto: "",
      especialidad: "",
      institucion: "",
      email: "",
      telefono: "",
      experiencia: "",
      mensaje: "",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="fixed top-4 left-4 right-4 z-50 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Icons.Microscope className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse-slow"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">yoParticipo</h1>
                <p className="text-xs text-gray-500">Chile</p>
              </div>
            </div>

            <nav className="hidden md:flex bg-gray-100 rounded-full p-1">
              {["pacientes", "instituciones", "medicos"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost">Iniciar Sesión</Button>
              <Button className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Comenzar
              </Button>
            </div>

            <button className="md:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              <Icons.Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

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
                            placeholder="¿Qué condición médica tienes?"
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
                          Buscar Ensayos
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
          <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Ensayos Clínicos Destacados</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Descubre oportunidades únicas de investigación médica
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {ensayosDestacados.map((ensayo) => (
                  <Card key={ensayo.id} className="group hover:shadow-2xl transition-all border-0 bg-white/80">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <Badge className={ensayo.estado === "Reclutando" ? "bg-green-500 text-white" : ""}>
                          {ensayo.estado}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`${
                            ensayo.urgencia === "Alta"
                              ? "border-red-500 text-red-600"
                              : ensayo.urgencia === "Media"
                                ? "border-yellow-500 text-yellow-600"
                                : "border-green-500 text-green-600"
                          }`}
                        >
                          Urgencia {ensayo.urgencia}
                        </Badge>
                      </div>
                      <CardTitle className="group-hover:text-blue-600 transition-colors">{ensayo.titulo}</CardTitle>
                      <CardDescription>{ensayo.descripcion}</CardDescription>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progreso</span>
                          <span>{ensayo.progreso}%</span>
                        </div>
                        <Progress value={ensayo.progreso} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Icons.MapPin className="w-4 h-4 text-blue-500" />
                          <span>{ensayo.ubicacion}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Icons.Users className="w-4 h-4 text-green-500" />
                          <span>Edades: {ensayo.participantes}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Icons.Clock className="w-4 h-4 text-purple-500" />
                          <span>Duración: {ensayo.duracion}</span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Beneficios incluidos:</h4>
                        <div className="space-y-1">
                          {ensayo.beneficios.map((beneficio, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              <span>{beneficio}</span>
                            </div>
                          ))}
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
      {activeTab === "instituciones" && (
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Hero Instituciones */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Icons.Shield className="w-4 h-4" />
                Soluciones para instituciones de salud
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold mb-6">
                <span className="text-gradient">Publica</span> tus ensayos
                <br />
                <span className="text-gray-900">y alcanza más pacientes</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                La plataforma líder para difundir ensayos clínicos en Chile. Conecta con miles de pacientes interesados
                y acelera tu investigación.
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {estadisticasInstituciones.map((stat, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
                        <stat.Icono className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.numero}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Planes y Precios */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Planes que se Adaptan a Ti</h2>
                <p className="text-xl text-gray-600">Elige el plan perfecto para tu institución</p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {planesInstituciones.map((plan, index) => (
                  <Card
                    key={index}
                    className={`${plan.destacado ? "ring-4 ring-indigo-500 scale-105" : ""} bg-white/80 backdrop-blur-sm border-0 hover:shadow-2xl transition-all`}
                  >
                    <CardHeader>
                      {plan.destacado && <Badge className="bg-indigo-600 text-white mb-4 w-fit">Más Popular</Badge>}
                      <CardTitle className="text-2xl">{plan.nombre}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-gray-900">{plan.precio}</span>
                        {plan.periodo && <span className="text-gray-600">{plan.periodo}</span>}
                      </div>
                      <CardDescription className="mt-2">{plan.descripcion}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {plan.caracteristicas.map((caract, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Icons.Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{caract}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className={`w-full rounded-xl ${
                          plan.destacado
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                        }`}
                      >
                        {plan.destacado ? "Comenzar Ahora" : "Más Información"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Formulario de Contacto */}
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Listo para Empezar?</h2>
                <p className="text-xl text-gray-600">Completa el formulario y nos contactaremos contigo</p>
              </div>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
                <CardContent className="pt-8">
                  <form onSubmit={handleSubmitContactoInstitucion} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <InputWithLabel
                        label="Nombre de la Institución *"
                        value={formContactoInstitucion.nombreInstitucion}
                        onChange={(e) =>
                          setFormContactoInstitucion((prev) => ({ ...prev, nombreInstitucion: e.target.value }))
                        }
                        placeholder="Ej: Clínica Santa María"
                        required
                      />
                      <InputWithLabel
                        label="Nombre del Contacto *"
                        value={formContactoInstitucion.nombreContacto}
                        onChange={(e) =>
                          setFormContactoInstitucion((prev) => ({ ...prev, nombreContacto: e.target.value }))
                        }
                        placeholder="Ej: Dr. Juan Pérez"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <InputWithLabel
                        label="Email *"
                        type="email"
                        value={formContactoInstitucion.email}
                        onChange={(e) => setFormContactoInstitucion((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="contacto@institucion.cl"
                        required
                      />
                      <InputWithLabel
                        label="Teléfono *"
                        value={formContactoInstitucion.telefono}
                        onChange={(e) => setFormContactoInstitucion((prev) => ({ ...prev, telefono: e.target.value }))}
                        placeholder="+56 9 1234 5678"
                        required
                      />
                    </div>

                    <TextareaWithLabel
                      label="Cuéntanos sobre tu institución *"
                      value={formContactoInstitucion.mensaje}
                      onChange={(e) => setFormContactoInstitucion((prev) => ({ ...prev, mensaje: e.target.value }))}
                      placeholder="¿Qué ensayos te gustaría publicar? ¿Cuántos estudios realizas al año?"
                      className="min-h-[120px]"
                      required
                    />

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg py-6 rounded-xl"
                    >
                      <Icons.Mail className="w-5 h-5 mr-2" />
                      Solicitar Información
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="mt-12 text-center">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">¿Necesitas ayuda?</h3>
                  <p className="text-gray-600 mb-6">Nuestro equipo está listo para responder tus consultas</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Icons.Phone className="w-4 h-4 text-indigo-600" />
                      <span>+56 2 3456 7890</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Icons.Mail className="w-4 h-4 text-indigo-600" />
                      <span>instituciones@yoparticipo.cl</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO PARA MÉDICOS */}
      {activeTab === "medicos" && (
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Hero Médicos */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Icons.User className="w-4 h-4" />
                Para profesionales de la salud
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold mb-6">
                <span className="text-gradient">Impulsa</span> tu carrera
                <br />
                <span className="text-gray-900">en investigación clínica</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                Únete a la red de médicos investigadores más grande de Chile. Accede a estudios innovadores y contribuye
                al avance de la medicina.
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {estadisticasMedicos.map((stat, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-teal-100 to-cyan-100 flex items-center justify-center">
                        <stat.Icono className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.numero}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Especialidades */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Especialidades en Demanda</h2>
                <p className="text-xl text-gray-600">Encuentra estudios en tu área de especialización</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {especialidades.map((esp, index) => (
                  <Card
                    key={index}
                    className="bg-white/80 backdrop-blur-sm border-0 hover:shadow-xl transition-all group cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <esp.icon className="w-7 h-7 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="group-hover:text-teal-600 transition-colors">{esp.nombre}</CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Icons.Microscope className="w-4 h-4" />
                              <span>{esp.ensayos} estudios</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Icons.User className="w-4 h-4" />
                              <span>{esp.medicos} médicos</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {/* Beneficios */}
            <div className="mb-20">
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="bg-white/80 backdrop-blur-sm border-0 hover:shadow-xl transition-all text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icons.Target className="w-8 h-8 text-teal-600" />
                    </div>
                    <CardTitle>Matching Inteligente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      IA que conecta automáticamente a pacientes ideales con tus criterios de selección.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 hover:shadow-xl transition-all text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icons.FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle>Gestión Simplificada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Dashboard completo para administrar consentimientos, datos y seguimiento de participantes.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 hover:shadow-xl transition-all text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icons.Shield className="w-8 h-8 text-purple-600" />
                    </div>
                    <CardTitle>Cumplimiento Normativo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Plataforma certificada que cumple con ISP, CEICH y estándares internacionales GCP.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Formulario de Registro */}
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Únete a Nuestra Red</h2>
                <p className="text-xl text-gray-600">Completa el formulario y comienza tu camino como investigador</p>
              </div>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
                <CardContent className="pt-8">
                  <form onSubmit={handleSubmitContactoMedico} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <InputWithLabel
                        label="Nombre Completo *"
                        value={formContactoMedico.nombreCompleto}
                        onChange={(e) => setFormContactoMedico((prev) => ({ ...prev, nombreCompleto: e.target.value }))}
                        placeholder="Dr. Juan Pérez"
                        required
                      />
                      <InputWithLabel
                        label="Especialidad *"
                        value={formContactoMedico.especialidad}
                        onChange={(e) => setFormContactoMedico((prev) => ({ ...prev, especialidad: e.target.value }))}
                        placeholder="Ej: Oncología"
                        required
                      />
                    </div>

                    <InputWithLabel
                      label="Institución Actual *"
                      value={formContactoMedico.institucion}
                      onChange={(e) => setFormContactoMedico((prev) => ({ ...prev, institucion: e.target.value }))}
                      placeholder="Ej: Hospital Clínico Universidad de Chile"
                      required
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                      <InputWithLabel
                        label="Email *"
                        type="email"
                        value={formContactoMedico.email}
                        onChange={(e) => setFormContactoMedico((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="medico@institucion.cl"
                        required
                      />
                      <InputWithLabel
                        label="Teléfono *"
                        value={formContactoMedico.telefono}
                        onChange={(e) => setFormContactoMedico((prev) => ({ ...prev, telefono: e.target.value }))}
                        placeholder="+56 9 1234 5678"
                        required
                      />
                    </div>

                    <InputWithLabel
                      label="Años de Experiencia *"
                      value={formContactoMedico.experiencia}
                      onChange={(e) => setFormContactoMedico((prev) => ({ ...prev, experiencia: e.target.value }))}
                      placeholder="Ej: 10 años"
                      required
                    />

                    <TextareaWithLabel
                      label="¿Por qué quieres unirte? *"
                      value={formContactoMedico.mensaje}
                      onChange={(e) => setFormContactoMedico((prev) => ({ ...prev, mensaje: e.target.value }))}
                      placeholder="Cuéntanos sobre tu interés en la investigación clínica..."
                      className="min-h-[120px]"
                      required
                    />

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-lg py-6 rounded-xl"
                    >
                      <Icons.User className="w-5 h-5 mr-2" />
                      Solicitar Registro
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="mt-12 text-center">
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-8 border border-teal-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">¿Preguntas?</h3>
                  <p className="text-gray-600 mb-6">Contáctanos para conocer más sobre los beneficios</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Icons.Phone className="w-4 h-4 text-teal-600" />
                      <span>+56 2 3456 7891</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Icons.Mail className="w-4 h-4 text-teal-600" />
                      <span>medicos@yoparticipo.cl</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-16 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Icons.Microscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">yoParticipo Chile</h3>
                  <p className="text-gray-400 text-sm">Conectando ciencia y esperanza</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Revolucionamos el acceso a ensayos clínicos en Chile, conectando pacientes con innovación médica.
              </p>
              <div className="flex flex-col gap-2 text-gray-400">
                <div className="flex items-center gap-2">
                  <Icons.Phone className="w-4 h-4" />
                  <span className="text-sm">+56 2 3456 7890</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.Mail className="w-4 h-4" />
                  <span className="text-sm">contacto@yoparticipo.cl</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Plataforma</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Para Pacientes
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Para Instituciones
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Para Médicos
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Ayuda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 yoParticipo Chile. Innovando el futuro de la medicina.</p>
          </div>
        </div>
      </footer>

      {/* Modal del Formulario */}
      {showPatientForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PatientForm
              condition={selectedCondition}
              onClose={() => setShowPatientForm(false)}
              onSubmit={(data) => {
                console.log("Datos:", data)
                alert("¡Registro completado!")
                setShowPatientForm(false)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
