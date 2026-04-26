import React from 'react'

export function TalaveraPattern({ className = '' }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 w-full h-full opacity-[0.03] ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="talavera-pattern"
          x="0"
          y="0"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          {/* Rombo */}
          <polygon
            points="40,8 72,40 40,72 8,40"
            fill="none"
            stroke="#080869"
            strokeWidth="1.5"
          />
          {/* Flor de 4 pétalos en el centro */}
          <g transform="translate(40,40)">
            <ellipse cx="0" cy="-12" rx="5" ry="10" fill="none" stroke="#080869" strokeWidth="1.2" />
            <ellipse cx="0" cy="12" rx="5" ry="10" fill="none" stroke="#080869" strokeWidth="1.2" />
            <ellipse cx="-12" cy="0" rx="10" ry="5" fill="none" stroke="#080869" strokeWidth="1.2" />
            <ellipse cx="12" cy="0" rx="10" ry="5" fill="none" stroke="#080869" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="3" fill="none" stroke="#080869" strokeWidth="1.2" />
          </g>
          {/* Esquinas decorativas */}
          <circle cx="0" cy="0" r="2" fill="none" stroke="#080869" strokeWidth="1" />
          <circle cx="80" cy="0" r="2" fill="none" stroke="#080869" strokeWidth="1" />
          <circle cx="0" cy="80" r="2" fill="none" stroke="#080869" strokeWidth="1" />
          <circle cx="80" cy="80" r="2" fill="none" stroke="#080869" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#talavera-pattern)" />
    </svg>
  )
}

export default TalaveraPattern
