import React, { useState, useMemo, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import {
  MapPin, Clock, Navigation, Stethoscope, Video,
  Building2, CheckCircle2, X
} from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import TalaveraPattern from '../components/TalaveraPattern.jsx'

const CLINICAS_BASE = [
  {
    id: 1,
    nombre: 'UMF 8 Centro',
    direccion: 'Av. 5 de Mayo, Centro Histórico, Puebla',
    coords: [19.0432, -98.1981],
    saturacion: 65,
    distancia: 2.3,
    tiempo: 12,
    especialidades: ['Medicina General', 'Vacunación']
  },
  {
    id: 2,
    nombre: 'HGZ 6 Angelópolis',
    direccion: 'Blvd. Atlixcáyotl, Angelópolis, Puebla',
    coords: [19.0178, -98.2368],
    saturacion: 40,
    distancia: 5.1,
    tiempo: 18,
    especialidades: ['Cardiología', 'Urgencias', 'Medicina Interna']
  },
  {
    id: 3,
    nombre: 'UMF 20 Cholula',
    direccion: 'Av. 14 Oriente, San Pedro Cholula',
    coords: [19.0636, -98.3027],
    saturacion: 30,
    distancia: 8.4,
    tiempo: 22,
    especialidades: ['Pediatría', 'Ginecología', 'Medicina Familiar']
  },
  {
    id: 4,
    nombre: 'IMSS Valsequillo',
    direccion: 'Carretera Valsequillo, Puebla Sur',
    coords: [18.9956, -98.1825],
    saturacion: 80,
    distancia: 6.7,
    tiempo: 25,
    especialidades: ['Traumatología', 'Ortopedia']
  }
]

function getCategoriaColor(categoria) {
  if (categoria === 'URGENTE')  return '#8B1538'
  if (categoria === 'MODERADO') return '#E6A231'
  return '#10b981'
}

function getSaturacionColor(s) {
  if (s >= 75) return '#8B1538'
  if (s >= 50) return '#E6A231'
  return '#10b981'
}

function makeMarkerIcon(color) {
  return L.divIcon({
    className: 'pipo-marker',
    html: `
      <div style="
        width:36px;height:36px;border-radius:9999px;
        background:${color};border:4px solid #FFFFFF;
        box-shadow:0 4px 8px rgba(0,0,0,0.35), 0 0 0 2px ${color};
        display:flex;align-items:center;justify-content:center;
        color:#fff;font-weight:900;font-size:14px;
      ">+</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  })
}

function MapController({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 1.2 })
  }, [center, map])
  return null
}

export default function ClinicasView() {
  const { expediente } = useAppContext()
  const categoria = expediente?.clinico?.categoria || 'LEVE'
  const markerColor = getCategoriaColor(categoria)
  const isVideoCall = categoria === 'LEVE'

  const [selectedId, setSelectedId] = useState(null)
  const [mapCenter, setMapCenter] = useState(null)
  const [toast, setToast] = useState(null)

  const clinicasOrdenadas = useMemo(() => {
    const urgenciaPeso = categoria === 'URGENTE' ? 100 : categoria === 'MODERADO' ? 50 : 0
    return [...CLINICAS_BASE].sort((a, b) => {
      const scoreA = a.saturacion + a.distancia * 2 - (urgenciaPeso - a.saturacion) * 0.5
      const scoreB = b.saturacion + b.distancia * 2 - (urgenciaPeso - b.saturacion) * 0.5
      return scoreA - scoreB
    })
  }, [categoria])

  const handleSelect = (clinica) => {
    setSelectedId(clinica.id)
    setMapCenter(clinica.coords)
  }

  const handleAgendar = (clinica) => {
    setToast({ id: Date.now(), nombre: clinica.nombre })
    setTimeout(() => setToast(null), 3000)
  }

  const icon = useMemo(() => makeMarkerIcon(markerColor), [markerColor])

  return (
    <div className="relative min-h-full pb-20 md:pb-0">
      <TalaveraPattern />

      {/* Header */}
      <header className="relative bg-[#080869] border-b-[6px] border-[#E6A231] text-white px-4 md:px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E6A231] flex items-center justify-center">
            <MapPin className="w-6 h-6 text-[#080869]" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#E6A231]">
              Red IMSS Puebla
            </p>
            <h2 className="font-black uppercase tracking-widest text-xl md:text-2xl">
              Clínicas recomendadas
            </h2>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="flex flex-col md:flex-row md:h-[calc(100vh-120px)]">
        {/* Mapa */}
        <div className="relative h-[300px] md:h-auto md:w-[60%] border-b-2 md:border-b-0 md:border-r-2 border-[#080869]/20">
          <MapContainer
            center={[19.0414, -98.2063]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={mapCenter} />
            {clinicasOrdenadas.map((clinica) => (
              <Marker
                key={clinica.id}
                position={clinica.coords}
                icon={icon}
                eventHandlers={{ click: () => setSelectedId(clinica.id) }}
              >
                <Popup>
                  <div className="font-bold text-[#080869] text-sm uppercase tracking-wider">
                    {clinica.nombre}
                  </div>
                  <div className="text-xs text-[#080869]/70 mb-2">{clinica.direccion}</div>
                  <button
                    onClick={() => handleSelect(clinica)}
                    className="text-xs bg-[#080869] text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider"
                  >
                    Ver detalle
                  </button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Lista */}
        <div className="flex-1 md:w-[40%] overflow-y-auto p-4 md:p-6 space-y-4 bg-[#ECF9FF]">
          {!expediente && (
            <div className="bg-amber-50 border-[3px] border-[#E6A231] rounded-2xl p-3 text-xs text-[#080869]/80">
              Sugerencia: genera primero un expediente con Pipo para obtener una recomendación personalizada.
            </div>
          )}
          {clinicasOrdenadas.map((clinica) => (
            <ClinicaCard
              key={clinica.id}
              clinica={clinica}
              isSelected={selectedId === clinica.id}
              isVideoCall={isVideoCall}
              onSelect={() => handleSelect(clinica)}
              onAgendar={() => handleAgendar(clinica)}
            />
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          key={toast.id}
          className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-[#080869] text-white border-[3px] border-[#080869] rounded-2xl px-4 py-3 shadow-[4px_4px_0px_#E6A231] animate-[fadeInUp_0.3s_ease-out]"
          style={{ animation: 'fadeInUp 0.3s ease-out' }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#E6A231]" />
            <div>
              <p className="font-black uppercase tracking-wider text-xs text-[#E6A231]">
                Cita confirmada
              </p>
              <p className="text-sm">{toast.nombre}</p>
            </div>
            <button onClick={() => setToast(null)} className="ml-2 text-white/60 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  )
}

function ClinicaCard({ clinica, isSelected, isVideoCall, onSelect, onAgendar }) {
  const satColor = getSaturacionColor(clinica.saturacion)

  return (
    <div
      onClick={onSelect}
      className={`bg-white border-[3px] rounded-2xl p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-[#E6A231] shadow-[4px_4px_0px_#E6A231]'
          : 'border-[#080869] shadow-[4px_4px_0px_rgba(8,8,105,0.15)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(8,8,105,0.15)]'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 flex-1">
          <Building2 className="w-5 h-5 text-[#E6A231] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-black uppercase tracking-wider text-[#080869] text-sm leading-tight">
              {clinica.nombre}
            </h3>
            <p className="text-xs text-[#080869]/60 mt-0.5 line-clamp-2">{clinica.direccion}</p>
          </div>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
            isVideoCall
              ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/40'
              : 'bg-[#080869]/10 text-[#080869] border border-[#080869]/30'
          }`}
        >
          {isVideoCall ? <Video className="w-3 h-3" /> : <Stethoscope className="w-3 h-3" />}
          {isVideoCall ? 'Video' : 'Presencial'}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-[#080869]/70 mb-3">
        <span className="inline-flex items-center gap-1">
          <Navigation className="w-3 h-3" />
          {clinica.distancia} km
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {clinica.tiempo} min
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#080869]/60">
            Saturación
          </span>
          <span className="text-xs font-black" style={{ color: satColor }}>
            {clinica.saturacion}%
          </span>
        </div>
        <div className="w-full h-2 bg-[#ECF9FF] border border-[#080869]/20 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${clinica.saturacion}%`, backgroundColor: satColor }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {clinica.especialidades.map((esp) => (
          <span
            key={esp}
            className="text-[10px] font-bold uppercase tracking-wider bg-[#ECF9FF] text-[#080869] px-2 py-0.5 rounded-full border border-[#080869]/20"
          >
            {esp}
          </span>
        ))}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onAgendar() }}
        className="w-full bg-[#080869] text-white border-2 border-[#080869] rounded-xl px-3 py-2 font-black uppercase tracking-widest text-xs shadow-[2px_2px_0px_#E6A231] hover:translate-y-0.5 hover:shadow-none transition-all"
      >
        Agendar
      </button>
    </div>
  )
}
