# front-template

Plantilla base para aplicaciones React internas. Incluye design system, componentes compartidos, patrones CRUD completos y un módulo de ejemplo funcional conectado al back-template.

---

## Stack

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | React | 19.2.0 |
| Router | React Router DOM | 7.13.0 |
| Build | Vite + `@vitejs/plugin-react-swc` | 7.2.4 |
| Estilos | Tailwind CSS + `@tailwindcss/vite` | 4.1.18 |
| HTTP | Axios | 1.13.4 |
| Real-time | Microsoft SignalR | 10.0.0 |
| Iconos | Heroicons/React | 2.2.0 |
| UI headless | HeadlessUI/React | 2.2.9 |
| Drag & Drop | dnd-kit | core 6.3.1 |
| Excel | xlsx + xlsx-populate | 0.18.5 |
| CSS-in-JS | styled-components | 6.4.0 |

---

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env.local
# Editar VITE_DEV_API_PROXY_TARGET con la URL del backend

# 3. Arrancar
npm run dev
```

Con Docker:

```bash
docker compose -f compose-dev.yaml up
```

El back-template debe estar corriendo en `http://localhost:5080`.

---

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor Vite dev con proxy |
| `npm run dev2` | Dev con `--host` (acceso en red local) |
| `npm run build` | Build de producción |
| `npm run build:prod` | Build `--mode production` |
| `npm run build:staging` | Build `--mode staging` (lee `.env.staging`) |
| `npm run lint` | ESLint |
| `npm run preview` | Previsualizar build estático |

---

## Estructura del proyecto

```
src/
  api/              → Clientes Axios + servicios HTTP por dominio
  auth/             → Gestión de sesión y JWT (session.js)
  components/       → Componentes por dominio
    layout/         → Componentes globales reutilizables (navbar, modales, notificaciones)
      Shared/       → StatusBadge, ActionMenu
    primitives/     → Átomos: Modal, FormField, Pagination
    example/        → Módulo de ejemplo (users)
  config/           → Variables de entorno (env.js)
  hooks/            → useMediaQuery.js
  pages/            → Un archivo por ruta
  routes/           → AppRoutes.jsx + wideRoutes.js
  styles/           → designSystem.js (tokens Tailwind)
  utils/            → dateTime.js, csv.js, index.js
  App.jsx
  main.jsx
  index.css
```

---

## Documentación

| Doc | Contenido |
|---|---|
| [docs/Architecture.md](docs/Architecture.md) | Capas, flujo de datos, anatomía de módulo |
| [docs/Components.md](docs/Components.md) | API completa de componentes compartidos |
| [docs/DesignSystem.md](docs/DesignSystem.md) | Todos los tokens `ui.*`, colores, tipografía |
| [docs/Patterns.md](docs/Patterns.md) | Patrones de código con ejemplos completos |
| [docs/Packages.md](docs/Packages.md) | Todos los paquetes npm con uso y API |
| [docs/Environment.md](docs/Environment.md) | Variables de entorno, Docker, despliegue |
| [docs/Rules.md](docs/Rules.md) | Reglas explícitas del proyecto |

---

## Módulo de ejemplo

`/app/example/users` — CRUD completo de usuarios conectado al back-template.

Demuestra el patrón completo: `api service → hook → page → Desktop/Mobile`.
