import React, { useState, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { X, Bell } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { TalaveraPattern } from './TalaveraPattern.jsx'
import { PipoMascot } from './PipoMascot.jsx'

const MESES_CORTO = [
  'ene','feb','mar','abr','may','jun',
  'jul','ago','sep','oct','nov','dic'
]

export default function QRModal() {
  const { qrModalOpen, setQrModalOpen, cita, expediente } = useAppContext()

  // Tamaño del QR responsivo según ventana
  const [qrSize, setQrSize] = useState(180)
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 360) setQrSize(140)
      else if (w < 480) setQrSize(160)
      else setQrSize(200)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  if (!qrModalOpen) return null

  const fechaCita = cita?.fecha ? new Date(cita.fecha) : new Date()
  const fechaStr = `${fechaCita.getDate()} de ${MESES_CORTO[fechaCita.getMonth()]}. ${fechaCita.getFullYear()}`
  const hora = cita?.hora || '10:00'

  // Datos para el QR
  const qrPayload = JSON.stringify({
    cita: {
      fecha: cita?.fecha,
      hora: cita?.hora,
      clinica: cita?.clinica,
      especialidad: cita?.especialidad
    },
    expediente_id: expediente?.id,
    paciente: expediente?.paciente?.nombre
  })

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#080869]/50 backdrop-blur-sm animate-fadeIn p-3 sm:p-4 overflow-y-auto"
      onClick={() => setQrModalOpen(false)}
    >
      <div
        className="relative w-full max-w-md my-auto bg-[#ECF9FF] border-[3px] border-[#080869] rounded-3xl shadow-[6px_6px_0px_#E6A231] overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <TalaveraPattern opacity={0.05} />

        {/* Header con Pipo */}
        <div className="relative flex items-start justify-between px-4 sm:px-5 pt-4 sm:pt-5 gap-2">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0">
              <PipoMascot variant="happy" className="w-full h-full" />
            </div>
            <p className="font-display italic text-[#080869] text-xs sm:text-sm md:text-base leading-snug pt-1 max-w-[200px]">
              Pipo sigue vigilando cancelaciones 24/7 para adelantarte la cita
            </p>
          </div>
          <button
            onClick={() => setQrModalOpen(false)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border-2 border-[#080869] flex items-center justify-center hover:bg-[#080869] hover:text-white transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>

        {/* QR Card */}
        <div className="relative mx-4 sm:mx-5 mt-4 dashed-talavera bg-[#ECF9FF] p-3 sm:p-4">
          <div className="bg-white border-[3px] border-[#E6A231] rounded-2xl p-3 sm:p-4 shadow-[3px_3px_0px_rgba(230,162,49,0.4)]">
            <div className="flex justify-center bg-white rounded-xl p-2">
              <QRCodeCanvas
                value={qrPayload}
                size={qrSize}
                bgColor="#FFFFFF"
                fgColor="#080869"
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="text-center font-display italic font-bold text-[#080869] text-lg sm:text-xl mt-3">
              Presenta tu QR
            </p>
          </div>
          <div className="absolute -top-2 -left-2 w-3 h-3 rotate-45 bg-[#080869]" />
          <div className="absolute -bottom-2 -right-2 w-3 h-3 rotate-45 bg-[#080869]" />
        </div>

        {/* Fecha y Hora */}
        <div className="relative mx-4 sm:mx-5 mt-4 bg-[#ECF9FF] border-[3px] border-[#080869] rounded-2xl p-3 sm:p-4 shadow-[3px_3px_0px_rgba(8,8,105,0.15)]">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap sm:flex-nowrap">
            <span className="bg-white border-2 border-[#E6A231] rounded-full px-3 sm:px-4 py-1 font-display italic font-bold text-[#080869] text-xs sm:text-sm shrink-0">
              Fecha:
            </span>
            <span className="flex-1 min-w-0 bg-white border-2 border-[#080869]/30 rounded-full px-3 py-1 text-xs sm:text-sm text-[#080869] font-medium truncate">
              {fechaStr}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            <span className="bg-white border-2 border-[#E6A231] rounded-full px-3 sm:px-4 py-1 font-display italic font-bold text-[#080869] text-xs sm:text-sm shrink-0">
              Hora:
            </span>
            <span className="flex-1 min-w-0 bg-white border-2 border-[#080869]/30 rounded-full px-3 py-1 text-xs sm:text-sm text-[#080869] font-medium">
              {hora} hrs
            </span>
          </div>
          {cita?.clinica && (
            <div className="mt-3 pt-3 border-t-2 border-dashed border-[#080869]/15 text-center">
              <p className="text-[10px] uppercase tracking-widest text-[#080869]/60 font-bold">
                Clínica
              </p>
              <p className="font-display font-bold text-[#080869] text-sm sm:text-base break-words">
                {cita.clinica}
              </p>
              {cita.especialidad && (
                <p className="text-xs text-[#080869]/70 mt-0.5">{cita.especialidad}</p>
              )}
            </div>
          )}
        </div>

        {/* Botón notificación */}
        <div className="relative mx-4 sm:mx-5 my-4">
          <button className="w-full bg-white border-[3px] border-[#E6A231] rounded-full py-2.5 sm:py-3 px-4 font-display italic text-[#080869] text-sm sm:text-base shadow-[3px_3px_0px_#080869] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2">
            <Bell className="w-4 h-4 shrink-0" />
            <span className="truncate">Recibir mensaje de confirmación</span>
          </button>
        </div>
      </div>
    </div>
  )
}
