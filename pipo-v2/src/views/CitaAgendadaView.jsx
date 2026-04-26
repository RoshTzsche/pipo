import React from 'react'
import { useAppContext } from '../context/AppContext.jsx'
import { TalaveraCorner, TalaveraPattern } from '../components/TalaveraPattern.jsx'
import { PipoMascot } from '../components/PipoMascot.jsx'

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]

const DIAS_SEMANA = ['L','M','X','J','V','S','D']

function buildCalendar(year, month) {
  // month 0-11
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  // dayOfWeek con lunes=0
  let startDay = firstDay.getDay() - 1
  if (startDay < 0) startDay = 6

  const cells = []
  // Días del mes anterior visibles
  const prevMonthLast = new Date(year, month, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthLast - i, current: false, weekend: false })
  }
  // Días del mes actual
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(year, month, d)
    const dow = dayDate.getDay()
    cells.push({ day: d, current: true, weekend: dow === 0 || dow === 6 })
  }
  // Llenar trailing hasta múltiplo de 7
  let trailing = 1
  while (cells.length % 7 !== 0) {
    cells.push({ day: trailing++, current: false, weekend: false })
  }
  return cells
}

export default function CitaAgendadaView() {
  const { cita, setQrModalOpen } = useAppContext()

  const fechaCita = cita?.fecha ? new Date(cita.fecha) : new Date()
  const year = fechaCita.getFullYear()
  const month = fechaCita.getMonth()
  const day = fechaCita.getDate()

  const cells = buildCalendar(year, month)

  return (
    <div className="relative min-h-full w-full flex flex-col bg-[#ECF9FF] overflow-hidden">
      <TalaveraPattern opacity={0.04} />
      <TalaveraCorner position="top-left" size={130} />
      <TalaveraCorner position="top-right" size={130} />

      {/* Logo small esquina */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1">
        <div className="w-3 h-3 rotate-45 bg-[#080869]" />
      </div>

      {/* Título */}
      <div className="relative z-10 pt-32 px-6 text-center">
        <h1 className="font-display font-black text-[#080869] text-3xl md:text-4xl italic leading-tight">
          ¡He agendado una<br/>cita para ti!
        </h1>
      </div>

      {/* Calendario */}
      <div className="relative z-10 mx-4 mt-6 dashed-talavera p-4 bg-[#ECF9FF] animate-slideUp">
        {/* Patrón sutil dentro del calendario */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none rounded-3xl overflow-hidden">
          <TalaveraPattern opacity={0.5} />
        </div>

        {/* Header del calendario */}
        <div className="relative bg-white border-2 border-[#E6A231] rounded-2xl px-4 py-2 mb-3 shadow-[2px_2px_0px_rgba(230,162,49,0.4)]">
          <p className="font-display text-2xl text-[#080869] text-center italic font-bold">
            {MESES[month]}
          </p>
        </div>

        {/* Días de la semana */}
        <div className="relative grid grid-cols-7 gap-1 mb-2">
          {DIAS_SEMANA.map((d, i) => (
            <div key={i} className="text-center text-xs font-bold text-[#080869]/50 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Celdas */}
        <div className="relative grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            const isCita = cell.current && cell.day === day
            return (
              <div
                key={i}
                className={`relative aspect-square flex items-center justify-center text-sm font-display font-bold ${
                  !cell.current
                    ? 'text-[#080869]/20'
                    : cell.weekend
                      ? 'text-[#8B1538]'
                      : 'text-[#080869]'
                }`}
              >
                {/* Círculo de pétalos para el día de la cita */}
                {isCita && (
                  <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full">
                    {Array.from({ length: 12 }).map((_, idx) => (
                      <ellipse
                        key={idx}
                        cx="20"
                        cy="3"
                        rx="2"
                        ry="4"
                        fill="#080869"
                        transform={`rotate(${idx * 30} 20 20)`}
                      />
                    ))}
                  </svg>
                )}
                <span className="relative z-10">{cell.day}</span>
              </div>
            )
          })}
        </div>

        {/* Esquinas decorativas del calendario */}
        <div className="absolute -top-2 -left-2 w-4 h-4 rotate-45 bg-[#080869]" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 rotate-45 bg-[#080869]" />
      </div>

      {/* Botón Detalles */}
      <div className="relative z-10 mx-4 mt-5">
        <button
          onClick={() => setQrModalOpen(true)}
          className="w-full bg-white border-[3px] border-[#080869] rounded-full py-4 px-6 font-display font-bold italic text-[#080869] text-xl shadow-[4px_4px_0px_#E6A231] hover:translate-y-1 hover:shadow-none transition-all"
        >
          ¡Detalles de tu cita!
        </button>
      </div>

      {/* Pipo + texto inferior */}
      <div className="relative z-10 mt-6 mb-4 px-4 flex items-end justify-between gap-3">
        <div className="w-32 md:w-40 animate-float">
          <PipoMascot variant="flying" className="w-full h-auto" />
        </div>
        <p className="font-display italic text-[#080869] text-base md:text-lg flex-1 text-right max-w-[180px] leading-snug">
          Revisa todo<br/>
          sobre tu<br/>
          próxima cita…
        </p>
      </div>
    </div>
  )
}
