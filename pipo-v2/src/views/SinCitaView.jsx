import React, { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { TalaveraCorner, TalaveraPattern } from '../components/TalaveraPattern.jsx'
import { PipoMascot } from '../components/PipoMascot.jsx'

export default function SinCitaView() {
  const { setCurrentView } = useAppContext()
  const [activado, setActivado] = useState(false)

  return (
    <div className="relative min-h-full w-full flex flex-col bg-[#ECF9FF] overflow-hidden">
      <TalaveraPattern opacity={0.04} />
      <TalaveraCorner position="top-left" size={130} />
      <TalaveraCorner position="top-right" size={130} />
      <TalaveraCorner position="bottom-left" size={130} />
      <TalaveraCorner position="bottom-right" size={130} />

      {/* Mensaje principal */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start pt-32 px-8">
        <h1 className="font-display font-black text-[#080869] text-3xl md:text-4xl text-center italic leading-tight max-w-md animate-slideUp">
          No encontré citas<br/>
          disponibles que se<br/>
          acomodaran a ti, pero<br/>
          ¡seguiré al pendiente<br/>
          para agendarte una!
        </h1>

        {/* Botón notificación */}
        <button
          onClick={() => setActivado(!activado)}
          className={`mt-10 px-6 py-4 rounded-full font-display italic text-base md:text-lg border-[3px] transition-all ${
            activado
              ? 'bg-[#10b981] border-[#080869] text-white shadow-[3px_3px_0px_#080869]'
              : 'bg-white border-[#E6A231] text-[#080869] shadow-[3px_3px_0px_#E6A231] hover:translate-y-0.5 hover:shadow-none'
          }`}
        >
          {activado ? (
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Notificaciones activadas
            </span>
          ) : (
            'Recibir mensaje de confirmación cuando encuentre una'
          )}
        </button>

        {/* Pipo enfermito */}
        <div className="mt-8 w-44 md:w-52 animate-float">
          <PipoMascot variant="thermo" className="w-full h-auto" />
        </div>
      </div>

      {/* Botón secundario para volver al chat */}
      <div className="relative z-10 px-6 pb-6 text-center">
        <button
          onClick={() => setCurrentView('chat')}
          className="text-sm text-[#080869]/70 underline font-display italic hover:text-[#080869]"
        >
          Volver a hablar con Pipo
        </button>
      </div>
    </div>
  )
}
