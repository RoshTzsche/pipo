import React, { useState, useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Navigation, Building2, Sparkles, Star } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { TalaveraCorner, TalaveraPattern } from '../components/TalaveraPattern.jsx'

// Importamos el JSON que migraste
import CLINICAS_DATA from '../../data/clinicas.json'

/**
 * Determina el color y etiqueta según la saturación de la clínica.
 */
function getSaturacionInfo(s) {
  if (s >= 75) return { color: '#8B1538', label: 'Saturación alta' }
  if (s >= 50) return { color: '#E6A231', label: 'Saturación media' }
  return { color: '#10b981', label: 'Saturación baja' }
}

/**
 * Crea un icono personalizado para Leaflet. 
 * Si es la recomendada por la IA, tiene un diseño más grande y dorado.
 */
function makeMarkerIcon(color, isRecomendada) {
  const size = isRecomendada ? [42, 50] : [32, 40]
  const anchor = isRecomendada ? [21, 50] : [16, 40]

  return L.divIcon({
    className: 'pipo-marker',
    html: `
      <div style="position:relative; width: 100%; height: 100%;">
        <svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" style="filter: ${isRecomendada ? 'drop-shadow(0px 0px 8px #E6A231)' : 'none'}">
          <path d="M 16 2 C 8 2 2 8 2 16 C 2 24 16 38 16 38 C 16 38 30 24 30 16 C 30 8 24 2 16 2 Z"
                fill="${color}" stroke="${isRecomendada ? '#E6A231' : '#080869'}" stroke-width="${isRecomendada ? '3' : '2'}"/>
          <circle cx="16" cy="15" r="5" fill="#FFFFFF"/>
        </svg>
        ${isRecomendada ? '<span style="position:absolute; top:-12px; right:-12px; font-size:20px; animation: bounce 2s infinite;">✨</span>' : ''}
      </div>`,
    iconSize: size,
    iconAnchor: anchor
  })
}

/**
 * Controlador para mover el mapa suavemente.
 */
function MapController({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, 15, { duration: 1.5 })
  }, [center, map])
  return null
}

