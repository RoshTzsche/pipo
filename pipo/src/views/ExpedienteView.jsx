import React from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import {
  FileText, MapPin, Calendar, User, AlertTriangle,
  AlertCircle, CheckCircle2, Activity, MessageSquare, ArrowRight
} from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import TalaveraPattern from '../components/TalaveraPattern.jsx'

const CATEGORIA_CONFIG = {
  URGENTE:  { color: '#8B1538', label: 'URGENTE',  icon: AlertTriangle, bg: 'bg-[#8B1538]' },
  MODERADO: { color: '#E6A231', label: 'MODERADO', icon: AlertCircle,   bg: 'bg-[#E6A231]' },
  LEVE:     { color: '#10b981', label: 'LEVE',     icon: CheckCircle2,  bg: 'bg-[#10b981]' }
}

export default function ExpedienteView() {
  const { expediente, setCurrentView } = useAppContext()

  if (!expediente) {
    return (
      <div className="relative min-h-full pb-20 md:pb-0 flex items-center justify-center px-6">
        <TalaveraPattern />
        <div className="relative bg-white border-[3px] border-[#080869] rounded-2xl shadow-[4px_4px_0px_rgba(8,8,105,0.15)] p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#ECF9FF] border-2 border-[#080869] flex items-center justify-center">
            <FileText className="w-10 h-10 text-[#080869]" />
          </div>
          <h2 className="font-black uppercase tracking-widest text-[#080869] text-xl mb-2">
            Sin expediente
          </h2>
          <p className="text-[#080869]/70 text-sm mb-6">
            Aún no tienes un expediente generado. Habla con Pipo para crear uno.
          </p>
          <button
            onClick={() => setCurrentView('chat')}
            className="inline-flex items-center gap-2 bg-[#080869] text-white border-2 border-[#080869] rounded-2xl px-5 py-3 font-black uppercase tracking-wider text-sm shadow-[3px_3px_0px_#E6A231] hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            Ir al chat
          </button>
        </div>
      </div>
    )
  }

  const { paciente, clinico, insight_puebla, prioridad_num, id, fecha } = expediente
  const categoria = clinico?.categoria || 'LEVE'
  const config = CATEGORIA_CONFIG[categoria] || CATEGORIA_CONFIG.LEVE
  const CategoriaIcon = config.icon

  const fechaFormat = fecha
    ? new Date(fecha).toLocaleString('es-MX', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : new Date().toLocaleString('es-MX')

  const expedienteId = id || `PUE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  const prioridad = Math.max(1, Math.min(10, Number(prioridad_num) || 1))
  const barColor = prioridad >= 8 ? '#8B1538' : prioridad >= 5 ? '#E6A231' : '#10b981'

  return (
    <div className="relative min-h-full pb-20 md:pb-0">
      <TalaveraPattern />

      {/* Header */}
      <header className="relative bg-[#080869] border-b-[6px] border-[#E6A231] text-white px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E6A231] flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#080869]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#E6A231]">
                Expediente Clínico IMSS
              </p>
              <h2 className="font-black uppercase tracking-wider text-xl md:text-2xl">
                {paciente?.nombre || 'Paciente'}
              </h2>
            </div>
          </div>
          <div
            className={`inline-flex items-center gap-2 ${config.bg} text-white px-4 py-2 rounded-full font-black uppercase tracking-widest text-sm shadow-[3px_3px_0px_rgba(0,0,0,0.3)] self-start md:self-auto`}
          >
            <CategoriaIcon className="w-4 h-4" />
            {config.label}
          </div>
        </div>
      </header>

      {/* Grid */}
      <div className="relative p-4 md:p-8 grid md:grid-cols-2 gap-6">
        {/* IZQUIERDA */}
        <div className="space-y-6">
          {/* QR */}
          <div className="bg-white border-[3px] border-[#080869] rounded-2xl shadow-[4px_4px_0px_rgba(8,8,105,0.15)] p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#080869]/60 mb-3">
              Código de Identificación
            </p>
            <div className="flex justify-center bg-[#ECF9FF] border-2 border-[#080869]/20 rounded-2xl p-4">
              <QRCodeCanvas
                value={JSON.stringify(expediente)}
                size={180}
                bgColor="#ECF9FF"
                fgColor="#080869"
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-[10px] uppercase tracking-widest text-[#080869]/60 font-bold">
                ID Único
              </p>
              <p className="font-black tracking-wider text-[#080869] text-lg">
                {expedienteId}
              </p>
              <p className="text-xs text-[#080869]/50 mt-1">
                Personal médico escanea para ver datos completos
              </p>
            </div>
          </div>

          {/* Datos demográficos */}
          <div className="bg-white border-[3px] border-[#080869] rounded-2xl shadow-[4px_4px_0px_rgba(8,8,105,0.15)] p-6">
            <h3 className="font-black uppercase tracking-widest text-[#080869] text-sm mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#E6A231]" />
              Datos del Paciente
            </h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <DataField label="Nombre" value={paciente?.nombre} />
              <DataField label="Edad"   value={paciente?.edad ? `${paciente.edad} años` : '—'} />
              <DataField label="Sexo"   value={paciente?.sexo} />
              <DataField label="Municipio" value={paciente?.municipio} icon={MapPin} />
              <div className="col-span-2">
                <DataField label="Fecha del registro" value={fechaFormat} icon={Calendar} />
              </div>
            </dl>
          </div>
        </div>

        {/* DERECHA */}
        <div className="space-y-6">
          {/* Síntomas */}
          <div className="bg-white border-[3px] border-[#080869] rounded-2xl shadow-[4px_4px_0px_rgba(8,8,105,0.15)] p-6">
            <h3 className="font-black uppercase tracking-widest text-[#080869] text-sm mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#E6A231]" />
              Cuadro Clínico
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#080869]/60 mb-1">
                  Síntoma principal
                </p>
                <p className="text-[#080869] font-semibold leading-relaxed">
                  {clinico?.sintoma || '—'}
                </p>
              </div>
              <div className="border-t-2 border-dashed border-[#080869]/15 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#080869]/60 mb-1">
                  Evolución
                </p>
                <p className="text-[#080869]/90 text-sm leading-relaxed">
                  {clinico?.evolucion || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Insight Puebla */}
          {insight_puebla && (
            <div className="bg-[#080869] border-[3px] border-[#080869] rounded-2xl shadow-[4px_4px_0px_rgba(230,162,49,0.5)] p-6 text-white">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E6A231] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#080869]" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#E6A231] mb-1">
                    Insight Puebla
                  </p>
                  <p className="text-sm leading-relaxed">{insight_puebla}</p>
                </div>
              </div>
            </div>
          )}

          {/* Severidad */}
          <div className="bg-white border-[3px] border-[#080869] rounded-2xl shadow-[4px_4px_0px_rgba(8,8,105,0.15)] p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black uppercase tracking-widest text-[#080869] text-sm">
                Nivel de Prioridad
              </h3>
              <span className="font-black text-2xl text-[#080869]">
                {prioridad}<span className="text-base text-[#080869]/40">/10</span>
              </span>
            </div>
            <div className="w-full h-4 bg-[#ECF9FF] border-2 border-[#080869] rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-700 rounded-full"
                style={{ width: `${prioridad * 10}%`, backgroundColor: barColor }}
              />
            </div>
          </div>

          {/* Alert */}
          {categoria === 'URGENTE' && (
            <div className="bg-red-50 border-[3px] border-[#8B1538] rounded-2xl p-4 flex items-start gap-3 shadow-[4px_4px_0px_rgba(139,21,56,0.2)]">
              <AlertTriangle className="w-6 h-6 text-[#8B1538] shrink-0 mt-0.5" />
              <div>
                <p className="font-black uppercase tracking-widest text-[#8B1538] text-sm">
                  Atención Inmediata
                </p>
                <p className="text-sm text-[#8B1538]/90 mt-1">
                  Acude al servicio de urgencias más cercano. Si no puedes trasladarte, llama al 911.
                </p>
              </div>
            </div>
          )}
          {categoria === 'MODERADO' && (
            <div className="bg-amber-50 border-[3px] border-[#E6A231] rounded-2xl p-4 flex items-start gap-3 shadow-[4px_4px_0px_rgba(230,162,49,0.2)]">
              <AlertCircle className="w-6 h-6 text-[#E6A231] shrink-0 mt-0.5" />
              <div>
                <p className="font-black uppercase tracking-widest text-[#080869] text-sm">
                  Atención Presencial Recomendada
                </p>
                <p className="text-sm text-[#080869]/80 mt-1">
                  Te recomendamos agendar cita en una clínica IMSS en las próximas 24 horas.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative px-4 md:px-8 pb-8">
        <button
          onClick={() => setCurrentView('clinicas')}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#080869] text-white border-2 border-[#080869] rounded-2xl px-6 py-4 font-black uppercase tracking-widest text-sm shadow-[3px_3px_0px_#E6A231] hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          <MapPin className="w-4 h-4" />
          Ver clínicas recomendadas
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function DataField({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#080869]/60 mb-1 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </p>
      <p className="text-[#080869] font-bold capitalize">{value || '—'}</p>
    </div>
  )
}
