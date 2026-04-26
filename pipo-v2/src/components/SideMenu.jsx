import React from 'react'
import { Menu, X, MessageSquare, MapPin, Calendar, Heart } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'

const MENU_ITEMS = [
  { id: 'chat',     label: 'Chat con Pipo',  icon: MessageSquare },
  { id: 'cita',     label: 'Mi cita',        icon: Calendar, requiereCita: true },
  { id: 'clinicas', label: 'Red de clínicas', icon: MapPin }
]

export function MenuButton() {
  const { menuOpen, setMenuOpen } = useAppContext()
  return (
    <button
      onClick={() => setMenuOpen(!menuOpen)}
      aria-label="Abrir menú"
      className="fixed top-4 right-4 z-40 w-12 h-12 rounded-full bg-white border-[3px] border-[#080869] shadow-[3px_3px_0px_#080869] flex items-center justify-center hover:translate-y-0.5 hover:shadow-none transition-all"
    >
      {menuOpen
        ? <X className="w-5 h-5 text-[#080869]" strokeWidth={3} />
        : <Menu className="w-5 h-5 text-[#080869]" strokeWidth={3} />}
    </button>
  )
}

export function SideMenu() {
  const {
    menuOpen, setMenuOpen,
    currentView, setCurrentView,
    cita, expediente
  } = useAppContext()

  const go = (id) => {
    if (id === 'cita') {
      // Ir a la vista correcta según haya cita o no
      setCurrentView(cita ? 'cita' : 'sin-cita')
    } else {
      setCurrentView(id)
    }
    setMenuOpen(false)
  }

  return (
    <>
      {/* Backdrop */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 bg-[#080869]/40 backdrop-blur-sm z-40 animate-fadeIn"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-[280px] bg-[#ECF9FF] border-l-[6px] border-[#E6A231] z-50 shadow-2xl transform transition-transform duration-300 ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header del drawer */}
        <div className="bg-[#080869] text-white px-6 py-6 border-b-[6px] border-[#E6A231]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-[#E6A231] flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#080869]" fill="#080869" />
            </div>
            <h2 className="font-display font-black text-3xl tracking-wide">Pipo</h2>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-[#E6A231] font-bold">
            Asistente de salud · Puebla
          </p>
        </div>

        {/* Items */}
        <nav className="py-4">
          {MENU_ITEMS.map(({ id, label, icon: Icon, requiereCita }) => {
            const isCurrent = (id === 'cita') ? (currentView === 'cita' || currentView === 'sin-cita') : currentView === id
            return (
              <button
                key={id}
                onClick={() => go(id)}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-all text-left border-l-4 ${
                  isCurrent
                    ? 'bg-[#E6A231]/20 border-[#E6A231] text-[#080869] font-black'
                    : 'border-transparent text-[#080869]/80 hover:bg-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isCurrent ? 'text-[#E6A231]' : ''}`} strokeWidth={2.5} />
                <span className="font-display text-lg">{label}</span>
              </button>
            )
          })}
        </nav>

        {/* Estado actual del expediente si existe */}
        {expediente && (
          <div className="mx-4 mt-4 bg-white border-[3px] border-[#080869] rounded-2xl p-4 shadow-[3px_3px_0px_rgba(8,8,105,0.15)]">
            <p className="text-[10px] uppercase tracking-widest text-[#080869]/60 font-bold mb-1">
              Último triaje
            </p>
            <p className="font-display font-bold text-[#080869] text-base">
              {expediente.paciente?.nombre || 'Paciente'}
            </p>
            <p className="text-xs text-[#080869]/70 mt-1 line-clamp-2">
              {expediente.clinico?.sintoma}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t-2 border-[#080869]/15 text-center bg-[#ECF9FF]">
          <p className="text-[10px] uppercase tracking-widest text-[#080869]/60 font-bold">
            Hecho en México 🇲🇽
          </p>
          <p className="text-[10px] text-[#080869]/50 mt-1">v2.0.0 · Gobierno de Puebla</p>
        </div>
      </aside>
    </>
  )
}
