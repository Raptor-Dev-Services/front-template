# Entorno y despliegue

---

## Variables de entorno

Vite expone solo variables con prefijo `VITE_` al código del navegador. Las variables sin prefijo (como `DEV_PORT`) son solo para herramientas externas (Docker Compose, scripts de build).

### Variables del proyecto

| Variable | Dónde se usa | Descripción |
|---|---|---|
| `VITE_APP_TITLE` | `index.html` (`%VITE_APP_TITLE%`) + `src/config/env.js` | Título de la app en la pestaña del navegador |
| `VITE_API_BASE_URL` | `src/config/env.js` → `apiClient.baseURL` | URL base del API (baked en build) |
| `VITE_DEV_API_PROXY_TARGET` | `vite.config.js` proxy | URL a la que el proxy de dev reenvía `/api/*` |

### Sistema de modos de Vite

| Comando | Modo | Archivo leído |
|---|---|---|
| `npm run dev` | `development` | `.env` + `.env.development` |
| `npm run build` | `production` | `.env` + `.env.production` |
| `npm run build:staging` | `staging` | `.env` + `.env.staging` |
| `npm run build:prod` | `production` | `.env` + `.env.production` |

Vite carga los archivos en este orden de prioridad (mayor prioridad primero):
```
.env.[mode].local   (ignorado por git)
.env.[mode]
.env.local          (ignorado por git)
.env
```

---

## Archivos de entorno

### `.env.example`
Plantilla de referencia. Documenta todas las variables disponibles. Siempre mantener actualizado. **Commitear.**

### `.env.dev`
Configuración para desarrollo. Usa el proxy de Vite — `VITE_API_BASE_URL` queda vacío y las peticiones pasan por `/api` → proxy. **Commitear** (no contiene secretos).

### `.env.staging`
Configuración para staging. `VITE_API_BASE_URL` apunta a la URL real de staging. **Commitear** (usar URLs genéricas, sin tokens).

### `.env` / `.env.local` / `.env.*.local`
Sobreescrituras locales y secretos. **Nunca commitear.** El `.gitignore` los excluye.

---

## Desarrollo local (sin Docker)

```bash
# 1. Instalar
npm install

# 2. Crear override local
cp .env.dev .env.local

# 3. Editar .env.local — apuntar proxy al backend local
VITE_DEV_API_PROXY_TARGET=http://localhost:5080

# 4. Arrancar
npm run dev
# → http://localhost:5173
```

Para acceso desde otros dispositivos en la misma red:

```bash
npm run dev2   # equivale a: vite --host
# → http://0.0.0.0:5173  (accesible por IP local)
```

---

## Desarrollo con Docker

`compose-dev.yaml` monta el código fuente y corre el servidor Vite dentro de un contenedor `node:20-alpine`. Hot-reload funciona vía polling de sistema de archivos.

```bash
# Arrancar
docker compose -f compose-dev.yaml up

# Arrancar en background
docker compose -f compose-dev.yaml up -d

# Ver logs
docker compose -f compose-dev.yaml logs -f app

# Detener
docker compose -f compose-dev.yaml down
```

Acceso: `http://localhost:5173`

### Proxy desde Docker al backend en el host

El backend (back-template) corre en el host en el puerto 5080. Desde dentro del contenedor se accede como `host.docker.internal:5080`.

- **Mac/Windows (Docker Desktop)**: `host.docker.internal` resuelve automáticamente.
- **Linux**: el `compose-dev.yaml` ya incluye `extra_hosts: - "host.docker.internal:host-gateway"`.

El `.env.dev` ya está configurado con:
```
VITE_DEV_API_PROXY_TARGET=http://host.docker.internal:5080
```

### node_modules en Docker

El `compose-dev.yaml` usa un volumen nombrado para `node_modules`:
```yaml
volumes:
  - .:/app
  - node_modules:/app/node_modules   # ← mantiene los módulos dentro del contenedor
```

Esto evita conflictos de binarios nativos entre la plataforma del host (Windows) y el contenedor (Linux). Si cambias dependencias en `package.json`:

```bash
# Reconstruir el contenedor para reinstalar deps
docker compose -f compose-dev.yaml down -v   # -v elimina el volumen de node_modules
docker compose -f compose-dev.yaml up --build
```

---

## Build de producción

El `Dockerfile` usa multi-stage build: `node:20-alpine` para compilar y `nginx:stable-alpine` para servir.

### Build estándar (producción)

```bash
docker build \
  --build-arg VITE_APP_TITLE="Mi App" \
  --build-arg VITE_API_BASE_URL="https://api.example.com" \
  -t front-template:latest .
```

### Build staging

```bash
docker build \
  --build-arg BUILD_MODE=staging \
  --build-arg VITE_APP_TITLE="Mi App [STAGING]" \
  --build-arg VITE_API_BASE_URL="https://api.staging.example.com" \
  -t front-template:staging .
```

### Correr el contenedor buildeado

```bash
docker run -p 8080:80 front-template:latest
# → http://localhost:8080
```

---

## Variables en el build Docker

Las variables `VITE_*` se **bajan en el código JavaScript en tiempo de build** (no son variables de entorno en runtime). Esto significa:

- El valor de `VITE_API_BASE_URL` queda literal dentro del bundle JS
- Cambiar la URL del API en producción requiere un nuevo build
- No se pueden cambiar inyectando env vars al contenedor nginx en runtime

Para arquitecturas que necesiten configuración en runtime, la solución común es inyectar un `window.__ENV__` desde nginx con un template:

```nginx
# nginx.conf — approach runtime config (no implementado en el template)
location /config.js {
    return 200 'window.__ENV__ = { API_URL: "$API_URL" };';
    add_header Content-Type application/javascript;
}
```

---

## nginx.conf

Configuración del servidor nginx en el contenedor de producción:

- **SPA fallback**: todas las rutas sirven `index.html` (`try_files $uri $uri/ /index.html`)
- **Cache de assets**: archivos con fingerprint (JS/CSS buildeados por Vite) se cachean 1 año con `Cache-Control: public, immutable`
- **Gzip**: compresión para JS, CSS, JSON, SVG y text
- **Security headers**: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`
- **Puerto**: 80

---

## Estructura de archivos de configuración

```
front-template/
  .env.example          → plantilla, commitear
  .env.dev              → config desarrollo, commitear
  .env.staging          → config staging, commitear
  .env                  → secretos locales, NO commitear (en .gitignore)
  .env.local            → override local, NO commitear
  Dockerfile            → build multi-stage (node → nginx)
  nginx.conf            → config nginx para la imagen runner
  compose-dev.yaml      → orquestación desarrollo Docker
  .dockerignore         → excluye node_modules, dist, docs, etc.
  .gitignore            → excluye .env, .env.*.local, dist, node_modules
```
