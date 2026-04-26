import React, { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [currentView, setCurrentView] = useState('chat')
  const [expediente, setExpediente] = useState(null)
  const [historialExpedientes, setHistorialExpedientes] = useState([])

  const [profiles, setProfiles] = useState([
    { id: 1, name: 'María González', isMain: true, chronicCondition: 'Diabetes tipo 2' },
    { id: 2, name: 'Juan Pérez', isMain: false, chronicCondition: 'Ninguna' }
  ])
  const [activeProfileId, setActiveProfileId] = useState(1)

  const addExpediente = useCallback((nuevo) => {
    const expedienteConId = {
      ...nuevo,
      id: `PUE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      fecha: new Date().toISOString()
    }
    setHistorialExpedientes(prev => [expedienteConId, ...prev])
    setExpediente(expedienteConId)
  }, [])

  const value = {
    currentView,
    setCurrentView,
    expediente,
    setExpediente,
    historialExpedientes,
    addExpediente,
    profiles,
    activeProfileId,
    setActiveProfileId
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext debe usarse dentro de AppProvider')
  return ctx
}
