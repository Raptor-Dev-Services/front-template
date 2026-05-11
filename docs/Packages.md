# Paquetes npm

---

## Dependencias de producción

### React — `react` + `react-dom` v19.2.0

Framework principal. Functional components con hooks exclusivamente.

```jsx
import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
```

Hooks usados en el proyecto:
- `useState` — estado local
- `useEffect` — side effects, carga de datos, conexiones SignalR
- `useMemo` — filas filtradas, filas paginadas, totalPages
- `useCallback` — `loadData` para estabilizar referencia en useEffect
- `useRef` — refs a funciones del hook para evitar closures stale en SignalR
- `lazy` + `Suspense` — carga diferida de páginas en el router

---

### React Router DOM — `react-router-dom` v7.13.0

Enrutamiento SPA con `BrowserRouter`.

```jsx
import { BrowserRouter }        from 'react-router-dom'   // main.jsx
import { Routes, Route, Navigate, Link, useLocation, useSearchParams } from 'react-router-dom'
```

Uso en el proyecto:
- `BrowserRouter` en `main.jsx` — provider raíz
- `Routes` + `Route` — definición de rutas en `AppRoutes.jsx`
- `Navigate` — redirecciones
- `Link` — navegación declarativa
- `useLocation` — detección de ruta activa en `AppNavbar`
- `useSearchParams` — persistencia de filtros en URL (Patrón 4)

---

### Vite — `vite` v7.2.4 + `@vitejs/plugin-react-swc` v4.2.2

Build tool y servidor de desarrollo.

```js
// vite.config.js — configuración completa
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
```

Características usadas:
- **Proxy** — `/api/*` redirigido al backend en desarrollo
- **Aliases** — `@styles`, `@api`, `@utils`, `@components`, `@pages`, `@routes`
- **Modos** — `development`, `production`, `staging` con `.env.[mode]`
- **`import.meta.glob`** — carga dinámica de componentes (component library)
- **`%VITE_APP_TITLE%`** en `index.html` — sustitución en build

Compilador: `@vitejs/plugin-react-swc` usa SWC (Rust) en lugar de Babel — builds más rápidos.

---

### Tailwind CSS — `tailwindcss` v4.1.18 + `@tailwindcss/vite`

Framework de utilidades CSS. Versión 4 integrada como plugin de Vite.

```css
/* src/index.css */
@import "tailwindcss";
```

No hay `tailwind.config.js` en v4 — la configuración va en CSS con `@theme`. Las clases se detectan automáticamente del código fuente.

Uso: siempre a través de los tokens `ui.*` de `designSystem.js`. Nunca hardcodear clases repetitivas directamente.

---

### Axios — `axios` v1.13.4

Cliente HTTP. Un solo cliente con interceptores en `src/api/clients.js`.

```js
import { apiClient, resolveApiEnvelope, extractApiErrorMessage } from '../api/clients'

// GET
const res = await apiClient.get('/api/domain/entities')
const data = resolveApiEnvelope(res.data)

// POST
const res = await apiClient.post('/api/domain/entities', body)
resolveApiEnvelope(res.data)

// PUT
await apiClient.put(`/api/domain/entities/${id}`, body)

// DELETE
await apiClient.delete(`/api/domain/entities/${id}`)
```

Interceptores configurados:
- **Request**: adjunta `Authorization: Bearer <token>` desde `session.js`
- **Response error**: normaliza cualquier error a `new Error(mensaje_legible)`, preserva `.response` y `.status`

---

### Microsoft SignalR — `@microsoft/signalr` v10.0.0

WebSockets para datos en tiempo real. Nunca hacer polling — usar SignalR.

```js
import * as signalR from '@microsoft/signalr'

const connection = new signalR.HubConnectionBuilder()
  .withUrl('/my-hub')
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Warning)
  .build()

connection.on('EventName', (payload) => { /* handler */ })
await connection.start()

// Cleanup:
await connection.stop()
```

Ver Patrón 5 en `docs/Patterns.md` para el patrón completo con refs y cleanup.

---

### Heroicons — `@heroicons/react` v2.2.0

Íconos SVG. Dos variantes: `outline` (24px) y `solid` (20px, más compactos).

```jsx
import { CheckCircleIcon, XMarkIcon }   from '@heroicons/react/24/outline'
import { EllipsisVerticalIcon }         from '@heroicons/react/20/solid'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
```

