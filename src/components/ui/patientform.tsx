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
import { Cie10SingleAutocomplete } from "./Cie10SingleAutocomplete"
import { useCommunes } from "../../hooks/useCommunes"
import { formatRut, validateRutModulo11 } from "../../utils/rut-utils"

interface PatientFormProps {
  condition: string
  onClose: () => void
  onSubmit: (data: any) => void
  isSubmitting?: boolean
}

export default function PatientForm({ condition, onClose, onSubmit, isSubmitting = false }: PatientFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [mostrarTerminos, setMostrarTerminos] = useState(false)
  const [mostrarPrivacidad, setMostrarPrivacidad] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [stepAttempted, setStepAttempted] = useState<Record<number, boolean>>({})
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
    aceptaTerminos: true,
    aceptaPrivacidad: true,
    aceptaAlmacenamiento15Anos: true,
  })

  // Hook para obtener comunas desde la API
  const { getCommunesByRegion, getAllRegions } = useCommunes();

  // Patologías prevalentes en Chile (según feedback)
  const patologiasPrevalentes = [
    "Hipertensión",
    "Diabetes",
    "Enfermedad coronaria (infarto agudo al miocardio)",
    "EPOC (Enfermedad Pulmonar Obstructiva Crónica)",
    "Enfermedad pulmonar",
    "Insuficiencia cardíaca",
    "Enfermedad renal crónica",
    "Asma",
    "Obesidad",
    "Síndrome de Sjögren",
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
        
        // Validar RUT con algoritmo módulo 11
        const rutResult = validateRutModulo11(formData.rut)
        if (!rutResult.valid) return false
        
        // Validar que la fecha de nacimiento tenga un año razonable (1900 - año actual)
        const birthYear = new Date(formData.fechaNacimiento).getFullYear()
        const currentYear = new Date().getFullYear()
        if (birthYear < 1900 || birthYear > currentYear) return false
        
        return true
      case 2:
        // Validar que tenga teléfono (exactamente 9 dígitos), email válido, región y comuna
        return !!(
          formData.telefonoNumero &&
          formData.telefonoNumero.replace(/[^0-9]/g, '').length === 9 &&
          formData.email && 
          isValidEmail(formData.email) && 
          formData.region && 
          formData.comuna
        )
      case 3:
        // Validar que tenga condición principal
        return !!formData.condicionPrincipal
      case 4:
        return true
      default:
        return true
    }
  }

  // Validar campos del paso actual y generar errores inline
  const getStepErrors = (step: number): Record<string, string> => {
    const errors: Record<string, string> = {}
    if (step === 1) {
      if (!formData.nombres.trim()) errors.nombres = 'El nombre es obligatorio'
      if (!formData.apellidos.trim()) errors.apellidos = 'Los apellidos son obligatorios'
      if (!formData.rut.trim()) {
        errors.rut = 'El RUT es obligatorio'
      } else {
        const rutResult = validateRutModulo11(formData.rut)
        if (!rutResult.valid && rutResult.error) errors.rut = rutResult.error
      }
      if (!formData.fechaNacimiento) {
        errors.fechaNacimiento = 'La fecha de nacimiento es obligatoria'
      } else {
        const birthYear = new Date(formData.fechaNacimiento).getFullYear()
        const currentYear = new Date().getFullYear()
        if (birthYear < 1900 || birthYear > currentYear) errors.fechaNacimiento = 'Año de nacimiento fuera de rango'
      }
      if (!formData.sexo) errors.sexo = 'Debes seleccionar el sexo'
    }
    if (step === 2) {
      if (!formData.telefonoNumero || formData.telefonoNumero.replace(/[^0-9]/g, '').length !== 9) {
        errors.telefonoNumero = 'Debes ingresar exactamente 9 dígitos'
      }
      if (!formData.email.trim()) {
        errors.email = 'El email es obligatorio'
      } else if (!isValidEmail(formData.email)) {
        errors.email = 'El email debe tener un formato válido'
      }
      if (!formData.region) errors.region = 'La región es obligatoria'
      if (!formData.comuna) errors.comuna = 'La comuna es obligatoria'
    }
    return errors
  }

  // Intentar avanzar al siguiente paso; si hay errores, mostrarlos
  const handleNextStep = () => {
    const errors = getStepErrors(currentStep)
    if (Object.keys(errors).length > 0) {
      setStepAttempted(prev => ({ ...prev, [currentStep]: true }))
      setFieldErrors(prev => ({ ...prev, ...errors }))
      return
    }
    setStepAttempted(prev => ({ ...prev, [currentStep]: false }))
    setCurrentStep(p => p + 1)
  }

  // Limpiar error de un campo al escribir
  const handleFieldChange = (field: string, value: string | boolean | string[]) => {
    handleInputChange(field, value)
    setFieldErrors(prev => { const { [field]: _, ...rest } = prev; return rest })
  }

  // Errores visibles: solo mostrar si se intentó avanzar en ese paso
  const visibleErrors = stepAttempted[currentStep] ? getStepErrors(currentStep) : {}

  // formatRut importado desde utils/rut-utils.ts

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
              <div className="space-y-1">
                <InputWithLabel
                  label="Nombres *"
                  value={formData.nombres}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange("nombres", e.target.value)}
                  placeholder="Ej: María José"
                  className={visibleErrors.nombres ? 'border-red-500' : ''}
                />
                {visibleErrors.nombres && <p className="text-xs text-red-600 font-medium">{visibleErrors.nombres}</p>}
              </div>
              <div className="space-y-1">
                <InputWithLabel
                  label="Apellidos *"
                  value={formData.apellidos}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange("apellidos", e.target.value)}
                  placeholder="Ej: González"
                  className={visibleErrors.apellidos ? 'border-red-500' : ''}
                />
                {visibleErrors.apellidos && <p className="text-xs text-red-600 font-medium">{visibleErrors.apellidos}</p>}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <InputWithLabel
                  label="RUT *"
                  value={formData.rut}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange("rut", formatRut(e.target.value))}
                  placeholder="12.345.678-9"
                  maxLength={12}
                  className={visibleErrors.rut ? 'border-red-500' : ''}
                />
                {visibleErrors.rut && <p className="text-xs text-red-600 font-medium">{visibleErrors.rut}</p>}
              </div>
              <div className="space-y-1">
                <InputWithLabel
                  label="Fecha de Nacimiento *"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange("fechaNacimiento", e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  min="1900-01-01"
                  className={visibleErrors.fechaNacimiento ? 'border-red-500' : ''}
                />
                {visibleErrors.fechaNacimiento && <p className="text-xs text-red-600 font-medium">{visibleErrors.fechaNacimiento}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <SelectWithLabel
                label="Sexo *"
                options={sexoOptions}
                value={formData.sexo}
                onValueChange={(value: string) => handleFieldChange("sexo", value)}
                placeholder="Selecciona"
              />
              {visibleErrors.sexo && <p className="text-xs text-red-600 font-medium">{visibleErrors.sexo}</p>}
            </div>
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
                <div className="flex">
                  <select
                    value={formData.telefonoCodigoPais}
                    onChange={(e) => handleInputChange("telefonoCodigoPais", e.target.value)}
                    className="w-[90px] px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#024959] text-sm text-gray-500"
                  >
                    <option value="" disabled hidden className="text-gray-400">+56</option>
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
                      if (formatted.length > 0 && formatted.length !== 9) {
                        setFieldErrors(prev => ({ ...prev, telefonoNumero: 'Debes ingresar exactamente 9 dígitos' }))
                      } else {
                        setFieldErrors(prev => { const { telefonoNumero, ...rest } = prev; return rest })
                      }
                    }}
                    placeholder="912345678"
                    maxLength={9}
                    className={`text-gray-700 flex-1 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#024959] ${
                      fieldErrors.telefonoNumero ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {fieldErrors.telefonoNumero ? (
                  <p className="text-xs text-red-600 font-medium">{fieldErrors.telefonoNumero}</p>
                ) : (
                  <p className="text-xs text-gray-500">Ejemplo: {formData.telefonoCodigoPais} 912345678</p>
                )}
              </div>
              <div className="space-y-2">
                <InputWithLabel
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange("email", e.target.value)}
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
              <div className="space-y-1">
                <SelectWithLabel
                  label="Región *"
                  options={getAllRegions().map(region => ({ value: region, label: region }))}
                  value={formData.region}
                  onValueChange={(value: string) => {
                    handleFieldChange("region", value)
                    handleFieldChange("comuna", "")
                  }}
                  placeholder="Selecciona región"
                />
                {visibleErrors.region && <p className="text-xs text-red-600 font-medium">{visibleErrors.region}</p>}
              </div>
              <div className="space-y-1">
                <SelectWithLabel
                  label="Comuna *"
                  options={formData.region ? getCommunesByRegion(formData.region) : []}
                  value={formData.comuna}
                  onValueChange={(value: string) => handleFieldChange("comuna", value)}
                  placeholder="Selecciona comuna"
                  disabled={!formData.region}
                />
                {visibleErrors.comuna && <p className="text-xs text-red-600 font-medium">{visibleErrors.comuna}</p>}
              </div>
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
            {/* Aviso de privacidad y consentimiento informado */}
            <div className="space-y-4">
              <div className="bg-[#04BFAD]/10 border border-[#04BFAD]/30 rounded-xl p-4 flex items-start gap-3">
                <Icons.Info className="w-5 h-5 text-[#04BFAD] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-[#024959]">
                  <p className="font-semibold mb-1">Aviso de Privacidad</p>
                  <p className="text-gray-600 leading-relaxed">
                    Al enviar este formulario, confirmas que la información proporcionada es verídica y
                    autorizas a yoParticipo a procesar tus datos personales con el fin de evaluar tu
                    elegibilidad para estudios clínicos y contactarte con oportunidades relevantes.
                  </p>
                  <div className="mt-2 flex gap-4">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setMostrarTerminos(true) }}
                      className="text-[#04BFAD] hover:text-[#024959] underline font-medium text-xs"
                    >
                      Ver Términos y Condiciones
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setMostrarPrivacidad(true) }}
                      className="text-[#04BFAD] hover:text-[#024959] underline font-medium text-xs"
                    >
                      Ver Política de Privacidad
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Icons.FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-[#024959] mb-1">Consentimiento Informado</p>
                  <p className="text-gray-600 leading-relaxed">
                    El consentimiento informado para participar en un estudio clínico se firma
                    presencialmente en el centro de investigación. Un miembro de nuestro equipo
                    te contactará para coordinar este proceso.
                  </p>
                </div>
              </div>
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
            onClick={handleNextStep}
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
