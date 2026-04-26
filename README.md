# Pipo · PWA Médica IMSS Puebla

Asistente de triaje médico con expediente clínico + QR.

## Instalar y correr

```bash
npm install
npm run dev
```

Luego en otra terminal levanta el backend:

```bash
node index.js
```

El frontend corre en `http://localhost:5173` y consume `http://localhost:5001/api/chat`.

## Stack
- React 18 + Vite
- Tailwind CSS
- lucide-react
- qrcode.react
- leaflet + react-leaflet (mapa de clínicas)

## Vistas
- **Chat** (`/`) — Conversación con Pipo
- **Expediente** — Resultado del triaje + QR
- **Clínicas** — Mapa interactivo de clínicas IMSS recomendadas
- **Historial** — Lista de expedientes generados
- **Ajustes** — Perfil + preferencias