Convención del proyecto:
- `24/outline` — íconos de estado, notificaciones, acciones principales
- `20/solid` — íconos en botones compactos, menús, paginación

Tamaño estándar: `className="size-5"` (outline) o `className="size-4"` (solid).

---

### HeadlessUI — `@headlessui/react` v2.2.9

Componentes accesibles sin estilos. Usado para Modal, Dropdown, ActionMenu.

```jsx
// Dialog (Modal)
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'

// Menu (ActionMenu / Dropdown)
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
```

Componentes usados en el proyecto:
- `Dialog` — `Modal.jsx` (primitivo base)
- `Menu` — `MasterTableShared.jsx` (`ActionMenu`)

HeadlessUI v2 usa `data-closed` / `data-open` attributes en lugar de render props para transiciones.

---

### dnd-kit — `@dnd-kit/core` v6.3.1 + `@dnd-kit/sortable` v10.0.0

Drag & drop. Disponible en el proyecto pero no implementado en el módulo de ejemplo.

```jsx
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
```

Usar cuando el usuario necesite reordenar filas o elementos con drag & drop.

---

### xlsx + xlsx-populate

Exportación y lectura de archivos Excel.

```js
import * as XLSX from 'xlsx'

// Exportar array a Excel
const ws = XLSX.utils.aoa_to_sheet([['Nombre', 'Email'], ['Juan', 'j@e.com']])
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'Hoja1')
XLSX.writeFile(wb, 'reporte.xlsx')
```

Para CSV usar la utilidad del proyecto: `exportToCsv` de `src/utils/csv.js`.

---

### styled-components — `styled-components` v6.4.0

CSS-in-JS. Disponible pero no usado en el core del template — preferir Tailwind. Usar solo para componentes que necesiten estilos dinámicos que Tailwind no puede manejar fácilmente.

---

## Dependencias de desarrollo

### ESLint — `eslint` v9.0.0

Linting. Ejecutar con `npm run lint`.

---

## Utilidades propias del proyecto

### `src/utils/dateTime.js`

```js
import { formatDate } from '../utils/dateTime'

formatDate('2025-01-15T10:30:00Z')  // → '15/01/2025 10:30'
formatDate(null)                     // → '—'
formatDate('invalid')               // → 'invalid' (fallback)
```

Formato: `DD/MM/YYYY HH:mm` en zona local del navegador.

---

### `src/utils/csv.js`

```js
import { exportToCsv } from '../utils/csv'

exportToCsv(
  'reporte-usuarios',          // nombre del archivo (se agrega .csv automáticamente)
  ['Nombre', 'Email', 'Dept'], // headers
  [
    ['Juan Pérez', 'j@e.com', 'IT'],
    ['Ana López', 'a@e.com', 'HR'],
  ]
)
// → descarga reporte-usuarios.csv con BOM UTF-8
```

- Escapa comas, comillas y saltos de línea automáticamente
- Agrega BOM UTF-8 para compatibilidad con Excel

---

### `src/hooks/useMediaQuery.js`

```js
import useMediaQuery from '../hooks/useMediaQuery'

const isDesktop = useMediaQuery('(min-width: 640px)')   // sm breakpoint
const isLg      = useMediaQuery('(min-width: 1024px)')  // lg breakpoint
```

Retorna `boolean`. Se actualiza automáticamente al cambiar el tamaño de la ventana.

---

### `src/auth/session.js`

```js
import {
  setSession, getToken, getProfile,
  clearSession, isTokenValid,
  getUserGroups, isUserInGroup,
} from '../auth/session'

setSession(jwtString, profileObject)  // login
getToken()                            // → 'eyJ...' | ''
getProfile()                          // → { name, employee, ... }
isTokenValid()                        // → boolean (verifica exp)
isUserInGroup('ADMIN')                // → boolean
getUserGroups()                       // → string[]
clearSession()                        // → logout
```

Obtener el usuario para audit trail:
```js
const updatedByUser = getProfile()?.name ?? getProfile()?.employee ?? 'unknown'
```

---

### `src/config/env.js`

```js
import { APP_TITLE, API_BASE_URL } from '../config/env'
```

| Constante | Variable VITE | Default |
|---|---|---|
| `APP_TITLE` | `VITE_APP_TITLE` | `'front-template'` |
| `API_BASE_URL` | `VITE_API_BASE_URL` | `'/api'` |
