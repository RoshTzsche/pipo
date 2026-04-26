import React from 'react'

// Importamos las imágenes desde la carpeta de assets
import pipoHappy from '../assets/pipo-happy.png'
import pipoWave from '../assets/pipo-wave.png'
import pipoThermo from '../assets/pipo-thermo.png'
import pipoFlying from '../assets/pipo-flying.png'

/**
 * Pipo: mascota tipo pingüinito poblano (Versión PNG).
 * Variantes:
 * - 'wave'    saludo (manita arriba)
 * - 'happy'   sonriente con bufanda
 * - 'thermo'  con termómetro (estado: enfermito)
 * - 'flying'  con alas extendidas (cita agendada)
 */
export function PipoMascot({ variant = 'happy', className = '' }) {
  // Función para devolver la imagen correcta según la variante solicitada
  const getPipoImage = () => {
    switch (variant) {
      case 'wave':
        return pipoWave
      case 'thermo':
        return pipoThermo
      case 'flying':
        return pipoFlying
      case 'happy':
      default:
        return pipoHappy
    }
  }

  return (
    <img
      src={getPipoImage()}
      alt={`Pipo mascota - ${variant}`}
      // object-contain asegura que la imagen no se deforme dentro del contenedor
      className={`object-contain ${className}`}
    />
  )
}

export default PipoMascot