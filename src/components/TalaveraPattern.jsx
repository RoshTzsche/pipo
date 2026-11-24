import React from 'react'

/**
 * Patrón Talavera: rombo con flor de 4 pétalos.
 * Por defecto sutil (opacity ~0.05). Se usa en fondos.
 */
export function TalaveraPattern({ className = '', opacity = 0.05, color = '#080869' }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="talavera-bg" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
          <polygon points="45,10 80,45 45,80 10,45" fill="none" stroke={color} strokeWidth="1.4" />
          <g transform="translate(45,45)">
            <ellipse cx="0" cy="-14" rx="5" ry="11" fill={color} opacity="0.25" />
            <ellipse cx="0" cy="14"  rx="5" ry="11" fill={color} opacity="0.25" />
            <ellipse cx="-14" cy="0" rx="11" ry="5" fill={color} opacity="0.25" />
            <ellipse cx="14"  cy="0" rx="11" ry="5" fill={color} opacity="0.25" />
            <circle cx="0" cy="0" r="3.5" fill={color} />
          </g>
          <circle cx="0"  cy="0"  r="2" fill={color} />
          <circle cx="90" cy="0"  r="2" fill={color} />
          <circle cx="0"  cy="90" r="2" fill={color} />
          <circle cx="90" cy="90" r="2" fill={color} />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#talavera-bg)" />
    </svg>
  )
}

/**
 * Esquina decorativa Talavera grande (para top corners de pantallas).
 * position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
 */
export function TalaveraCorner({ position = 'top-left', size = 180 }) {
  const transforms = {
    'top-left': '',
    'top-right': 'scale(-1, 1)',
    'bottom-left': 'scale(1, -1)',
    'bottom-right': 'scale(-1, -1)'
  }
  const positionStyles = {
    'top-left':     { top: 0, left: 0 },
    'top-right':    { top: 0, right: 0 },
    'bottom-left':  { bottom: 0, left: 0 },
    'bottom-right': { bottom: 0, right: 0 }
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className="absolute pointer-events-none"
      style={positionStyles[position]}
      aria-hidden="true"
    >
      <g transform={transforms[position]} style={{ transformOrigin: '100px 100px' }}>
        {/* Pétalos en arco */}
        <g fill="#080869">
          <path d="M 30 110 Q 25 75 50 60 Q 60 80 50 110 Z" />
          <path d="M 60 75 Q 55 40 85 30 Q 90 55 75 80 Z" />
          <path d="M 100 50 Q 105 20 130 25 Q 125 50 110 70 Z" />
          <path d="M 140 60 Q 155 35 175 50 Q 165 70 145 80 Z" />
          {/* Pequeñas hojitas */}
          <ellipse cx="40" cy="135" rx="6" ry="3" />
          <ellipse cx="55" cy="155" rx="5" ry="2.5" />
          <ellipse cx="170" cy="35" rx="3" ry="6" />
          <ellipse cx="155" cy="20" rx="2.5" ry="5" />
        </g>
        {/* Centro - flor */}
        <g transform="translate(85,90)" fill="#080869">
          <ellipse cx="0" cy="-15" rx="6" ry="13" />
          <ellipse cx="0" cy="15"  rx="6" ry="13" />
          <ellipse cx="-15" cy="0" rx="13" ry="6" />
          <ellipse cx="15"  cy="0" rx="13" ry="6" />
          <circle cx="0" cy="0" r="5" fill="#E6A231" stroke="#080869" strokeWidth="1.5" />
        </g>
        {/* Puntos decorativos */}
        <circle cx="170" cy="100" r="3" fill="#080869" />
        <circle cx="100" cy="170" r="3" fill="#080869" />
        <circle cx="160" cy="155" r="2" fill="#080869" />
      </g>
    </svg>
  )
}

/**
 * Marco circular Talavera grande para el splash (corona de pétalos).
 */
export function TalaveraWreath({ size = 320, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* 16 grupos de pétalos en círculo */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 360) / 16
        return (
          <g key={i} transform={`rotate(${angle} 200 200)`}>
            {/* Pétalo grande */}
            <ellipse cx="200" cy="40" rx="18" ry="38" fill="#080869" />
            {/* Pétalo medio */}
            <ellipse cx="200" cy="80" rx="9" ry="20" fill="#080869" />
            {/* Punto exterior */}
            <circle cx="200" cy="20" r="4" fill="#080869" />
          </g>
        )
      })}
      {/* Hojas adicionales pequeñas entre pétalos */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 360) / 16 + 11.25
        return (
          <g key={`leaf-${i}`} transform={`rotate(${angle} 200 200)`}>
            <ellipse cx="200" cy="55" rx="6" ry="14" fill="#080869" opacity="0.7" />
          </g>
        )
      })}
    </svg>
  )
}

export default TalaveraPattern
