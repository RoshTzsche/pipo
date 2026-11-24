import React from 'react'

/**
 * Filtros SVG para simular/compensar daltonismo.
 * Las matrices están calibradas para ayudar a personas con cada tipo de daltonismo
 * a distinguir mejor los colores. Se aplican mediante la propiedad CSS `filter: url(#id)`.
 *
 * Este componente se renderiza una vez en el árbol y los filtros quedan disponibles
 * globalmente vía sus IDs.
 */
export default function ColorBlindFilters() {
  return (
    <svg
      aria-hidden="true"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        {/* Protanopía: deficiencia rojo-verde (rojo débil) */}
        <filter id="cb-protanopia-filter">
          <feColorMatrix
            type="matrix"
            values="0.567 0.433 0     0 0
                    0.558 0.442 0     0 0
                    0     0.242 0.758 0 0
                    0     0     0     1 0"
          />
        </filter>

        {/* Deuteranopía: deficiencia rojo-verde (verde débil) */}
        <filter id="cb-deuteranopia-filter">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0    0 0
                    0.7   0.3   0    0 0
                    0     0.3   0.7  0 0
                    0     0     0    1 0"
          />
        </filter>

        {/* Tritanopía: deficiencia azul-amarillo */}
        <filter id="cb-tritanopia-filter">
          <feColorMatrix
            type="matrix"
            values="0.95  0.05  0     0 0
                    0     0.433 0.567 0 0
                    0     0.475 0.525 0 0
                    0     0     0     1 0"
          />
        </filter>
      </defs>
    </svg>
  )
}
