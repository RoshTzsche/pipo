import React from 'react'
import { useAppContext } from './context/AppContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import BottomNav from './components/BottomNav.jsx'
import ChatView from './views/ChatView.jsx'
import ExpedienteView from './views/ExpedienteView.jsx'
import ClinicasView from './views/ClinicasView.jsx'
import DashboardView from './views/DashboardView.jsx'
import AjustesView from './views/AjustesView.jsx'

export default function App() {
  const { currentView } = useAppContext()

  const renderView = () => {
    switch (currentView) {
      case 'chat':       return <ChatView />
      case 'expediente': return <ExpedienteView />
      case 'clinicas':   return <ClinicasView />
      case 'dashboard':  return <DashboardView />
      case 'ajustes':    return <AjustesView />
      default:           return <ChatView />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#ECF9FF]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        {renderView()}
      </main>
      <BottomNav />
    </div>
  )
}
