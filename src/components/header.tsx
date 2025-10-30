import { Button } from "./ui/button";
import { Icons } from "./ui/icons";
import { navigate } from "astro:transitions/client";

export function HeaderPage ({activeTab, setActiveTab, showMobileMenu, setShowMobileMenu}: any){
  
  const buttonLoginOnclickHandler = () => {
    navigate("/auth")
  }


  return (
    <header className="fixed top-4 left-4 right-4 z-50 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Icons.Microscope className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse-slow"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">yoParticipo</h1>
                  <p className="text-xs text-gray-500">Chile</p>
                </div>
              </div>

              <nav className="hidden md:flex bg-gray-100 rounded-full p-1">
                {["pacientes", "instituciones", "medicos"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-blue-600"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>

              <div className="hidden md:flex items-center gap-3">
                <Button variant="ghost" onClick={buttonLoginOnclickHandler}>Iniciar Sesión</Button>
                <Button className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Comenzar
                </Button>
              </div>

              <button className="md:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>
                <Icons.Menu className="w-6 h-6" />
              </button>
            </div>
        </div>
    </header>
  )
}