import React from 'react'
import { ArrowLeft, User, Type, Eye, Sparkles, Heart } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'

/**
 * Panel de Ajustes que se muestra dentro del SideMenu cuando el usuario
 * selecciona la pestaña "Ajustes". No es una vista nueva: vive dentro del drawer.
 */
export default function SettingsPanel({ onBack }) {
  const {
    expediente,
    fontSize, setFontSize,
    colorBlindMode, setColorBlindMode,
    highContrast, setHighContrast
  } = useAppContext()

  return (
    <div className="absolute inset-0 bg-[#ECF9FF] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="bg-[#080869] text-white px-5 py-5 sm:px-6 sm:py-6 border-b-[6px] border-[#E6A231] flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          aria-label="Volver al menú"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <div>
          <h2 className="font-display font-black text-xl sm:text-2xl tracking-wide">Ajustes</h2>
          <p className="text-[10px] uppercase tracking-widest text-[#E6A231] font-bold">
            Perfil y accesibilidad
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-5 py-4 space-y-5">
        {/* === SECCIÓN: Usuario === */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-[#080869]" strokeWidth={2.5} />
            <h3 className="font-display font-black text-[#080869] text-sm uppercase tracking-wider">
              Tu perfil
            </h3>
          </div>
          <div className="bg-white border-[3px] border-[#080869] rounded-2xl p-4 shadow-[3px_3px_0px_rgba(8,8,105,0.15)]">
            {expediente ? (
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#080869]/60 font-bold">
                    Nombre
                  </p>
                  <p className="font-display font-bold text-[#080869] text-base sm:text-lg">
                    {expediente.paciente?.nombre || 'Sin registro'}
                  </p>
                </div>
                {expediente.paciente?.edad && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#080869]/60 font-bold">
                      Edad
                    </p>
                    <p className="text-sm text-[#080869]">{expediente.paciente.edad} años</p>
                  </div>
                )}
                {expediente.paciente?.municipio && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#080869]/60 font-bold">
                      Municipio
                    </p>
                    <p className="text-sm text-[#080869] capitalize">{expediente.paciente.municipio}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#080869]/60 font-bold">
                    ID de expediente
                  </p>
                  <p className="text-xs font-mono text-[#080869]/80">{expediente.id}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#080869]/60 italic">
                Aún no tienes un expediente. Inicia una conversación con Pipo para crearlo.
              </p>
            )}
          </div>
        </section>

        {/* === SECCIÓN: Tamaño de letra === */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Type className="w-4 h-4 text-[#080869]" strokeWidth={2.5} />
            <h3 className="font-display font-black text-[#080869] text-sm uppercase tracking-wider">
              Tamaño de letra
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'normal', label: 'Normal', preview: 'Aa', size: 'text-base' },
              { id: 'grande', label: 'Grande', preview: 'Aa', size: 'text-lg' },
              { id: 'extra-grande', label: 'XG', preview: 'Aa', size: 'text-2xl' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setFontSize(opt.id)}
                className={`flex flex-col items-center justify-center py-3 rounded-2xl border-[3px] transition-all ${
                  fontSize === opt.id
                    ? 'bg-[#E6A231]/20 border-[#E6A231] shadow-[2px_2px_0px_#080869]'
                    : 'bg-white border-[#080869]/20 hover:border-[#080869]/40'
                }`}
              >
                <span className={`font-display font-black text-[#080869] ${opt.size}`}>
                  {opt.preview}
                </span>
                <span className="text-[10px] font-bold text-[#080869]/70 mt-1 uppercase tracking-wider">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* === SECCIÓN: Daltonismo === */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-[#080869]" strokeWidth={2.5} />
            <h3 className="font-display font-black text-[#080869] text-sm uppercase tracking-wider">
              Modo daltónico
            </h3>
          </div>
          <p className="text-[11px] text-[#080869]/60 mb-2 leading-snug">
            Ajusta los colores para distinguir mejor los elementos de la app.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'ninguno', label: 'Ninguno', desc: 'Colores originales' },
              { id: 'protanopia', label: 'Protanopía', desc: 'Rojo-verde (R)' },
              { id: 'deuteranopia', label: 'Deuteranopía', desc: 'Rojo-verde (V)' },
              { id: 'tritanopia', label: 'Tritanopía', desc: 'Azul-amarillo' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setColorBlindMode(opt.id)}
                className={`flex flex-col items-start text-left p-3 rounded-2xl border-[3px] transition-all ${
                  colorBlindMode === opt.id
                    ? 'bg-[#E6A231]/20 border-[#E6A231] shadow-[2px_2px_0px_#080869]'
                    : 'bg-white border-[#080869]/20 hover:border-[#080869]/40'
                }`}
              >
                <span className="font-display font-bold text-[#080869] text-sm">
                  {opt.label}
                </span>
                <span className="text-[10px] text-[#080869]/60 mt-0.5">
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* === SECCIÓN: Alto contraste === */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#080869]" strokeWidth={2.5} />
            <h3 className="font-display font-black text-[#080869] text-sm uppercase tracking-wider">
              Alto contraste
            </h3>
          </div>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border-[3px] transition-all ${
              highContrast
                ? 'bg-[#E6A231]/20 border-[#E6A231] shadow-[2px_2px_0px_#080869]'
                : 'bg-white border-[#080869]/20'
            }`}
          >
            <div className="text-left">
              <p className="font-display font-bold text-[#080869] text-sm">
                Refuerza bordes y contornos
              </p>
              <p className="text-[10px] text-[#080869]/60 mt-0.5">
                Útil para visión reducida
              </p>
            </div>
            <div className={`relative w-11 h-6 rounded-full transition-colors ${
              highContrast ? 'bg-[#080869]' : 'bg-[#080869]/20'
            }`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                highContrast ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </div>
          </button>
        </section>

        {/* === SECCIÓN: Acerca de === */}
        <section className="pt-2 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-[#080869]" strokeWidth={2.5} fill="#080869" />
            <h3 className="font-display font-black text-[#080869] text-sm uppercase tracking-wider">
              Acerca de Pipo
            </h3>
          </div>
          <div className="bg-white border-[3px] border-[#080869] rounded-2xl p-4 shadow-[3px_3px_0px_rgba(8,8,105,0.15)] text-center">
            <p className="font-display font-black text-[#080869] text-2xl italic mb-1">
              Pipo
            </p>
            <p className="text-[11px] text-[#080869]/70 leading-relaxed mb-3">
              Tu asistente de salud del Gobierno de Puebla
            </p>
            <div className="border-t-2 border-dashed border-[#080869]/15 pt-3">
              <p className="text-[10px] uppercase tracking-widest text-[#080869]/60 font-bold mb-1">
                Creado por
              </p>
              <p className="font-display font-bold text-[#080869] text-sm">
                Lulú · Valentina · Elías · Rosh
              </p>
            </div>
            <p className="text-[10px] text-[#080869]/50 mt-3">
              Hecho en México 🇲🇽 · v2.0.0
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