export default function ClinicasView() {
  const { expediente } = useAppContext()
  
  // 1. Extraemos la decisión de los modelos del expediente
  const clinicaAsignadaNombre = expediente?.clinica_asignada
  const recomendacionMedica = expediente?.recomendacion_medica

  // 2. Lógica de ordenamiento Robusta (Tip Pro)
  const clinicasOrdenadas = useMemo(() => {
    let base = [...CLINICAS_DATA].sort((a, b) => a.saturacion - b.saturacion)
    
    if (clinicaAsignadaNombre) {
      // Buscamos la clínica que eligió el Agente 2
      const index = base.findIndex(c => 
        c.nombre.toLowerCase().trim() === clinicaAsignadaNombre.toLowerCase().trim()
      )
      
      if (index !== -1) {
        // La extraemos de su posición original y la ponemos al principio (Index 0)
        const recomendada = base.splice(index, 1)[0]
        return [recomendada, ...base]
      }
    }
    return base
  }, [clinicaAsignadaNombre])

  const [selectedId, setSelectedId] = useState(clinicasOrdenadas[0]?.id)
  const [mapCenter, setMapCenter] = useState(clinicasOrdenadas[0]?.coords)

  const handleSelect = (clinica) => {
    setSelectedId(clinica.id)
    setMapCenter(clinica.coords)
  }

  const handleComoLlegar = (clinica) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${clinica.coords[0]},${clinica.coords[1]}`
    window.open(url, '_blank')
  }

  return (
    <div className="relative min-h-full w-full flex flex-col bg-[#ECF9FF] overflow-hidden">
      <TalaveraPattern opacity={0.04} />
      <TalaveraCorner position="top-left" size={130} />
      <TalaveraCorner position="top-right" size={130} />

      {/* Cabecera */}
      <div className="relative z-10 pt-32 pb-2 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-[#080869] rounded-full" />
          <h1 className="font-display font-black text-[#080869] text-3xl md:text-4xl italic">
            Red de Clínicas
          </h1>
        </div>
      </div>

      {/* Mapa Interactivo */}
      <div className="relative z-10 mx-4 mt-3 h-[280px] md:h-[340px] rounded-3xl border-[3px] border-[#8B1538] shadow-[4px_4px_0px_#080869] overflow-hidden">
        <MapContainer
          center={[19.0414, -98.2063]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='© OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={mapCenter} />
          {clinicasOrdenadas.map((clinica) => {
            const isRecomendada = clinica.nombre === clinicaAsignadaNombre
            const info = getSaturacionInfo(clinica.saturacion)
            return (
              <Marker
                key={clinica.id}
                position={clinica.coords}
                icon={makeMarkerIcon(info.color, isRecomendada)}
                eventHandlers={{ click: () => handleSelect(clinica) }}
              >
                <Popup>
                  <div className="font-display font-bold text-[#080869] text-sm">
                    {isRecomendada ? '⭐ ' : ''}{clinica.nombre}
                  </div>
                  <div className="text-xs text-[#080869]/70">{clinica.direccion}</div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      <div className="relative z-10 mt-6 px-5 flex items-center gap-2">
        <h2 className="font-display italic font-bold text-[#080869] text-lg">
          {clinicaAsignadaNombre ? 'Nuestra recomendación' : 'Clínicas cercanas'}
        </h2>
      </div>

      {/* Lista de Tarjetas */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-10 pt-3 space-y-5">
        {clinicasOrdenadas.map((clinica, index) => {
          const isRecomendada = clinica.nombre === clinicaAsignadaNombre
          return (
            <ClinicaCard
              key={clinica.id}
              clinica={clinica}
              isSelected={clinica.id === selectedId}
              isRecomendada={isRecomendada}
              recomendacionMedica={recomendacionMedica}
              onSelect={() => handleSelect(clinica)}
              onComoLlegar={() => handleComoLlegar(clinica)}
            />
          )
        })}
      </div>
    </div>
  )
}

/**
 * Componente de Tarjeta con el "Punch" de la IA
 */
function ClinicaCard({ clinica, isSelected, isRecomendada, recomendacionMedica, onSelect, onComoLlegar }) {
  const info = getSaturacionInfo(clinica.saturacion)

  return (
    <div className="relative flex flex-col group">
      {/* GLOBO DE PIPO (Explicación del Agente 2) */}
      {isRecomendada && recomendacionMedica && (
        <div className="mb-3 ml-2 mr-4 animate-slideUp">
          <div className="bg-[#080869] text-white p-4 rounded-2xl rounded-bl-none shadow-lg relative border-b-4 border-[#E6A231]">
            <div className="flex gap-3 items-start">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Sparkles className="w-5 h-5 text-[#E6A231]" />
              </div>
              <p className="text-sm font-medium leading-relaxed italic">
                "{recomendacionMedica}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CUERPO DE LA TARJETA */}
      <div
        onClick={onSelect}
        className={`relative cursor-pointer bg-white rounded-3xl border-[3px] transition-all duration-300 overflow-hidden ${
          isRecomendada
            ? 'border-[#E6A231] shadow-[6px_6px_0px_#080869] -rotate-1 scale-[1.02]'
            : isSelected
              ? 'border-[#E6A231] shadow-[4px_4px_0px_#080869] scale-[1.01]'
              : 'border-[#080869]/20 hover:border-[#080869]/40 shadow-sm'
        }`}
      >
        {/* Marca de agua Talavera */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <TalaveraPattern opacity={1} />
        </div>

        {/* Badge "Recomendado" */}
        {isRecomendada && (
          <div className="absolute top-0 right-0 bg-[#E6A231] text-[#080869] px-4 py-1 rounded-bl-2xl font-display font-black text-[10px] uppercase tracking-tighter flex items-center gap-1 z-20">
            <Star className="w-3 h-3 fill-current" />
            Mejor Opción
          </div>
        )}

        <div className="absolute left-0 top-0 bottom-0 w-2.5" style={{ backgroundColor: info.color }} />

        <div className="relative pl-6 pr-4 py-5">
          <div className="flex items-start gap-3 mb-3">
            <Building2 className="w-5 h-5 text-[#080869]/40 mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-black italic text-[#080869] text-2xl leading-none">
                {clinica.nombre}
              </h3>
              <p className="text-xs text-[#080869]/60 mt-1.5 font-medium">{clinica.direccion}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className="inline-flex items-center gap-1.5 bg-white border-2 rounded-full px-3 py-1 text-[11px] font-display italic font-bold"
              style={{ borderColor: info.color, color: info.color }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: info.color }} />
              {info.label} ({clinica.saturacion}%)
            </span>
            
            {/* Capacidades destacadas (simuladas o del JSON) */}
            {clinica.capacidades?.slice(0, 2).map((cap, i) => (
              <span key={i} className="bg-[#ECF9FF] border-2 border-[#080869]/10 text-[#080869]/70 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {cap}
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-2 border-t border-dashed border-[#080869]/10">
            <button
              onClick={(e) => { e.stopPropagation(); onComoLlegar(); }}
              className="flex-1 bg-[#080869] text-white rounded-full py-2.5 px-4 font-display italic font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#080869]/90 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Cómo llegar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}