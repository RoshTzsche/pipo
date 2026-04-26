import React from 'react'
import {
  MessageSquare,
  FileText,
  MapPin,
  LayoutDashboard,
  Settings,
  Heart
} from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'

const NAV_ITEMS = [
  { id: 'chat',       label: 'Chat',       icon: MessageSquare },
  { id: 'expediente', label: 'Expediente', icon: FileText },
  { id: 'clinicas',   label: 'Clínicas',   icon: MapPin },
  { id: 'dashboard',  label: 'Historial',  icon: LayoutDashboard },
  { id: 'ajustes',    label: 'Ajustes',    icon: Settings }
]

export function Sidebar() {
  const { currentView, setCurrentView } = useAppContext()

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#080869] border-r-[6px] border-[#E6A231] text-white shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b-2 border-white/10 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#E6A231] flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,0.3)]">
          <Heart className="w-7 h-7 text-[#080869]" fill="#080869" />
        </div>
        <div>
          <h1 className="font-black uppercase tracking-widest text-2xl leading-none">Pipo</h1>
          <p className="text-[10px] text-[#E6A231] font-bold uppercase tracking-widest mt-1">
            IMSS Puebla
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = currentView === id
          return (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-all text-left ${
                active
                  ? 'bg-[#E6A231]/20 border-l-4 border-[#E6A231] text-white font-black'
                  : 'text-white/70 hover:bg-white/10 border-l-4 border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-[#E6A231]' : ''}`} />
              <span className="uppercase tracking-wider text-sm">{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t-2 border-white/10 text-center">
        <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">
          Hecho en México 🇲🇽
        </p>
        <p className="text-[10px] text-[#E6A231] font-bold mt-1">v1.0.0</p>
      </div>
    </aside>
  )
}

export default Sidebar
