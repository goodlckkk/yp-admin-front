import { useState } from "react";
import { enfermedadesComunes, type Enfermedad } from "../data/enfermedades";
import { Search, ChevronRight, Home } from "lucide-react";
import PatientForm from "../../src/components/ui/patientform";
import { createPatientIntake } from "../lib/api";
import { Icons } from "../../src/components/ui/icons";

export default function EnfermedadesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnfermedad, setSelectedEnfermedad] = useState<Enfermedad | null>(enfermedadesComunes[0]);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [isSubmittingIntake, setIsSubmittingIntake] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const filteredEnfermedades = enfermedadesComunes.filter(enfermedad =>
    enfermedad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enfermedad.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientFormSubmit = async (data: any) => {
    setIsSubmittingIntake(true);
    setSubmissionError(null);
    try {
      await createPatientIntake(data);
      setShowSuccessModal(true);
      setShowPatientForm(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo enviar la solicitud";
      setSubmissionError(message);
    } finally {
      setIsSubmittingIntake(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2F2F2] via-white to-[#E8F4F8]">
      {/* Header con navegación */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2 text-[#024959] hover:text-[#04BFAD] transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-medium">Inicio</span>
              </a>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 font-medium">Enfermedades Comunes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#024959] mb-4">
            Enfermedades Comunes en Chile
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Información sobre las enfermedades más prevalentes en la población chilena
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar con lista de enfermedades */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#04BFAD] focus:border-transparent"
                />
              </div>

              <div className="space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto">
                {filteredEnfermedades.map((enfermedad) => (
                  <button
                    key={enfermedad.id}
                    onClick={() => setSelectedEnfermedad(enfermedad)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedEnfermedad?.id === enfermedad.id
                        ? "bg-gradient-to-r from-[#04BFAD] to-[#024959] text-white shadow-md"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="font-medium text-sm leading-tight">
                      {enfermedad.nombre}
                    </div>
                    <div className={`text-xs mt-1 ${
                      selectedEnfermedad?.id === enfermedad.id ? "text-white/80" : "text-gray-500"
                    }`}>
                      {enfermedad.categoria}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contenido principal - Detalle de enfermedad */}
          <div className="lg:col-span-3">
            {selectedEnfermedad ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-[#04BFAD] to-[#024959] p-6 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-3xl font-bold">{selectedEnfermedad.nombre}</h2>
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                      {selectedEnfermedad.categoria}
                    </span>
                  </div>
                  {selectedEnfermedad.prevalencia && (
                    <p className="text-white/90 text-lg">
                      <span className="font-semibold">Prevalencia:</span> {selectedEnfermedad.prevalencia}
                    </p>
                  )}
                </div>

                <div className="p-8">
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-[#024959] mb-4">Descripción</h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {selectedEnfermedad.descripcion}
                    </p>
                  </div>

                  {selectedEnfermedad.sintomas && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-[#024959] mb-4">Síntomas Principales</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {selectedEnfermedad.sintomas.map((sintoma, index) => (
                          <div key={index} className="flex items-start gap-3 bg-[#F2F2F2] p-3 rounded-lg">
                            <div className="w-2 h-2 bg-[#04BFAD] rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{sintoma}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-[#E8F4F8] to-[#F2F2F2] rounded-lg p-6 border-2 border-[#04BFAD]/20">
                    <h3 className="text-xl font-bold text-[#024959] mb-3">
                      ¿Padeces {selectedEnfermedad.nombre}?
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Si tienes esta condición y estás interesado en participar en estudios clínicos, 
                      completa el formulario y nuestro equipo se pondrá en contacto contigo.
                    </p>
                    <button
                      onClick={() => setShowPatientForm(true)}
                      className="bg-gradient-to-r from-[#04BFAD] to-[#024959] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      Quiero Participar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">
                  Selecciona una enfermedad del menú lateral para ver más información
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal del Formulario */}
      {showPatientForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {submissionError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 flex items-center gap-3">
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
              condition={selectedEnfermedad?.nombre || ""}
              onClose={() => {
                setShowPatientForm(false);
                setSubmissionError(null);
              }}
              onSubmit={handlePatientFormSubmit}
              isSubmitting={isSubmittingIntake}
            />
          </div>
        </div>
      )}

      {/* Modal de Éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Solicitud Enviada!</h3>
            <p className="text-gray-600 mb-6">
              Nuestro equipo revisará tu información y se pondrá en contacto contigo pronto.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-gradient-to-r from-[#04BFAD] to-[#024959] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all w-full"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
