# Pipo v2 · Asistente de Salud Puebla

Rediseño completo basado en mockups de Figma con estética Talavera poblana.

## Flujo de la app

```
[Splash]  ─click "Empezar"─►  [Chat con Pipo]
                                     │
                                     ▼ (al finalizar triaje)
                          ┌──────────┴──────────┐
                          │                     │
                  [Cita agendada]         [Sin disponibilidad]
                          │                     │
                          ▼                     │
                   [Modal QR overlay]           │
                          │                     │
                          └──────────┬──────────┘
                                     │
                                     ▼
                            [Red de Clínicas]
                          (accesible desde menú)
```

El botón ☰ flotante en la esquina superior derecha abre un drawer lateral
con acceso a: Chat, Mi cita, Red de clínicas.

## Vistas

| Vista | Archivo | Descripción |
|---|---|---|
| Splash | `SplashView.jsx` | Solo al abrir. Logo + corona Talavera + Pipo + botón Empezar |
| Chat | `ChatView.jsx` | Conversación con Pipo (esquinas Talavera, burbujas con borde) |
| Cita | `CitaAgendadaView.jsx` | Calendario con día marcado + botón "Detalles de tu cita" |
| Sin cita | `SinCitaView.jsx` | Mensaje + Pipo enfermito + botón notificaciones |
| QR Modal | `QRModal.jsx` | Overlay con QR + fecha + hora + clínica |
| Clínicas | `ClinicasView.jsx` | Mapa Leaflet + lista con saturación |

## Instalación

```bash
npm install
cp .env.example .env
# Edita .env y pon tu GROQ_API_KEY
```

## Correr

Dos terminales:

```bash
# Terminal 1 — backend
npm run server

# Terminal 2 — frontend
npm run dev
```

## Stack
- React 18 + Vite
- Tailwind CSS (con tipografía Fraunces para el estilo display italic)
- lucide-react (iconos)
- qrcode.react (QR)
- leaflet + react-leaflet (mapa)
- express + groq-sdk (backend)

## Notas de diseño
- **Pipo mascota**: SVG inline en `components/PipoMascot.jsx` con 4 variantes
  (`wave`, `happy`, `thermo`, `flying`). Reemplaza con tu asset real si quieres.
- **Talavera**: patrón decorativo + esquinas + corona en `components/TalaveraPattern.jsx`.
- **Tipografía display**: Fraunces (Google Fonts) en italic para los títulos
  estilo grabado mexicano.
- **Paleta**: azul profundo #080869, ámbar #E6A231, cielo #ECF9FF, guinda #8B1538.
