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
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    rut: "",
    fechaNacimiento: "",
    sexo: "",
    telefono: "",
    email: "",
    region: "",
    comuna: "",
    direccion: "",
    condicionPrincipal: condition,
    descripcionCondicion: "",
    medicamentosActuales: "",
    alergias: "",
    cirugiasPrevias: "",
    aceptaTerminos: false,
    aceptaPrivacidad: false,
  })

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

  const regiones = [
    { value: "metropolitana", label: "Región Metropolitana" },
    { value: "valparaiso", label: "Región de Valparaíso" },
    { value: "biobio", label: "Región del Biobío" },
  ]

  const comunas: Record<string, { value: string; label: string }[]> = {
    metropolitana: [
      { value: "santiago", label: "Santiago" },
      { value: "providencia", label: "Providencia" },
    ],
    valparaiso: [
      { value: "valparaiso", label: "Valparaíso" },
      { value: "vinadelmar", label: "Viña del Mar" },
    ],
    biobio: [
      { value: "concepcion", label: "Concepción" },
      { value: "talcahuano", label: "Talcahuano" },
    ],
  }

  const sexoOptions = [
    { value: "masculino", label: "Masculino" },
    { value: "femenino", label: "Femenino" },
    { value: "otro", label: "Otro" },
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.nombres && formData.apellidos && formData.rut && formData.fechaNacimiento && formData.sexo
      case 2:
        return formData.telefono && formData.email && formData.region && formData.comuna
      case 3:
        return formData.descripcionCondicion
      case 4:
        return formData.aceptaTerminos && formData.aceptaPrivacidad
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
            <div className="grid md:grid-cols-2 gap-4">
              <InputWithLabel
                label="Teléfono *"
                value={formData.telefono}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("telefono", e.target.value)}
                placeholder="+56 9 1234 5678"
              />
              <InputWithLabel
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("email", e.target.value)}
                placeholder="maria@email.com"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <SelectWithLabel
                label="Región *"
                options={regiones}
                value={formData.region}
                onValueChange={(value: string) => {
                  handleInputChange("region", value)
                  handleInputChange("comuna", "")
                }}
                placeholder="Selecciona región"
              />
              <SelectWithLabel
                label="Comuna *"
                options={formData.region ? comunas[formData.region] : []}
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
            <SelectWithLabel
              label="Condición Médica Principal *"
              options={condicionesMedicas}
              value={condicionSeleccionada}
              onValueChange={(value: string) => {
                setCondicionSeleccionada(value)
                if (value !== "otra") {
                  const condicionLabel = condicionesMedicas.find(c => c.value === value)?.label || ""
                  handleInputChange("condicionPrincipal", condicionLabel)
                  setCondicionPersonalizada("")
                } else {
                  handleInputChange("condicionPrincipal", "")
                }
              }}
              placeholder="Selecciona tu condición médica"
            />
            
            {condicionSeleccionada === "otra" && (
              <InputWithLabel
                label="Especifica tu condición *"
                value={condicionPersonalizada}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCondicionPersonalizada(e.target.value)
                  handleInputChange("condicionPrincipal", e.target.value)
                }}
                placeholder="Escribe tu condición médica"
              />
            )}
            
            <TextareaWithLabel
              label="Describe tu condición *"
              value={formData.descripcionCondicion}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("descripcionCondicion", e.target.value)}
              placeholder="Describe brevemente tu condición, síntomas y tiempo de diagnóstico..."
              className="min-h-[100px]"
            />
            <TextareaWithLabel
              label="Medicamentos Actuales"
              value={formData.medicamentosActuales}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("medicamentosActuales", e.target.value)}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <InputWithLabel
                label="Alergias"
                value={formData.alergias}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("alergias", e.target.value)}
              />
              <InputWithLabel
                label="Cirugías Previas"
                value={formData.cirugiasPrevias}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("cirugiasPrevias", e.target.value)}
              />
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
                    <strong>Teléfono:</strong> {formData.telefono}
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
                    <a href="#" className="text-blue-600">
                      Términos y Condiciones
                    </a>{" "}
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
                    <a href="#" className="text-blue-600">
                      Política de Privacidad
                    </a>{" "}
                    *
                  </>
                }
              />
            </div>
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
            onClick={() => onSubmit(formData)}
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
