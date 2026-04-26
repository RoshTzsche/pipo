import React, { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [currentView, setCurrentView] = useState('splash')
  const [menuOpen, setMenuOpen]       = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)

  const [expediente, setExpediente] = useState(null)
  const [cita, setCita] = useState(null)
  const [historialExpedientes, setHistorialExpedientes] = useState([])

  const addExpediente = useCallback((nuevo) => {
    const expedienteConId = {
      ...nuevo,
      id: `PUE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      fecha: new Date().toISOString()
    }
    setHistorialExpedientes(prev => [expedienteConId, ...prev])
    setExpediente(expedienteConId)
    return expedienteConId
  }, [])

  // Simula búsqueda de cita: si hay clínica con saturación <75% para esa categoría
  const intentarAgendarCita = useCallback((expedienteData) => {
    const categoria = expedienteData?.clinico?.categoria || 'LEVE'

    // Probabilidad de éxito según severidad
    const pSuccess = categoria === 'URGENTE' ? 0.95
                   : categoria === 'MODERADO' ? 0.85
                   : 0.7

    if (Math.random() < pSuccess) {
      // Generar fecha y hora plausible
      const hoy = new Date()
      const diasOffset = categoria === 'URGENTE' ? 0
                       : categoria === 'MODERADO' ? Math.floor(Math.random() * 2) + 1
                       : Math.floor(Math.random() * 5) + 2
      const citaDate = new Date(hoy)
      citaDate.setDate(hoy.getDate() + diasOffset)

      const horas = ['09:00', '10:30', '11:15', '12:45', '14:00', '15:30', '16:45']
      
      // AQUÍ OCURRE LA MAGIA: Extraemos la clínica que la IA nos sugirió
      const clinicaRecomendada = expedienteData?.clinica_asignada || 'Clínica General'

      setCita({
        fecha: citaDate.toISOString(),
        hora: horas[Math.floor(Math.random() * horas.length)],
        clinica: clinicaRecomendada, // ¡Se inyecta directo aquí!
        especialidad: categoria === 'URGENTE' ? 'Urgencias' : 'Medicina General'
      })
      return true
    }
    setCita(null)
    return false
  }, [])

  const value = {
    currentView, setCurrentView,
    menuOpen, setMenuOpen,
    qrModalOpen, setQrModalOpen,
    expediente, setExpediente,
    cita, setCita,
    historialExpedientes,
    addExpediente,
    intentarAgendarCita
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext debe usarse dentro de AppProvider')
  return ctx
}