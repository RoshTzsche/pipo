import React from 'react'
import { ArrowLeft, PhoneCall, AlertTriangle, HeartPulse, Globe, Clock, ExternalLink } from 'lucide-react'

export default function DirectorioPanel({ onBack }) {
  const telefonos = [
    {
      id: 'emergencias',
      titulo: 'Emergencias',
      numero: '911',
      horario: '24/7 los 365 días',
      desc: 'Atención inmediata',
      color: 'bg-[#8B1538]/10',
      border: 'border-[#8B1538]',
      text: 'text-[#8B1538]',
      icon: AlertTriangle
    },
    {
      id: 'imss-citas',
      titulo: 'IMSS Citas Médicas',
      numero: '800 681 2525',
      horario: 'Lun-Vie 8:00-20:00 / Sáb-Dom 8:00-14:00',
      desc: 'Agenda, consulta y cancela',
      color: 'bg-[#ECF9FF]',
      border: 'border-[#080869]',
      text: 'text-[#080869]',
      icon: PhoneCall
    },
    {
      id: 'imss-orientacion',
      titulo: 'IMSS Orientación',
      numero: '800 623 2323',
      horario: '24/7 los 365 días',
      desc: 'Dudas y trámites',
      color: 'bg-[#ECF9FF]',
      border: 'border-[#080869]',
      text: 'text-[#080869]',
      icon: PhoneCall
    },
    {
      id: 'linea-vida',
      titulo: 'Línea de la Vida (CONASAMA)',
      numero: '800 911 2000',
      horario: '24/7 los 365 días',
      desc: 'Apoyo emocional y salud mental',
      color: 'bg-[#FFF4E0]',
      border: 'border-[#E6A231]',
      text: 'text-[#E6A231]',
      icon: HeartPulse
    },
    {
      id: 'saptel',
      titulo: 'SAPTEL (Cruz Roja)',
      numero: '800 472 7835',
      horario: '24/7 los 365 días',
      desc: 'Intervención en crisis',
      color: 'bg-[#FFF4E0]',
      border: 'border-[#E6A231]',
      text: 'text-[#E6A231]',
      icon: HeartPulse
    }
  ]

  const portales = [
    { nombre: 'Gobierno del Estado de Puebla', url: 'https://puebla.gob.mx' },
    { nombre: 'Secretaría de Salud Puebla', url: 'https://ss.puebla.gob.mx' },
    { nombre: 'IMSS Digital', url: 'https://www.imss.gob.mx/imssdigital' },
    { nombre: 'Directorio de clínicas IMSS', url: 'https://www.imss.gob.mx/directorio' },
    { nombre: 'IMSS Bienestar', url: 'https://imssbienestar.gob.mx' },
    { nombre: 'Plan Estatal de Desarrollo Puebla', url: 'https://planestatal.puebla.gob.mx' }
  ]

  return (
    <div className="absolute inset-0 bg-[#ECF9FF] flex flex-col overflow-y-auto z-50">
      {/* Header */}
      <div className="bg-[#080869] text-white px-5 py-5 sm:px-6 sm:py-6 border-b-[6px] border-[#E6A231] flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          aria-label="Volver al menú"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <div>
          <h2 className="font-display font-black text-xl sm:text-2xl tracking-wide">Directorio</h2>
          <p className="text-[10px] uppercase tracking-widest text-[#E6A231] font-bold">
            Contactos oficiales
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-5 py-5 space-y-6">
        
        {/* === SECCIÓN: Teléfonos === */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <PhoneCall className="w-4 h-4 text-[#080869]" strokeWidth={2.5} />
            <h3 className="font-display font-black text-[#080869] text-sm uppercase tracking-wider">
              Líneas de Atención
            </h3>
          </div>
          
          <div className="space-y-3">
            {telefonos.map((tel) => (
              <a
                key={tel.id}
                href={`tel:${tel.numero.replace(/\s+/g, '')}`}
                className={`block relative overflow-hidden rounded-2xl border-[3px] p-3 transition-transform hover:-translate-y-1 ${tel.border} ${tel.color} shadow-[3px_3px_0px_rgba(8,8,105,0.15)]`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-70 mb-0.5 truncate" style={{ color: tel.text.replace('text-', '') }}>
                      {tel.desc}
                    </p>
                    <h4 className="font-display font-black text-base sm:text-lg leading-tight mb-1" style={{ color: tel.text.replace('text-', '') }}>
                      {tel.titulo}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-2">
                      <tel.icon className="w-4 h-4" style={{ color: tel.text.replace('text-', '') }} />
                      <span className="font-mono font-bold text-lg sm:text-xl" style={{ color: tel.text.replace('text-', '') }}>
                        {tel.numero}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 opacity-80" style={{ color: tel.text.replace('text-', '') }}>
                      <Clock className="w-3 h-3 shrink-0" />
                      <span className="text-[10px] font-medium leading-none">
                        {tel.horario}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* === SECCIÓN: Portales Web === */}
        <section className="pb-6">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-[#080869]" strokeWidth={2.5} />
            <h3 className="font-display font-black text-[#080869] text-sm uppercase tracking-wider">
              Portales Web Oficiales
            </h3>
          </div>
          
          <div className="bg-white border-[3px] border-[#080869] rounded-2xl shadow-[3px_3px_0px_rgba(8,8,105,0.15)] overflow-hidden">
            <ul className="divide-y-2 divide-dashed divide-[#080869]/10">
              {portales.map((portal, idx) => (
                <li key={idx}>
                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 p-3 sm:p-4 hover:bg-[#ECF9FF] transition-colors group"
                  >
                    <span className="font-medium text-xs sm:text-sm text-[#080869] group-hover:font-bold transition-all">
                      {portal.nombre}
                    </span>
                    <ExternalLink className="w-4 h-4 text-[#E6A231] shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

      </div>
    </div>
  )
}