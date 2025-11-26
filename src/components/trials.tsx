import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Icons } from "./ui/icons";
import { InputWithLabel } from "./ui/input";
import { TextareaWithLabel } from "./ui/textarea";
import { SelectWithLabel } from "./ui/select";
import { useState } from "react";

const trialsPage = () => {
  const [formContactoInstitucion, setFormContactoInstitucion] = useState({
    nombreInstitucion: "",
    tipoInstitucion: "",
    nombreContacto: "",
    cargoContacto: "",
    email: "",
    telefono: "",
    pais: "",
    ciudad: "",
    direccion: "",
    sitioWeb: "",
    numeroEnsayos: "",
    areasInteres: "",
    mensaje: "",
  });

  const tiposInstitucion = [
    { value: "hospital", label: "Hospital" },
    { value: "clinica", label: "Clínica Privada" },
    { value: "centro_investigacion", label: "Centro de Investigación" },
    { value: "universidad", label: "Universidad" },
    { value: "laboratorio", label: "Laboratorio Farmacéutico" },
    { value: "otro", label: "Otro" }
  ];

  const paises = [
    { value: "chile", label: "Chile" },
    { value: "argentina", label: "Argentina" },
    { value: "peru", label: "Perú" },
    { value: "colombia", label: "Colombia" },
    { value: "otro", label: "Otro" }
  ];

  const scrollToFormulario = () => {
    const formulario = document.getElementById('formulario-institucion');
    if (formulario) {
      formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmitContactoInstitucion = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contacto Institución:", formContactoInstitucion);
    alert("¡Gracias por tu interés! Nos contactaremos contigo en menos de 24 horas.");
    setFormContactoInstitucion({
      nombreInstitucion: "",
      tipoInstitucion: "",
      nombreContacto: "",
      cargoContacto: "",
      email: "",
      telefono: "",
      pais: "",
      ciudad: "",
      direccion: "",
      sitioWeb: "",
      numeroEnsayos: "",
      areasInteres: "",
      mensaje: "",
    });
  };

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen bg-gradient-to-b from-[#001B28] via-[#013C52] to-[#001021] text-white">
      <div className="max-w-7xl mx-auto">
        {/* Hero Instituciones */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
            <Icons.Shield className="w-4 h-4" />
            Soluciones para instituciones de salud
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-6">
            <span className="text-gradient">Publica</span> tus ensayos
            <br />
            <span className="text-[#A7F2EB]">y alcanza más pacientes</span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed">
            La plataforma líder para difundir ensayos clínicos en Chile. Conecta con miles de pacientes interesados
            y acelera tu investigación.
          </p>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#04BFAD] to-[#024959] rounded-3xl blur-xl opacity-30"></div>
              <div className="relative bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-[#04BFAD]/50">
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#04BFAD] to-[#024959] rounded-full mb-4">
                    <Icons.Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-[#024959]">
                    ¿Estás interesado en publicar tus ensayos?
                  </h3>
                  <p className="text-lg text-[#4D4D59] max-w-xl mx-auto">
                    Completa un breve formulario y nuestro equipo se pondrá en contacto contigo para evaluar las necesidades de tu institución
                  </p>
                  <Button
                    onClick={scrollToFormulario}
                    className="bg-gradient-to-r from-[#04BFAD] to-[#024959] hover:opacity-90 text-white h-16 px-12 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    <Icons.FileText className="w-6 h-6 mr-3" />
                    Completa el Formulario
                  </Button>
                  <p className="text-sm text-[#4D4D59]/70 flex items-center justify-center gap-2">
                    <Icons.Shield className="w-4 h-4 text-[#04BFAD]" />
                    Tus datos están protegidos y son confidenciales
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de Contacto */}
        <div id="formulario-institucion" className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">¿Listo para Empezar?</h2>
            <p className="text-xl text-white/80">Completa el formulario y nos contactaremos contigo</p>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl text-[#024959]">
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
                  className="w-full bg-gradient-to-r from-[#04BFAD] to-[#02a596] hover:opacity-90 text-[#024959] text-lg py-6 rounded-xl"
                >
                  <Icons.Mail className="w-5 h-5 mr-2" />
                  Solicitar Información
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-12 text-center">
            <div className="bg-white/10 rounded-2xl p-8 border border-white/20 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-4">¿Necesitas ayuda?</h3>
              <p className="text-white/80 mb-6">Nuestro equipo está listo para responder tus consultas</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <div className="flex items-center gap-2 text-white/80">
                  <Icons.Phone className="w-4 h-4 text-[#04BFAD]" />
                  <span>+56 2 3456 7890</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Icons.Mail className="w-4 h-4 text-[#04BFAD]" />
                  <span>instituciones@yoparticipo.cl</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default trialsPage;