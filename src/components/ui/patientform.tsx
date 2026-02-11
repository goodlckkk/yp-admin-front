"use client"

import { useState } from "react"
import { Button } from "./button"
import { InputWithLabel } from "./input"
import { TextareaWithLabel } from "./textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"
import { Checkbox } from "./checkbox"
import { SelectWithLabel } from "./select"
import { Icons } from "./icons"
import { Cie10Autocomplete } from "./Cie10Autocomplete"
import { Cie10SingleAutocomplete } from "./Cie10SingleAutocomplete"

interface PatientFormProps {
  condition: string
  onClose: () => void
  onSubmit: (data: any) => void
  isSubmitting?: boolean
}

export default function PatientForm({ condition, onClose, onSubmit, isSubmitting = false }: PatientFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [condicionSeleccionada, setCondicionSeleccionada] = useState("")
  const [condicionPersonalizada, setCondicionPersonalizada] = useState("")
  const [mostrarOtrasEnfermedades, setMostrarOtrasEnfermedades] = useState(false)
  const [mostrarTerminos, setMostrarTerminos] = useState(false)
  const [mostrarPrivacidad, setMostrarPrivacidad] = useState(false)
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    rut: "",
    fechaNacimiento: "",
    sexo: "",
    telefonoCodigoPais: "+56", // Código de país por defecto (Chile)
    telefonoNumero: "", // Número sin código
    email: "",
    region: "",
    comuna: "",
    direccion: "",
    condicionPrincipal: condition,
    condicionPrincipalCodigo: "", // Código CIE-10 de la condición principal
    patologias: [] as string[], // Checkboxes de patologías prevalentes
    tieneOtrasEnfermedades: false,
    otrasEnfermedades: "",
    aceptaTerminos: false,
    aceptaPrivacidad: false,
    aceptaAlmacenamiento15Anos: false,
  })

  // Patologías prevalentes en Chile (según feedback)
  const patologiasPrevalentes = [
    "Hipertensión",
    "Diabetes",
    "Enfermedad pulmonar",
    "EPOC (Enfermedad Pulmonar Obstructiva Crónica)",
    "Enfermedad coronaria (infarto agudo al miocardio)",
    "Insuficiencia cardíaca",
    "Enfermedad renal crónica",
    "Asma",
    "Obesidad",
    "Fumador/a"
  ]

  // Manejar selección de patologías
  const handlePatologiaToggle = (patologia: string) => {
    setFormData((prev) => {
      const patologias = prev.patologias.includes(patologia)
        ? prev.patologias.filter(p => p !== patologia)
        : [...prev.patologias, patologia]
      return { ...prev, patologias }
    })
  }

  // Solo código de país de Chile
  const codigosPais = [
    { codigo: "+56", pais: "CL" },
  ]

  const condicionesMedicas = [
    { value: "diabetes_tipo_1", label: "Diabetes Tipo 1" },
    { value: "diabetes_tipo_2", label: "Diabetes Tipo 2" },
    { value: "hipertension", label: "Hipertensión Arterial" },
    { value: "asma", label: "Asma" },
    { value: "epoc", label: "EPOC (Enfermedad Pulmonar Obstructiva Crónica)" },
    { value: "artritis_reumatoide", label: "Artritis Reumatoide" },
    { value: "osteoartritis", label: "Osteoartritis" },
    { value: "cancer_mama", label: "Cáncer de Mama" },
    { value: "cancer_pulmon", label: "Cáncer de Pulmón" },
    { value: "cancer_colon", label: "Cáncer de Colon" },
    { value: "cancer_prostata", label: "Cáncer de Próstata" },
    { value: "leucemia", label: "Leucemia" },
    { value: "linfoma", label: "Linfoma" },
    { value: "alzheimer", label: "Enfermedad de Alzheimer" },
    { value: "parkinson", label: "Enfermedad de Parkinson" },
    { value: "esclerosis_multiple", label: "Esclerosis Múltiple" },
    { value: "epilepsia", label: "Epilepsia" },
    { value: "depresion", label: "Depresión" },
    { value: "ansiedad", label: "Trastorno de Ansiedad" },
    { value: "bipolar", label: "Trastorno Bipolar" },
    { value: "esquizofrenia", label: "Esquizofrenia" },
    { value: "hepatitis_b", label: "Hepatitis B" },
    { value: "hepatitis_c", label: "Hepatitis C" },
    { value: "vih", label: "VIH/SIDA" },
    { value: "lupus", label: "Lupus Eritematoso Sistémico" },
    { value: "psoriasis", label: "Psoriasis" },
    { value: "enfermedad_crohn", label: "Enfermedad de Crohn" },
    { value: "colitis_ulcerosa", label: "Colitis Ulcerosa" },
    { value: "insuficiencia_renal", label: "Insuficiencia Renal Crónica" },
    { value: "insuficiencia_cardiaca", label: "Insuficiencia Cardíaca" },
    { value: "fibromialgia", label: "Fibromialgia" },
    { value: "migraña", label: "Migraña Crónica" },
    { value: "otra", label: "Otra condición (especificar)" },
  ]

  const regionesChile = [
    { value: "arica", label: "Región de Arica y Parinacota" },
    { value: "tarapaca", label: "Región de Tarapacá" },
    { value: "antofagasta", label: "Región de Antofagasta" },
    { value: "atacama", label: "Región de Atacama" },
    { value: "coquimbo", label: "Región de Coquimbo" },
    { value: "valparaiso", label: "Región de Valparaíso" },
    { value: "metropolitana", label: "Región Metropolitana" },
    { value: "ohiggins", label: "Región del Libertador Gral. Bernardo O'Higgins" },
    { value: "maule", label: "Región del Maule" },
    { value: "nuble", label: "Región de Ñuble" },
    { value: "biobio", label: "Región del Biobío" },
    { value: "araucania", label: "Región de La Araucanía" },
    { value: "rios", label: "Región de Los Ríos" },
    { value: "lagos", label: "Región de Los Lagos" },
    { value: "aysen", label: "Región de Aysén del Gral. Carlos Ibáñez del Campo" },
    { value: "magallanes", label: "Región de Magallanes y de la Antártica Chilena" },
  ]

  const comunasPorRegion: Record<string, { value: string; label: string }[]> = {
    arica: [
      { value: "arica", label: "Arica" },
      { value: "camarones", label: "Camarones" },
      { value: "putre", label: "Putre" },
      { value: "general_lagos", label: "General Lagos" },
    ],
    tarapaca: [
      { value: "iquique", label: "Iquique" },
      { value: "alto_hospicio", label: "Alto Hospicio" },
      { value: "pica", label: "Pica" },
      { value: "pozo_almonte", label: "Pozo Almonte" },
    ],
    antofagasta: [
      { value: "antofagasta", label: "Antofagasta" },
      { value: "calama", label: "Calama" },
      { value: "tocopilla", label: "Tocopilla" },
      { value: "mejillones", label: "Mejillones" },
      { value: "taltal", label: "Taltal" },
    ],
    atacama: [
      { value: "copiapo", label: "Copiapó" },
      { value: "caldera", label: "Caldera" },
      { value: "chanaral", label: "Chañaral" },
      { value: "vallenar", label: "Vallenar" },
    ],
    coquimbo: [
      { value: "la_serena", label: "La Serena" },
      { value: "coquimbo", label: "Coquimbo" },
      { value: "ovalle", label: "Ovalle" },
      { value: "illapel", label: "Illapel" },
      { value: "vicuna", label: "Vicuña" },
    ],
    valparaiso: [
      { value: "valparaiso", label: "Valparaíso" },
      { value: "vina_del_mar", label: "Viña del Mar" },
      { value: "quilpue", label: "Quilpué" },
      { value: "villa_alemana", label: "Villa Alemana" },
      { value: "san_antonio", label: "San Antonio" },
      { value: "quillota", label: "Quillota" },
      { value: "los_andes", label: "Los Andes" },
    ],
    metropolitana: [
      { value: "santiago", label: "Santiago" },
      { value: "maipu", label: "Maipú" },
      { value: "la_florida", label: "La Florida" },
      { value: "puente_alto", label: "Puente Alto" },
      { value: "las_condes", label: "Las Condes" },
      { value: "providencia", label: "Providencia" },
      { value: "vitacura", label: "Vitacura" },
      { value: "lo_barnechea", label: "Lo Barnechea" },
      { value: "nunoa", label: "Ñuñoa" },
      { value: "san_miguel", label: "San Miguel" },
      { value: "la_reina", label: "La Reina" },
      { value: "penalolen", label: "Peñalolén" },
      { value: "macul", label: "Macul" },
      { value: "pudahuel", label: "Pudahuel" },
      { value: "cerrillos", label: "Cerrillos" },
      { value: "estacion_central", label: "Estación Central" },
    ],
    ohiggins: [
      { value: "rancagua", label: "Rancagua" },
      { value: "san_fernando", label: "San Fernando" },
      { value: "rengo", label: "Rengo" },
      { value: "pichilemu", label: "Pichilemu" },
      { value: "santa_cruz", label: "Santa Cruz" },
    ],
    maule: [
      { value: "talca", label: "Talca" },
      { value: "curico", label: "Curicó" },
      { value: "linares", label: "Linares" },
      { value: "cauquenes", label: "Cauquenes" },
      { value: "constitucion", label: "Constitución" },
    ],
    nuble: [
      { value: "chillan", label: "Chillán" },
      { value: "chillan_viejo", label: "Chillán Viejo" },
      { value: "san_carlos", label: "San Carlos" },
      { value: "bulnes", label: "Bulnes" },
    ],
    biobio: [
      { value: "concepcion", label: "Concepción" },
      { value: "talcahuano", label: "Talcahuano" },
      { value: "los_angeles", label: "Los Ángeles" },
      { value: "chillan", label: "Chillán" },
      { value: "coronel", label: "Coronel" },
      { value: "san_pedro", label: "San Pedro de la Paz" },
      { value: "tome", label: "Tomé" },
    ],
    araucania: [
      { value: "temuco", label: "Temuco" },
      { value: "angol", label: "Angol" },
      { value: "villarrica", label: "Villarrica" },
      { value: "pucon", label: "Pucón" },
      { value: "victoria", label: "Victoria" },
    ],
    rios: [
      { value: "valdivia", label: "Valdivia" },
      { value: "la_union", label: "La Unión" },
      { value: "rio_bueno", label: "Río Bueno" },
      { value: "panguipulli", label: "Panguipulli" },
    ],
    lagos: [
      { value: "puerto_montt", label: "Puerto Montt" },
      { value: "osorno", label: "Osorno" },
      { value: "castro", label: "Castro" },
      { value: "ancud", label: "Ancud" },
      { value: "puerto_varas", label: "Puerto Varas" },
    ],
    aysen: [
      { value: "coyhaique", label: "Coyhaique" },
      { value: "puerto_aysen", label: "Puerto Aysén" },
      { value: "chile_chico", label: "Chile Chico" },
    ],
    magallanes: [
      { value: "punta_arenas", label: "Punta Arenas" },
      { value: "puerto_natales", label: "Puerto Natales" },
      { value: "porvenir", label: "Porvenir" },
    ],
  }

  const sexoOptions = [
    { value: "masculino", label: "Hombre" },
    { value: "femenino", label: "Mujer" },
  ]

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }


  // Función para validar formato de email
  const isValidEmail = (email: string): boolean => {
    // Regex para validar email: debe tener @ y un dominio válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        // Validar que tenga datos personales y RUT válido
        const hasPersonalData = !!(formData.nombres && formData.apellidos && formData.rut && formData.fechaNacimiento && formData.sexo)
        
        if (!hasPersonalData) return false
        
        // Validar longitud del RUT
        const cleanRut = formData.rut.replace(/[^0-9kK]/g, "")
        if (cleanRut.length < 8 || cleanRut.length > 9) return false
        
        return true
      case 2:
        // Validar que tenga teléfono, email válido, región y comuna
        return !!(
          formData.telefonoNumero && 
          formData.email && 
          isValidEmail(formData.email) && 
          formData.region && 
          formData.comuna
        )
      case 3:
        // Validar que tenga condición principal
        return !!formData.condicionPrincipal
      case 4:
        return !!(formData.aceptaTerminos && formData.aceptaPrivacidad && formData.aceptaAlmacenamiento15Anos)
      default:
        return true
    }
  }

  const formatRUT = (value: string) => {
    const cleaned = value.replace(/[^0-9kK]/g, "")
    if (cleaned.length <= 1) return cleaned
    const number = cleaned.slice(0, -1)
    const dv = cleaned.slice(-1)
    const formattedNumber = number.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    return `${formattedNumber}-${dv}`
  }

  const formatPhoneNumber = (value: string) => {
    // Remover todo excepto números
    const cleaned = value.replace(/[^0-9]/g, "")
    
    // Si está vacío, retornar vacío
    if (cleaned.length === 0) return ""
    
    // Limitar a 9 dígitos (formato chileno)
    const limited = cleaned.slice(0, 9)
    
    // Retornar solo los números sin prefijo
    return limited
  }

  return (
    <div className="p-8 bg-gradient-to-br from-[#F8FFFE] to-[#E8F9F7]">
      {/* Header con logo y título centrado */}
      <div className="relative mb-8">
        <div className="flex items-center justify-center gap-3">
          <img src="/logo.svg" alt="Yo Participo" className="w-10 h-10" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#04BFAD] to-[#024959] bg-clip-text text-transparent">
            Formulario de Postulación
          </h2>
        </div>
        <button 
          onClick={onClose} 
          className="absolute top-0 right-0 p-2 hover:bg-[#04BFAD]/10 rounded-full transition-colors"
        >
          <Icons.X className="w-5 h-5 text-[#024959]" />
        </button>
      </div>

      {/* Progress - Stepper mejorado */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep === step
                    ? "bg-gradient-to-br from-[#04BFAD] to-[#024959] text-white shadow-lg scale-110"
                    : currentStep > step
                      ? "bg-[#04BFAD] text-white"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {currentStep > step ? <Icons.Check className="w-6 h-6" /> : step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 mx-2 rounded-full ${
                  currentStep > step ? "bg-[#04BFAD]" : "bg-gray-200"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1 */}
      {currentStep === 1 && (
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-[#024959]">
              <Icons.User className="w-5 h-5 inline mr-2 text-[#04BFAD]" />
              Datos Personales
            </CardTitle>
            <CardDescription>Ingresa tu información personal básica</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <InputWithLabel
                label="Nombres *"
                value={formData.nombres}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("nombres", e.target.value)}
                placeholder="Ej: María José"
              />
              <InputWithLabel
                label="Apellidos *"
                value={formData.apellidos}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("apellidos", e.target.value)}
                placeholder="Ej: González"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <InputWithLabel
                label="RUT *"
                value={formData.rut}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("rut", formatRUT(e.target.value))}
                placeholder="12.345.678-9"
                maxLength={12}
              />
              <InputWithLabel
                label="Fecha de Nacimiento *"
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("fechaNacimiento", e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                min={new Date(new Date().setFullYear(new Date().getFullYear() - 150)).toISOString().split('T')[0]}
              />
            </div>
            <SelectWithLabel
              label="Sexo *"
              options={sexoOptions}
              value={formData.sexo}
              onValueChange={(value: string) => handleInputChange("sexo", value)}
              placeholder="Selecciona"
            />
          </CardContent>
        </Card>
      )}

      {/* Step 2 */}
      {currentStep === 2 && (
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-[#024959]">
              <Icons.MapPin className="w-5 h-5 inline mr-2 text-[#04BFAD]" />
              Contacto y Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Teléfono con selector de código de país */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono *</label>
                <div className="flex gap-2">
                  <select
                    value={formData.telefonoCodigoPais}
                    onChange={(e) => handleInputChange("telefonoCodigoPais", e.target.value)}
                    className="w-[90px] px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#024959] text-sm"
                  >
                    {codigosPais.map((item) => (
                      <option key={item.codigo} value={item.codigo}>
                        {item.codigo}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={formData.telefonoNumero}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value)
                      handleInputChange("telefonoNumero", formatted)
                    }}
                    placeholder="912345678"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#024959]"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Ejemplo: {formData.telefonoCodigoPais} 912345678
                </p>
              </div>
              <div className="space-y-2">
                <InputWithLabel
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("email", e.target.value)}
                  placeholder="maria@email.com"
                  className={formData.email && !isValidEmail(formData.email) ? "border-red-500" : ""}
                />
                {formData.email && !isValidEmail(formData.email) && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <Icons.AlertCircle className="w-3 h-3" />
                    El email debe tener un formato válido (ejemplo: usuario@dominio.com)
                  </p>
                )}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <SelectWithLabel
                label="Región *"
                options={regionesChile}
                value={formData.region}
                onValueChange={(value: string) => {
                  handleInputChange("region", value)
                  handleInputChange("comuna", "")
                }}
                placeholder="Selecciona región"
              />
              <SelectWithLabel
                label="Comuna *"
                options={formData.region ? comunasPorRegion[formData.region] : []}
                value={formData.comuna}
                onValueChange={(value: string) => handleInputChange("comuna", value)}
                placeholder="Selecciona comuna"
                disabled={!formData.region}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 */}
      {currentStep === 3 && (
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-[#024959]">
              <Icons.Heart className="w-5 h-5 inline mr-2 text-[#04BFAD]" />
              Información Médica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Autocomplete CIE-10 para Condición Principal */}
            <Cie10SingleAutocomplete
              label="Condición Médica Principal"
              value={formData.condicionPrincipal}
              selectedCode={formData.condicionPrincipalCodigo}
              onChange={(nombre, codigo) => {
                handleInputChange("condicionPrincipal", nombre)
                handleInputChange("condicionPrincipalCodigo", codigo)
                // Código principal seleccionado
              }}
              placeholder="Buscar enfermedad por nombre o código CIE-10..."
              required
            />

            {/* Checkboxes de Patologías Prevalentes */}
            <div>
              <label className="block text-sm font-medium text-[#024959] mb-3">
                ¿Tienes alguna de estas patologías? (Selecciona todas las que apliquen)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-[#F2F2F2]/50 rounded-xl">
                {patologiasPrevalentes.map((patologia) => (
                  <Checkbox
                    key={patologia}
                    id={patologia}
                    checked={formData.patologias.includes(patologia)}
                    onChange={() => handlePatologiaToggle(patologia)}
                    label={patologia}
                  />
                ))}
              </div>
              {formData.patologias.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.patologias.map((pat) => (
                    <Badge key={pat} className="bg-[#04BFAD] text-white">
                      {pat}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {/* Checkbox para "Otros" */}
            <div className="space-y-3">
              <Checkbox
                id="tieneOtrasEnfermedades"
                checked={formData.tieneOtrasEnfermedades}
                onChange={(checked) => {
                  handleInputChange("tieneOtrasEnfermedades", checked)
                  if (!checked) {
                    handleInputChange("otrasEnfermedades", "")
                  }
                }}
                label="Otros"
              />
              
              {/* Textarea que se despliega cuando se marca "Otros" */}
              {formData.tieneOtrasEnfermedades && (
                <TextareaWithLabel
                  label="Describe otras enfermedades"
                  value={formData.otrasEnfermedades}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("otrasEnfermedades", e.target.value)}
                  placeholder="Describe otras enfermedades que no estén en la lista anterior..."
                  className="min-h-[100px]"
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4 */}
      {currentStep === 4 && (
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-[#024959]">
              <Icons.FileText className="w-5 h-5 inline mr-2 text-[#04BFAD]" />
              Confirmación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="font-semibold mb-4">Resumen:</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Nombre:</strong> {formData.nombres} {formData.apellidos}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData.email}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Teléfono:</strong> {formData.telefonoCodigoPais} {formData.telefonoNumero}
                  </p>
                  <p>
                    <strong>Condición:</strong> {formData.condicionPrincipal || "No especificada"}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Checkbox
                checked={formData.aceptaTerminos}
                onChange={(checked) => handleInputChange("aceptaTerminos", checked)}
                label={
                  <>
                    Acepto los{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setMostrarTerminos(true)
                      }}
                      className="text-[#04BFAD] hover:text-[#024959] underline font-medium"
                    >
                      Términos y Condiciones
                    </button>{" "}
                    *
                  </>
                }
              />
              <Checkbox
                checked={formData.aceptaPrivacidad}
                onChange={(checked) => handleInputChange("aceptaPrivacidad", checked)}
                label={
                  <>
                    Acepto la{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setMostrarPrivacidad(true)
                      }}
                      className="text-[#04BFAD] hover:text-[#024959] underline font-medium"
                    >
                      Política de Privacidad
                    </button>{" "}
                    *
                  </>
                }
              />
              <Checkbox
                checked={formData.aceptaAlmacenamiento15Anos}
                onChange={(checked) => handleInputChange("aceptaAlmacenamiento15Anos", checked)}
                label="Acepto que mis datos sean almacenados por un periodo de 15 años después del registro. *"
              />
            </div>

            {/* Modal de Términos y Condiciones */}
            {mostrarTerminos && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setMostrarTerminos(false)}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <div className="bg-gradient-to-r from-[#04BFAD] to-[#024959] px-6 py-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Términos y Condiciones</h3>
                    <button onClick={() => setMostrarTerminos(false)} className="text-white hover:bg-white/20 rounded-full p-2">
                      <Icons.X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                    <div className="prose prose-sm max-w-none">
                      <h4 className="text-lg font-bold text-[#024959] mb-3">1. Aceptación de los Términos</h4>
                      <p className="text-gray-700 mb-4">
                        Al utilizar la plataforma yoParticipo y completar este formulario, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, por favor no utilice nuestros servicios.
                      </p>

                      <h4 className="text-lg font-bold text-[#024959] mb-3">2. Propósito de la Plataforma</h4>
                      <p className="text-gray-700 mb-4">
                        yoParticipo es una plataforma que conecta pacientes con estudios clínicos disponibles en Chile. Nuestro objetivo es facilitar el acceso a nuevas opciones de tratamiento a través de la investigación médica.
                      </p>

                      <h4 className="text-lg font-bold text-[#024959] mb-3">3. Información Proporcionada</h4>
                      <p className="text-gray-700 mb-4">
                        Usted se compromete a proporcionar información veraz, precisa y actualizada. La información falsa o inexacta puede afectar su elegibilidad para participar en estudios clínicos.
                      </p>

                      <h4 className="text-lg font-bold text-[#024959] mb-3">4. Uso de la Información</h4>
                      <p className="text-gray-700 mb-4">
                        La información que proporcione será utilizada exclusivamente para evaluar su elegibilidad en estudios clínicos y contactarlo con oportunidades relevantes. No compartiremos su información con terceros sin su consentimiento explícito.
                      </p>

                      <h4 className="text-lg font-bold text-[#024959] mb-3">5. Participación Voluntaria</h4>
                      <p className="text-gray-700 mb-4">
                        La participación en cualquier estudio clínico es completamente voluntaria. Usted tiene derecho a retirarse en cualquier momento sin penalización alguna.
                      </p>

                      <h4 className="text-lg font-bold text-[#024959] mb-3">6. Limitación de Responsabilidad</h4>
                      <p className="text-gray-700 mb-4">
                        yoParticipo actúa como intermediario entre pacientes y estudios clínicos. No somos responsables de los resultados de los estudios ni de las decisiones médicas tomadas por los investigadores.
                      </p>

                      <p className="text-sm text-gray-500 mt-6">
                        Última actualización: Diciembre 2024
                      </p>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
                    <Button onClick={() => setMostrarTerminos(false)} className="bg-gradient-to-r from-[#04BFAD] to-[#024959]">
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Política de Privacidad */}
            {mostrarPrivacidad && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setMostrarPrivacidad(false)}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <div className="bg-gradient-to-r from-[#04BFAD] to-[#024959] px-6 py-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Política de Privacidad</h3>
                    <button onClick={() => setMostrarPrivacidad(false)} className="text-white hover:bg-white/20 rounded-full p-2">
                      <Icons.X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                    <div className="prose prose-sm max-w-none">
                      <h4 className="text-lg font-bold text-[#024959] mb-3">1. Información que Recopilamos</h4>
                      <p className="text-gray-700 mb-4">
                        Recopilamos información personal que usted nos proporciona voluntariamente, incluyendo: nombre, datos de contacto, información médica y condiciones de salud.
                      </p>

                      <h4 className="text-lg font-bold text-[#024959] mb-3">2. Cómo Usamos su Información</h4>
                      <p className="text-gray-700 mb-4">
                        Utilizamos su información para:
                      </p>
                      <ul className="list-disc pl-6 text-gray-700 mb-4">
                        <li>Evaluar su elegibilidad para estudios clínicos</li>
                        <li>Contactarlo con oportunidades relevantes</li>
                        <li>Mejorar nuestros servicios</li>
                        <li>Cumplir con requisitos legales y regulatorios</li>
                      </ul>

                      <h4 className="text-lg font-bold text-[#024959] mb-3">3. Protección de Datos</h4>
                      <p className="text-gray-700 mb-4">
                        Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra acceso no autorizado, pérdida o alteración. Utilizamos encriptación y almacenamiento seguro.
                      </p>

                      <h4 className="text-lg font-bold text-[#024959] mb-3">4. Compartir Información</h4>
                      <p className="text-gray-700 mb-4">
                        Solo compartimos su información con investigadores de estudios clínicos cuando usted ha expresado interés y ha dado su consentimiento explícito. Nunca vendemos su información a terceros.
                      </p>

                      <h4 className="text-lg font-bold text-[#024959] mb-3">5. Sus Derechos</h4>
                      <p className="text-gray-700 mb-4">
                        Usted tiene derecho a:
                      </p>
                      <ul className="list-disc pl-6 text-gray-700 mb-4">
                        <li>Acceder a su información personal</li>
                        <li>Solicitar corrección de datos inexactos</li>
                        <li>Solicitar eliminación de sus datos</li>
                        <li>Retirar su consentimiento en cualquier momento</li>
                      </ul>

                      <h4 className="text-lg font-bold text-[#024959] mb-3">6. Contacto</h4>
                      <p className="text-gray-700 mb-4">
                        Para ejercer sus derechos o realizar consultas sobre privacidad, contáctenos a través de nuestra plataforma.
                      </p>

                      <p className="text-sm text-gray-500 mt-6">
                        Última actualización: Diciembre 2024
                      </p>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
                    <Button onClick={() => setMostrarPrivacidad(false)} className="bg-gradient-to-r from-[#04BFAD] to-[#024959]">
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep((p) => p - 1)} 
          disabled={currentStep === 1}
          className="border-[#04BFAD] text-[#024959] hover:bg-[#04BFAD]/10"
        >
          Anterior
        </Button>
        {currentStep < 4 ? (
          <Button
            onClick={() => setCurrentStep((p) => p + 1)}
            disabled={!validateStep(currentStep)}
            className="bg-gradient-to-r from-[#04BFAD] to-[#024959] hover:opacity-90 text-white"
          >
            Siguiente
          </Button>
        ) : (
          <Button
            onClick={() => {
              // Eliminar campos que son solo para control de UI
              const { tieneOtrasEnfermedades, ...dataToSubmit } = formData
              onSubmit(dataToSubmit)
            }}
            disabled={!validateStep(currentStep) || isSubmitting}
            className="bg-gradient-to-r from-[#04BFAD] to-[#024959] hover:opacity-90 text-white"
          >
            {isSubmitting ? (
              <>
                <Icons.Loader className="w-5 h-5 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Icons.CheckCircle className="w-5 h-5 mr-2" />
                Completar
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
