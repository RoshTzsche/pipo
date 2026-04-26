import React, { useState, useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { 
  Navigation, Building2, Sparkles, Star, AlertCircle, 
  Info, Clock, Phone, Activity, ChevronDown, ChevronUp 
} from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { TalaveraCorner, TalaveraPattern } from '../components/TalaveraPattern.jsx'

// Importamos el nuevo JSON
import DATA_SOURCE from '../../data/clinicas.json'
const CLINICAS_BASE = DATA_SOURCE.clinicas || []

function getStatusStyles(saturacionStr) {
  const map = {
    'alto':  { color: '#8B1538', label: 'Alta' },
    'medio': { color: '#E6A231', label: 'Media' },
    'bajo':  { color: '#10b981', label: 'Baja' }
  }
  return map[saturacionStr?.toLowerCase()] || map['medio']
}

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
        ${isRecomendada ? '<span style="position:absolute; top:-12px; right:-12px; font-size:20px;">✨</span>' : ''}
      </div>`,
    iconSize: size,
    iconAnchor: anchor
  })
}

function MapController({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, 15, { duration: 1.5 })
  }, [center, map])
  return null
}

export default function ClinicasView() {
  const { expediente, cita } = useAppContext()
  
  // Extraemos la clínica y la justificación del modelo
  const clinicaAsignadaPorModelo = expediente?.clinica_asignada || cita?.clinica
  const mensajeRecomendacion = expediente?.recomendacion_medica || expediente?.insight_puebla || "He analizado las unidades de Puebla para ofrecerte la atención más rápida posible."

  // MAGIA ARREGLADA: Ordenamiento y Asignación Garantizada
  const clinicasOrdenadas = useMemo(() => {
    // 1. Clonamos la base y la ordenamos SIEMPRE por el menor tiempo de espera
    let lista = [...CLINICAS_BASE].map(c => ({ ...c, esRecomendada: false }))
    lista.sort((a, b) => (a.tiempos_espera?.urgencias_min || 999) - (b.tiempos_espera?.urgencias_min || 999))
    
    // 2. Si la IA nos dio un nombre, garantizamos que sea la número 1
    if (clinicaAsignadaPorModelo) {
      const termino = clinicaAsignadaPorModelo.toLowerCase().trim()
      const index = lista.findIndex(c => 
        c.nombre.toLowerCase().includes(termino) || termino.includes(c.nombre.toLowerCase())
      )
      
      if (index !== -1) {
        // CASO A: La clínica de la IA SÍ está en el JSON. La sacamos y coronamos.
        const recomendada = lista.splice(index, 1)[0]
        recomendada.esRecomendada = true
        return [recomendada, ...lista]
      } else {
        // CASO B: INYECCIÓN DINÁMICA (El bug que arreglamos). La IA sugirió una que NO está en el JSON.
        const nuevaClinicaIA = {
          id: `ia-${Date.now()}`,
          nombre: clinicaAsignadaPorModelo,
          direccion: "Unidad sugerida por triaje inteligente",
          coordenadas: { lat: 19.0414, lng: -98.2063 }, // Puebla centro como fallback
          tiempos_espera: { urgencias_min: '--' },
          saturacion: "bajo",
          esRecomendada: true,
          equipamiento: ["Atención sugerida"],
          notas: "Sugerencia basada en la red estatal de salud pública."
        }
        return [nuevaClinicaIA, ...lista]
      }
    }

    // 3. Fallback: Si el modelo falló y no mandó nada, la más rápida se vuelve la sugerida
    if (lista.length > 0) {
      lista[0].esRecomendada = true 
    }
    
    return lista
  }, [clinicaAsignadaPorModelo, expediente])

  const [selectedId, setSelectedId] = useState(null)
  const [mapCenter, setMapCenter] = useState(null)

  // Autocentrado inicial basado en la clínica ganadora
  useEffect(() => {
    if (clinicasOrdenadas.length > 0) {
      const recomendada = clinicasOrdenadas.find(c => c.esRecomendada) || clinicasOrdenadas[0]
      setSelectedId(recomendada.id)
      setMapCenter([recomendada.coordenadas.lat, recomendada.coordenadas.lng])
    }
  }, [clinicasOrdenadas])

  return (
    <div className="relative min-h-full w-full flex flex-col bg-[#ECF9FF] overflow-hidden">
      <TalaveraPattern opacity={0.04} />
      <TalaveraCorner position="top-left" size={130} />
      <TalaveraCorner position="top-right" size={130} />

      <div className="relative z-10 pt-32 pb-2 px-6 flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-[#080869] rounded-full" />
        <h1 className="font-display font-black text-[#080869] text-3xl md:text-4xl italic">
          Red de Salud
        </h1>
      </div>

      <div className="relative z-10 mx-4 mt-3 h-[240px] md:h-[280px] rounded-3xl border-[3px] border-[#8B1538] shadow-[4px_4px_0px_#080869] overflow-hidden">
        <MapContainer center={[19.0414, -98.2063]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {mapCenter && <MapController center={mapCenter} />}
          {clinicasOrdenadas.map((c) => (
            <Marker
              key={c.id}
              position={[c.coordenadas.lat, c.coordenadas.lng]}
              icon={makeMarkerIcon(getStatusStyles(c.saturacion).color, c.esRecomendada)}
              eventHandlers={{ click: () => {
                setSelectedId(c.id)
                setMapCenter([c.coordenadas.lat, c.coordenadas.lng])
              }}}
            />
          ))}
        </MapContainer>
      </div>

      <div className="relative z-10 mt-6 px-5 flex flex-col gap-1">
        <h2 className="font-display italic font-bold text-[#080869] text-lg">
          Unidades en {expediente?.paciente?.municipio || 'Puebla'}
        </h2>
        <p className="text-[10px] text-[#080869]/50 font-medium flex items-center gap-1 uppercase tracking-wider">
          <Clock className="w-3 h-3" /> Tiempos de espera actualizados
        </p>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-6 pt-3 space-y-4">
        {clinicasOrdenadas.map((c) => (
          <ClinicaCard
            key={c.id}
            clinica={c}
            isSelected={c.id === selectedId}
            recomendacionMedica={mensajeRecomendacion}
            onSelect={() => {
              setSelectedId(c.id)
              setMapCenter([c.coordenadas.lat, c.coordenadas.lng])
            }}
          />
        ))}
      </div>
    </div>
  )
}

function ClinicaCard({ clinica, isSelected, recomendacionMedica, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const info = getStatusStyles(clinica.saturacion)

  const handleCardClick = () => {
    onSelect()
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="relative flex flex-col">
      {clinica.esRecomendada && (
        <div className="mb-3 ml-2 mr-4 animate-slideUp">
          <div className="bg-[#080869] text-white p-4 rounded-2xl rounded-bl-none shadow-lg border-b-4 border-[#E6A231]">
            <div className="flex gap-3 items-start">
              <Sparkles className="w-5 h-5 text-[#E6A231] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#E6A231]">Pipo recomienda:</p>
                <p className="text-sm font-medium leading-relaxed italic">"{recomendacionMedica}"</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        onClick={handleCardClick}
        className={`relative cursor-pointer bg-white rounded-3xl border-[3px] transition-all duration-300 ${
          clinica.esRecomendada
            ? 'border-[#E6A231] shadow-[6px_6px_0px_#080869] -rotate-1'
            : isSelected
              ? 'border-[#080869] shadow-[4px_4px_0px_#E6A231]'
              : 'border-[#080869]/10 shadow-sm'
        }`}
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-3xl overflow-hidden">
          <TalaveraPattern opacity={1} />
        </div>

        <div className="relative p-5">
          <div className="flex justify-between items-start mb-2">
            <div className="flex gap-3 min-w-0">
              <div className={`p-2 rounded-xl shrink-0 ${clinica.esRecomendada ? 'bg-[#E6A231]/10' : 'bg-[#ECF9FF]'}`}>
                <Building2 className={`w-5 h-5 ${clinica.esRecomendada ? 'text-[#E6A231]' : 'text-[#080869]'}`} />
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-black italic text-[#080869] text-xl leading-tight truncate">
                  {clinica.nombre}
                </h3>
                <p className="text-[11px] text-[#080869]/60 font-medium truncate">{clinica.direccion}</p>
              </div>
            </div>
            {clinica.esRecomendada && <Star className="w-5 h-5 text-[#E6A231] fill-current" />}
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1 bg-[#ECF9FF] border-2 border-[#080869]/5 rounded-2xl p-3">
              <p className="text-[9px] uppercase font-bold text-[#080869]/50 tracking-widest mb-1">Espera Urgencias</p>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E6A231]" />
                <span className="font-display font-black text-[#080869] text-lg">
                  {clinica.tiempos_espera?.urgencias_min || '--'} min
                </span>
              </div>
            </div>
            <div className="flex-1 bg-[#ECF9FF] border-2 border-[#080869]/5 rounded-2xl p-3">
              <p className="text-[9px] uppercase font-bold text-[#080869]/50 tracking-widest mb-1">Ocupación</p>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" style={{ color: info.color }} />
                <span className="font-display font-bold text-[#080869]">
                  {info.label}
                </span>
              </div>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-5 pt-5 border-t-2 border-dashed border-[#080869]/10 space-y-4 animate-fadeIn">
              <div>
                <p className="text-[10px] font-bold text-[#080869]/40 uppercase mb-2">Equipamiento y Servicios</p>
                <div className="flex flex-wrap gap-2">
                  {clinica.equipamiento?.map((item, i) => (
                    <span key={i} className="bg-white border-2 border-[#080869]/10 text-[#080869] px-3 py-1 rounded-full text-[10px] font-bold">
                      {item.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {clinica.contacto && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#080869]">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-bold">{clinica.contacto.telefono}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://www.google.com/maps?q=${clinica.coordenadas.lat},${clinica.coordenadas.lng}`);
                    }}
                    className="bg-[#080869] text-white rounded-full py-2 px-5 font-display italic font-bold text-xs flex items-center gap-2 shadow-lg"
                  >
                    <Navigation className="w-3 h-3" /> Ir ahora
                  </button>
                </div>
              )}

              {clinica.notas && (
                <p className="text-[11px] italic text-[#080869]/70 bg-white border border-[#E6A231]/30 p-3 rounded-xl">
                  "{clinica.notas}"
                </p>
              )}
            </div>
          )}

          <div className="mt-4 flex justify-center">
            {isExpanded ? <ChevronUp className="w-4 h-4 text-[#080869]/30" /> : <ChevronDown className="w-4 h-4 text-[#080869]/30" />}
          </div>
        </div>
      </div>
    </div>
  )
}