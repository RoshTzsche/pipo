import React from 'react'
import {
  LayoutDashboard, FileText, Calendar, ChevronRight,
  AlertTriangle, AlertCircle, CheckCircle2, MessageSquare, Activity
} from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import TalaveraPattern from '../components/TalaveraPattern.jsx'

const CATEGORIA_CONFIG = {
  URGENTE:  { color: '#8B1538', icon: AlertTriangle, bg: 'bg-[#8B1538]' },
  MODERADO: { color: '#E6A231', icon: AlertCircle,   bg: 'bg-[#E6A231]' },
  LEVE:     { color: '#10b981', icon: CheckCircle2,  bg: 'bg-[#10b981]' }
}

export default function DashboardView() {
  const { historialExpedientes, setExpediente, setCurrentView } = useAppContext()

  const handleOpen = (exp) => {
    setExpediente(exp)
    setCurrentView('expediente')
  }

  return (
    <div className="relative min-h-full pb-20 md:pb-0">
      <TalaveraPattern />

      {/* Header */}
      <header className="relative bg-[#080869] border-b-[6px] border-[#E6A231] text-white px-4 md:px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E6A231] flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-[#080869]" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#E6A231]">
              Tu salud en el tiempo
            </p>
            <h2 className="font-black uppercase tracking-widest text-xl md:text-2xl">
              Historial Clínico
            </h2>
          </div>
        </div>
      </header>

      <div className="relative p-4 md:p-8">
        {/* Stats */}
        {historialExpedientes.length > 0 && (
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
            <StatCard
              label="Consultas"
              value={historialExpedientes.length}
              icon={FileText}
            />
            <StatCard
              label="Urgentes"
              value={historialExpedientes.filter(e => e.clinico?.categoria === 'URGENTE').length}
              icon={AlertTriangle}
              color="#8B1538"
            />
            <StatCard
              label="Resueltas"
              value={historialExpedientes.filter(e => e.clinico?.categoria === 'LEVE').length}
              icon={CheckCircle2}
              color="#10b981"
            />
          </div>
        )}

        {historialExpedientes.length === 0 ? (
          <div className="bg-white border-[3px] border-[#080869] rounded-2xl shadow-[4px_4px_0px_rgba(8,8,105,0.15)] p-8 text-center">
            <EmptyIllustration />
            <h3 className="font-black uppercase tracking-widest text-[#080869] text-lg mt-4">
              Sin consultas aún
            </h3>
            <p className="text-[#080869]/70 text-sm mt-2 mb-6">
              Aún no tienes consultas. Habla con Pipo para crear tu primer expediente.
            </p>
            <button
              onClick={() => setCurrentView('chat')}
              className="inline-flex items-center gap-2 bg-[#080869] text-white border-2 border-[#080869] rounded-2xl px-5 py-3 font-black uppercase tracking-wider text-sm shadow-[3px_3px_0px_#E6A231] hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Hablar con Pipo
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {historialExpedientes.map((exp, idx) => (
              <HistorialCard
                key={exp.id || idx}
                expediente={exp}
                onClick={() => handleOpen(exp)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color = '#080869' }) {
  return (
    <div className="bg-white border-[3px] border-[#080869] rounded-2xl shadow-[3px_3px_0px_rgba(8,8,105,0.15)] p-3 md:p-4">
      <div className="flex items-center gap-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}15`, border: `2px solid ${color}` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#080869]/60 truncate">
            {label}
          </p>
          <p className="font-black text-2xl text-[#080869] leading-none">{value}</p>
        </div>
      </div>
    </div>
  )
}

function HistorialCard({ expediente, onClick }) {
  const categoria = expediente.clinico?.categoria || 'LEVE'
  const config = CATEGORIA_CONFIG[categoria] || CATEGORIA_CONFIG.LEVE
  const CategoriaIcon = config.icon

  const fecha = expediente.fecha
    ? new Date(expediente.fecha).toLocaleDateString('es-MX', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    : '—'

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border-[3px] border-[#080869] rounded-2xl shadow-[4px_4px_0px_rgba(8,8,105,0.15)] p-4 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(8,8,105,0.15)] transition-all"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,0.2)]`}
        >
          <CategoriaIcon className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-black uppercase tracking-wider text-[#080869] text-sm truncate">
              {expediente.paciente?.nombre || 'Paciente'}
            </h3>
            <span
              className="text-[9px] font-black uppercase tracking-widest text-white px-2 py-0.5 rounded-full"
              style={{ backgroundColor: config.color }}
            >
              {categoria}
            </span>
          </div>
          <p className="text-xs text-[#080869]/70 truncate flex items-center gap-1">
            <Activity className="w-3 h-3 shrink-0" />
            {expediente.clinico?.sintoma || '—'}
          </p>
          <p className="text-[10px] text-[#080869]/50 mt-1 flex items-center gap-1 uppercase tracking-wider font-bold">
            <Calendar className="w-3 h-3" />
            {fecha}
          </p>
        </div>

        <ChevronRight className="w-5 h-5 text-[#080869]/40 shrink-0" />
      </div>
    </button>
  )
}

function EmptyIllustration() {
  return (
    <svg viewBox="0 0 200 160" className="w-32 h-32 mx-auto" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="30" width="120" height="110" rx="12" fill="#ECF9FF" stroke="#080869" strokeWidth="3" />
      <line x1="55" y1="60" x2="145" y2="60" stroke="#080869" strokeWidth="2" opacity="0.4" />
      <line x1="55" y1="80" x2="125" y2="80" stroke="#080869" strokeWidth="2" opacity="0.4" />
      <line x1="55" y1="100" x2="135" y2="100" stroke="#080869" strokeWidth="2" opacity="0.4" />
      <circle cx="150" cy="40" r="20" fill="#E6A231" stroke="#080869" strokeWidth="3" />
      <text x="150" y="46" textAnchor="middle" fontSize="20" fontWeight="900" fill="#080869">+</text>
    </svg>
  )
}
