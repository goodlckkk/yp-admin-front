import { Icons } from "./ui/icons";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { InputWithLabel } from "./ui/input";
import { TextareaWithLabel } from "./ui/textarea";
import { Button } from "./ui/button";
import { useState } from "react";

export default function MedicsPage() {

    const [formContactoMedico, setFormContactoMedico] = useState({
        nombreCompleto: "",
        especialidad: "",
        institucion: "",
        email: "",
        telefono: "",
        experiencia: "",
        mensaje: "",
    });
    
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
    )
}