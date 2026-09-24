# Entorno, desarrollo y despliegue

## Variables

Todas se leen en `src/config/env.js` (unico lector de `import.meta.env`). **Toda `VITE_*` es publica**:
Vite la hornea en el bundle y cualquiera la lee en las DevTools. Nunca va ahi un secreto.

| Variable | Default | Que es |
|---|---|---|
| `VITE_APP_TITLE` | `front-template` | Titulo de la pestana (`%VITE_APP_TITLE%` en index.html) |
| `VITE_API_BASE_URL` | `''` | ORIGEN de la API, **sin** `/api` (los servicios ya piden `/api/...`). Vacio = mismo origen |
| `VITE_DEFAULT_LOCALE` | `es` | Idioma de arranque (`es` o `en`); la eleccion guardada del usuario manda |
| `VITE_SOFTWARE_VERSION` | `dev-local` | Version que muestra el menu |
| `VITE_AUTH_ORIGIN` | (vacio) | Opcional: origen de un proveedor de identidad externo; solo lo usa la CSP |
| `VITE_DEV_API_PROXY_TARGET` | `http://localhost:5060` | Solo el servidor de desarrollo: a donde reenvia `/api` |

`env.readVar` trata la cadena vacia como ausente: `VITE_X=` en un `.env` cae al default.

## Archivos

| Archivo | Versionado | Lo usa |
|---|---|---|
| `.env.example` | si | referencia comentada de todas las variables |
| `.env.dev` | si (solo valores publicos) | `npm run dev` (`vite --mode dev`) y `compose-dev.yaml` |
| `.env.staging` | si (solo valores publicos) | `npm run build:staging` |
| cualquier otro `.env*` | **no** (`.gitignore`) | overrides locales, p. ej. `.env.dev.local` |

## Desarrollo local

```bash
npm install
npm run dev          # http://localhost:5179 (strictPort: falla si el puerto esta ocupado)
```

- **Puerto 5179**: 5173-5178 son de otros productos de la maquina (`devstack/PUERTOS.md` del catalogo).
- El navegador habla con el mismo origen y Vite reenvia `/api` a `VITE_DEV_API_PROXY_TARGET`: sin CORS.
- La API del back-template escucha en `http://localhost:5060`. Para apuntar a otra, crea `.env.dev.local`
  con `VITE_DEV_API_PROXY_TARGET=...`.

## Desarrollo con Docker

```bash
docker compose -f compose-dev.yaml up
```

Monta el codigo, deja `node_modules` en un volumen (los binarios del host no sirven en Alpine) y reenvia
`/api` a `http://host.docker.internal:5060`.

## Build

```bash
npm run build            # modo production -> dist/
npm run build:staging    # modo staging (.env.staging)
npm run preview          # sirve dist/ en http://localhost:4179
```

El build inyecta una Content-Security-Policy como `<meta>` (`vite/csp.js`), derivada de
`VITE_API_BASE_URL` y `VITE_AUTH_ORIGIN`, con el hash del script del tema. Un origen invalido rompe el
build en vez de emitir una politica que bloquee la API en silencio.

## Imagen Docker

```bash
docker build -t front-template \
  --build-arg BUILD_MODE=production \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  --build-arg VITE_SOFTWARE_VERSION=1.0.0 .
docker run -p 8080:80 front-template
```

- Los `VITE_*` llegan como **build ARGs**: cambiarlos exige reconstruir la imagen. `.env.*` no entra al
  contexto (`.dockerignore`), salvo `.env.example`.
- `VITE_API_BASE_URL` es el origen **como lo ve el navegador**, no el nombre del servicio de Compose.
- nginx sirve el bundle (sin proxy a la API): fallback de SPA, `/assets` inmutable por un ano,
  `index.html` sin cache, gzip, cabeceras de seguridad (`nginx/security-headers.conf`, incluido en cada
  location) con `frame-ancestors` y una nota para activar HSTS detras de TLS.
- `HEALTHCHECK` con `wget` a `127.0.0.1` (no `localhost`: resolveria a IPv6 y nginx escucha en IPv4).

## CI

`.github/workflows/ci.yml`: `npm ci`, lint, build y test bloqueantes; `npm audit` en modo aviso; gitleaks
fijado (8.30.1) sobre el historial completo, bloqueante.
`.github/workflows/dependencias-estables.yml`: `scripts/check-prerelease-deps.py` falla si entra un
paquete prerelease o una version flotante no declarada en `PRERELEASE-PERMITIDOS.txt`. Localmente en
Windows: `python scripts/check-prerelease-deps.py` (`python3` suele ser el alias vacio de la Store).
