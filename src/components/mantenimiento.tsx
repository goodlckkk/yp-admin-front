export default function Mantenimiento() {
    return (
<div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #024959 0%, #04BFAD 100%)' }}>
      <div className="max-w-2xl w-full text-center">

        <div className="flex items-center justify-center gap-4 mb-8">
          <img 
            src="/logo-2.svg" 
            alt="yoParticipo Logo" 
            className="w-20 h-20 scale-400 animate-pulse-slow"
          />
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(to right, #A7F2EB, #04BFAD)' }}>
            <svg className="w-12 h-12 text-[#024959] animate-spin" style={{animationDuration: "3s"}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          <h2 className="text-4xl font-bold mb-4" style={{ color: '#024959' }}>
            Estamos Mejorando
          </h2>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Nuestro sitio está en mantenimiento mientras implementamos nuevas funcionalidades para mejorar tu experiencia.
          </p>

          
          <div className="rounded-2xl p-6 mb-8" style={{ backgroundColor: '#A7F2EB' }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#04BFAD' }}></div>
              <span className="text-sm font-semibold" style={{ color: '#024959' }}>Estado: En Progreso</span>
            </div>
            <p className="text-sm" style={{ color: '#024959' }}>
              Estimamos estar de vuelta pronto. Gracias por tu paciencia.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <p className="text-gray-600 mb-4">¿Necesitas ayuda urgente?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:contacto@yoparticipo.cl"
                className="inline-flex items-center gap-2 font-medium transition-colors hover:opacity-80"
                style={{ color: '#04BFAD' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                contacto@yoparticipo.cl
              </a>
              <span className="hidden sm:block text-gray-300">|</span>
              <a
                href="tel:+56234567890"
                className="inline-flex items-center gap-2 font-medium transition-colors hover:opacity-80"
                style={{ color: '#04BFAD' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                +56 2 3456 7890
              </a>
            </div>
          </div>
        </div>

        <p className="text-white text-sm mt-8 opacity-80">
          &copy; 2025 yoParticipo Chile. Conectando ciencia y esperanza.
        </p>
      </div>
    </div>
    )
}