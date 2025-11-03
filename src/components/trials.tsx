import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Icons } from "./ui/icons";
import { InputWithLabel } from "./ui/input";
import { TextareaWithLabel } from "./ui/textarea";
import { useState } from "react";

const trialsPage = () => {
  const [formContactoInstitucion, setFormContactoInstitucion] = useState({
    nombreInstitucion: "",
    nombreContacto: "",
    email: "",
    telefono: "",
    mensaje: "",
  });

  const estadisticasInstituciones = [
    { numero: "300%", label: "Más Reclutamiento", Icono: Icons.Target, color: "text-indigo-600" },
    { numero: "45", label: "Instituciones Activas", Icono: Icons.Shield, color: "text-purple-600" },
    { numero: "2.8K", label: "Pacientes en Red", Icono: Icons.Users, color: "text-blue-600" },
    { numero: "24/7", label: "Soporte Técnico", Icono: Icons.Zap, color: "text-green-600" },
  ];

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
  ];

  const handleSubmitContactoInstitucion = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contacto Institución:", formContactoInstitucion);
    alert("¡Gracias por tu interés! Nos contactaremos contigo en menos de 24 horas.");
    setFormContactoInstitucion({
      nombreInstitucion: "",
      nombreContacto: "",
      email: "",
      telefono: "",
      mensaje: "",
    });
  };

  return (
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
  );
};

export default trialsPage;