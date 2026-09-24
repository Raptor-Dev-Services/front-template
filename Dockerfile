# syntax=docker/dockerfile:1

# Imagen del frontend: compila el bundle de Vite y lo sirve con nginx. Contexto: la raiz del repo.
#
# LAS VARIABLES VITE_* SON DE TIEMPO DE BUILD, NO DE EJECUCION. Vite las hornea en el JavaScript, asi
# que cambiar una obliga a RECONSTRUIR la imagen: reiniciar el contenedor con otro entorno no cambia
# nada. Por eso llegan como ARG y no como ENV. Y son publicas: aqui nunca va un secreto.
#
#   docker build -t front-template \
#     --build-arg BUILD_MODE=staging \
#     --build-arg VITE_API_BASE_URL=https://api.staging.example.com \
#     --build-arg VITE_SOFTWARE_VERSION=1.4.0 .
#
# VITE_API_BASE_URL es el ORIGEN de la API tal como lo ve el NAVEGADOR (el puerto publicado o el
# dominio publico), no el nombre del servicio de Compose: el navegador esta fuera de la red de Docker.

FROM node:22-alpine AS build
WORKDIR /app

# Manifiestos primero: mientras package-lock.json no cambie, Docker reusa la capa de `npm ci`.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Modo de Vite (production | staging): elige import.meta.env.MODE y los .env.<modo> que existan. En la
# imagen no hay .env.* (.dockerignore), asi que los VALORES salen de los ARG de abajo.
ARG BUILD_MODE=production
# Titulo de la pestana.
ARG VITE_APP_TITLE=front-template
# Origen de la API, sin /api. Vacio = mismo origen que el front (un proxy delante sirve los dos).
ARG VITE_API_BASE_URL=
# Idioma de arranque: es | en.
ARG VITE_DEFAULT_LOCALE=es
# Version que muestra la UI. El pipeline pasa el tag.
ARG VITE_SOFTWARE_VERSION=dev-container
# Opcional: origen de un proveedor de identidad externo; lo habilita la CSP (vite/csp.js).
ARG VITE_AUTH_ORIGIN=
RUN npm run build -- --mode "$BUILD_MODE"

FROM nginx:1-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# 127.0.0.1 y NO localhost: dentro del contenedor `localhost` resuelve primero a ::1 (IPv6) y este nginx
# solo escucha en IPv4 (`listen 80;`), asi que la sonda daria "Connection refused" y marcaria como
# enfermo un contenedor que sirve perfectamente.
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 \
    CMD wget --quiet --spider http://127.0.0.1/ || exit 1
