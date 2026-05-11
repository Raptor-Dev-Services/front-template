# ---- Stage 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first (layer cache)
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Copy source
COPY . .

# Build-time env vars (VITE_* are inlined at build time — not runtime)
ARG BUILD_MODE=production
ARG VITE_APP_TITLE=front-template
ARG VITE_API_BASE_URL

ENV VITE_APP_TITLE=$VITE_APP_TITLE
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build -- --mode $BUILD_MODE

# ---- Stage 2: Serve ----
FROM nginx:stable-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
