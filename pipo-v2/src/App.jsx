import React from 'react'
import { useAppContext } from './context/AppContext.jsx'
import { MenuButton, SideMenu } from './components/SideMenu.jsx'
import QRModal from './components/QRModal.jsx'
import ColorBlindFilters from './components/ColorBlindFilters.jsx'
import SplashView from './views/SplashView.jsx'
import ChatView from './views/ChatView.jsx'
import CitaAgendadaView from './views/CitaAgendadaView.jsx'
import SinCitaView from './views/SinCitaView.jsx'
import ClinicasView from './views/ClinicasView.jsx'

export default function App() {
  const { currentView, colorBlindMode, highContrast } = useAppContext()

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

  // Clases de filtro de daltonismo. IMPORTANTE: se aplican SOLO al contenedor de vistas,
  // nunca al root, porque `filter: url(#)` crea un stacking context y atrapa
  // a los elementos `position: fixed` (sidebar, modal QR), volviéndolos invisibles
  // o desplazándolos fuera del viewport.
  const cbClass =
    colorBlindMode === 'protanopia'   ? 'cb-protanopia' :
    colorBlindMode === 'deuteranopia' ? 'cb-deuteranopia' :
    colorBlindMode === 'tritanopia'   ? 'cb-tritanopia' : ''
  const hcClass = highContrast ? 'high-contrast' : ''

  return (
    <div className="app-root relative min-h-screen w-screen bg-[#ECF9FF]">
      {/* Definiciones SVG de filtros para daltonismo (no visibles) */}
      <ColorBlindFilters />

      {/* Contenedor de vistas - responsivo:
          - Móvil: ocupa todo el ancho
          - Tablet: ancho cómodo
          - Desktop: ocupa al menos el 80% del viewport */}
      <div className={`relative min-h-screen w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-[80vw] xl:max-w-[80vw] mx-auto bg-[#ECF9FF] shadow-2xl md:border-x-2 md:border-[#080869]/10 ${cbClass} ${hcClass}`}>
        <div className="relative min-h-screen w-full overflow-x-hidden">
          {renderView()}
        </div>

        {/* Overlays globales — FUERA del contenedor con filtro para que se vean correctamente.
            El SideMenu y QRModal son `position: fixed` y deben renderizar en el viewport
            real, no dentro de un elemento con `filter` que crea su propio stacking context. */}
      </div>

      {/* Estos overlays viven en el root, por encima de cualquier filtro */}
      {showMenu && <MenuButton />}
      <SideMenu />
      <QRModal />
    </div>
  )
}
