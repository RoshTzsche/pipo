import React from 'react'
import { useAppContext } from './context/AppContext.jsx'
import { MenuButton, SideMenu } from './components/SideMenu.jsx'
import QRModal from './components/QRModal.jsx'
import SplashView from './views/SplashView.jsx'
import ChatView from './views/ChatView.jsx'
import CitaAgendadaView from './views/CitaAgendadaView.jsx'
import SinCitaView from './views/SinCitaView.jsx'
import ClinicasView from './views/ClinicasView.jsx'

export default function App() {
  const { currentView } = useAppContext()

  const renderView = () => {
    switch (currentView) {
      case 'splash':   return <SplashView />
      case 'chat':     return <ChatView />
      case 'cita':     return <CitaAgendadaView />
      case 'sin-cita': return <SinCitaView />
      case 'clinicas': return <ClinicasView />
      default:         return <ChatView />
    }
  }

  // El splash NO muestra el botón de menú (solo en las demás vistas)
  const showMenu = currentView !== 'splash'

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#ECF9FF]">
      {/* Contenedor de vistas con ancho fijo tipo móvil en desktop */}
      <div className="relative h-full w-full max-w-md mx-auto bg-[#ECF9FF] shadow-2xl md:border-x-2 md:border-[#080869]/10">
        <div className="relative h-full w-full overflow-y-auto overflow-x-hidden">
          {renderView()}
        </div>
      </div>

      {/* Overlays globales */}
      {showMenu && <MenuButton />}
      <SideMenu />
      <QRModal />
    </div>
  )
}
