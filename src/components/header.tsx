import { useState, useEffect } from "react";
import logoPatients from "../assets/logo-1.svg?url";
import logoInstitutions from "../assets/logo-2.svg?url";
import { Button } from "./ui/button";
import { Icons } from "./ui/icons";

export function HeaderPage({ activeTab, setActiveTab, onPostularClick }: any) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isInstituciones = activeTab === "instituciones"

  const getHeaderOpacity = () => {
    if (isHovered) return isInstituciones ? "bg-[#004960]/95" : "bg-white/90";
    if (isScrolled) return isInstituciones ? "bg-[#004960]/30" : "bg-white/30";
    return isInstituciones ? "bg-[#004960]/95" : "bg-white/90";
  };

  const headerTheme = isInstituciones
    ? `${getHeaderOpacity()} border-white/10 text-white`
    : `${getHeaderOpacity()} border-white/40 text-[#024959]`

  const navTheme = isInstituciones ? "bg-white/10" : "bg-gray-100"

  const logoContainerClasses = isInstituciones
    ? "flex items-center px-3 py-2 rounded-xl"
    : "flex items-center"

  const navButton = (tab: string) => {
    const isActive = activeTab === tab
    const activeClasses = isInstituciones
      ? "bg-white text-[#024959] shadow"
      : "bg-white text-[#024959] shadow"
    const inactiveClasses = isInstituciones 
      ? "text-white/70 hover:text-white hover:scale-110" 
      : "text-gray-600 hover:text-[#024959] hover:scale-110"
    return `px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${isActive ? activeClasses : inactiveClasses}`
  }

  const logoSrc = isInstituciones ? logoInstitutions : logoPatients

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-lg shadow-lg border-b transition-all duration-300 ${headerTheme}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className={logoContainerClasses}>
            <a href="/">
              <img 
                src={logoSrc} 
                alt="yoParticipo" 
                className="h-10 sm:h-12 md:h-16 w-auto scale-150 sm:scale-200 md:scale-300 origin-left" 
              />
            </a>
          </div>

          {/* Navigation Tabs - Centrado en desktop, debajo del logo en mobile */}
          <nav className={`absolute left-1/2 -translate-x-1/2 flex rounded-full p-0.5 sm:p-1 ${navTheme}`}>
            {["pacientes", "instituciones"].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={navButton(tab)}
                style={{ fontSize: 'clamp(0.7rem, 2vw, 0.875rem)' }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          {/* Botón Participa - Responsive */}
          {activeTab === "pacientes" && onPostularClick && (
            <Button
              onClick={onPostularClick}
              className="bg-gradient-to-r from-[#04BFAD] to-[#024959] hover:opacity-90 text-white px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <img src="/logo-blanco.svg" alt="yoParticipo" className="h-4 sm:h-5 w-auto" />
              <span className="hidden xs:inline">Participa Aquí</span>
              <span className="xs:hidden">Participa</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}