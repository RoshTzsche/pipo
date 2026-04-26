import React from 'react'
import {
  MessageSquare,
  FileText,
  MapPin,
  LayoutDashboard,
  Settings
} from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'

const NAV_ITEMS = [
  { id: 'chat',       label: 'Chat',       icon: MessageSquare },
  { id: 'expediente', label: 'Exp.',       icon: FileText },
  { id: 'clinicas',   label: 'Clínicas',   icon: MapPin },
  { id: 'dashboard',  label: 'Historial',  icon: LayoutDashboard },
  { id: 'ajustes',    label: 'Ajustes',    icon: Settings }
]

export function BottomNav() {
  const { currentView, setCurrentView } = useAppContext()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#080869] border-t-4 border-[#E6A231] z-50">
      <div className="flex justify-around items-center">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = currentView === id
          return (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={`flex flex-col items-center justify-center py-2 px-2 flex-1 transition-colors ${
                active ? 'text-[#E6A231]' : 'text-white/60'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className={`text-[10px] mt-1 uppercase tracking-wider ${active ? 'font-black' : 'font-semibold'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
