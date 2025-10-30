import { Icons } from "./ui/icons";

export function FooterPage(){

    return (
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
    )
}
