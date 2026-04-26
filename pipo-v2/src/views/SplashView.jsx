import React from 'react'
import { useAppContext } from '../context/AppContext.jsx'
import { TalaveraWreath, TalaveraPattern } from '../components/TalaveraPattern.jsx'
import { PipoMascot } from '../components/PipoMascot.jsx'

export default function SplashView() {
  const { setCurrentView } = useAppContext()

  const handleEmpezar = () => {
    setCurrentView('chat')
  }

  return (
    <div className="relative min-h-full w-full flex flex-col items-center justify-between px-6 py-8 bg-[#ECF9FF] overflow-hidden">
      {/* Patrón sutil de fondo */}
      <TalaveraPattern opacity={0.04} />

      {/* Header con logo pequeño */}
      <div className="self-start flex items-center gap-1 z-10">
        <div className="w-3 h-3 rotate-45 bg-[#080869]" />
        <span className="text-sm text-[#080869] font-bold">2</span>
      </div>

      {/* Centro: corona de talavera + nombre */}
      <div className="relative flex items-center justify-center w-full flex-1 z-10">
        <TalaveraWreath
          size={340}
          className="absolute animate-fadeIn"
        />
        <h1 className="font-display text-7xl font-black text-[#080869] relative z-10 tracking-wider"
            style={{ fontStyle: 'italic' }}>
          PiPo
        </h1>
      </div>

      {/* Mensaje de bienvenida */}
      <div className="relative bg-white border-[3px] border-[#080869] rounded-3xl p-5 max-w-md mx-auto mb-6 shadow-[4px_4px_0px_rgba(8,8,105,0.15)] z-10 animate-slideUp">
        <p className="text-[#080869] text-base leading-relaxed font-display font-medium text-center">
          ¡Hola! Soy Pipo, tu asistente de salud del Gobierno de Puebla. Escribe tus síntomas o cómo te sientes hoy, además de qué es lo que te acomoda mejor para el horario y fecha de tu siguiente cita. ¡Te guiaré y haré que te despreocupes de ello!
        </p>
      </div>

      {/* Footer: Pipo saludando + botón Empezar */}
      <div className="relative flex items-end justify-between w-full max-w-lg mx-auto z-10">
        <div className="w-44 md:w-52 animate-float">
          <PipoMascot variant="wave" className="w-full h-auto" />
        </div>

        <button
          onClick={handleEmpezar}
          className="relative w-32 h-32 md:w-36 md:h-36 rounded-full bg-white border-[3px] border-[#080869] shadow-[5px_5px_0px_#E6A231] hover:translate-y-1 hover:shadow-[2px_2px_0px_#E6A231] transition-all overflow-hidden group"
        >
          {/* Patrón Talavera interior */}
          <div className="absolute inset-0 opacity-30">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <pattern id="splash-talavera" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <ellipse cx="5" cy="5" rx="2" ry="4" fill="#080869" opacity="0.3" />
                  <ellipse cx="15" cy="15" rx="2" ry="4" fill="#E6A231" opacity="0.5" transform="rotate(45 15 15)" />
                  <circle cx="10" cy="10" r="1" fill="#080869" opacity="0.4" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#splash-talavera)" />
            </svg>
          </div>
          <span className="relative font-display font-black text-[#080869] text-2xl italic tracking-wide group-hover:scale-105 transition-transform">
            Empezar
          </span>
        </button>
      </div>
    </div>
  )
}
