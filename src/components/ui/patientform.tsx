"use client"

import { useState } from "react"
import { Button } from "./button"
import { InputWithLabel } from "./input"
import { TextareaWithLabel } from "./textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"
import { Checkbox } from "./checkbox"
import { SelectWithLabel } from "./select"
import { Icons } from "./Icons"

interface PatientFormProps {
  condition: string
  onClose: () => void
  onSubmit: (data: any) => void
}

export default function PatientForm({ condition, onClose, onSubmit }: PatientFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Registro de Paciente</h2>
          <p className="text-gray-600 mt-2">
            Condición: <Badge variant="outline">{condition}</Badge>
          </p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <Icons.X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step < currentStep ? <Icons.CheckCircle className="w-5 h-5" /> : step}
              </div>
              {step < 4 && <div className={`w-16 h-1 mx-2 ${step < currentStep ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1 */}
      {currentStep === 1 && (
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle>
              <Icons.User className="w-5 h-5 inline mr-2 text-blue-600" />
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
            <CardTitle>
              <Icons.MapPin className="w-5 h-5 inline mr-2 text-blue-600" />
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
            <CardTitle>
              <Icons.Heart className="w-5 h-5 inline mr-2 text-blue-600" />
              Información Médica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <TextareaWithLabel
              label="Describe tu condición *"
              value={formData.descripcionCondicion}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("descripcionCondicion", e.target.value)}
              placeholder="Describe brevemente tu condición..."
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
            <CardTitle>
              <Icons.FileText className="w-5 h-5 inline mr-2 text-blue-600" />
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
                    <strong>Condición:</strong> {condition}
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
        <Button variant="outline" onClick={() => setCurrentStep((p) => p - 1)} disabled={currentStep === 1}>
          Anterior
        </Button>
        {currentStep < 4 ? (
          <Button
            onClick={() => setCurrentStep((p) => p + 1)}
            disabled={!validateStep(currentStep)}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Siguiente
          </Button>
        ) : (
          <Button
            onClick={() => onSubmit(formData)}
            disabled={!validateStep(currentStep)}
            className="bg-gradient-to-r from-green-600 to-emerald-600"
          >
            <Icons.CheckCircle className="w-5 h-5 mr-2" />
            Completar
          </Button>
        )}
      </div>
    </div>
  )
}
