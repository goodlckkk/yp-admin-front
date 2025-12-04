import { Icons } from "./ui/icons";
import logoPatients from "../assets/logo-1.svg?url";
import logoInstitutions from "../assets/logo-2.svg?url";

interface FooterPageProps {
  activeTab: string;
}

export function FooterPage({ activeTab }: FooterPageProps){

  const isInstituciones = activeTab === "instituciones";
  const logoSrc = isInstituciones ? logoInstitutions : logoPatients;
  
  const footerBg = isInstituciones
    ? "bg-gradient-to-b from-[#001B28] to-[#000810]"
    : "bg-gradient-to-b from-[#F2F2F2] to-white";
  
  const textPrimary = isInstituciones ? "text-white" : "text-[#024959]";
  const textSecondary = isInstituciones ? "text-white/70" : "text-gray-600";
  const borderColor = isInstituciones ? "border-white/10" : "border-gray-200";
  const hoverColor = isInstituciones ? "hover:text-white" : "hover:text-[#04BFAD]";


    return (
        <footer className={`py-16 px-4 ${footerBg}`}>
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-4 gap-8 mb-12">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <img src={logoSrc} alt="yoParticipo" className="h-12 w-auto scale-500 origin-left" />
                        </div>
                    <p className={`${textSecondary} mb-6 max-w-md`}>
                        Revolucionamos el acceso a estudios clínicos en Chile, conectando pacientes con innovación médica.
                    </p>
                    <div className={`flex flex-col gap-2 ${textSecondary}`}>
                        <div className="flex items-center gap-2">
                            <Icons.Phone className="w-4 h-4" />
                            <span className="text-sm">+56 2 3456 7890</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icons.Mail className="w-4 h-4" />
                            <span className="text-sm">contacto@participo.cl</span>
                        </div>
                    </div>
                    </div>

                    <div>
                        <h4 className={`font-semibold ${textPrimary} mb-4`}>Plataforma</h4>
                        <ul className={`space-y-2 ${textSecondary}`}>
                            <li>
                                <a href="#" className={`${hoverColor} transition-colors`}>
                                Para Pacientes
                                </a>
                            </li>
                            <li>
                                <a href="#" className={`${hoverColor} transition-colors`}>
                                Para Instituciones
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className={`font-semibold ${textPrimary} mb-4`}>Soporte</h4>
                        <ul className={`space-y-2 ${textSecondary}`}>
                            <li>
                                <a href="/faq" className={`${hoverColor} transition-colors`}>
                                    Preguntas Frecuentes
                                </a>
                            </li>
                            <li>
                                <a href="#" className={`${hoverColor} transition-colors`}>
                                    Ayuda
                                </a>
                            </li>
                            <li>
                                <a href="#" className={`${hoverColor} transition-colors`}>
                                    Contacto
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={`border-t ${borderColor} pt-8 text-center ${textSecondary}`}>
                    <p>&copy; 2025 yoParticipo Chile. Innovando el futuro de la medicina.</p>
                </div>
            </div>
        </footer>
    )
}
