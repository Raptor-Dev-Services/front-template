import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Puerto del servidor de desarrollo. 5173-5178 los ocupan otros productos de esta maquina
// (devstack/PUERTOS.md del catalogo): por eso 5179, y `strictPort` para que Vite FALLE si esta
// ocupado en vez de saltar en silencio a otro puerto que ningun .env ni CORS conoce.
const DEV_PORT = 5179
// La API del back-template en desarrollo.
const DEFAULT_API_TARGET = 'http://localhost:5060'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@api': path.resolve(import.meta.dirname, './src/api'),
        '@auth': path.resolve(import.meta.dirname, './src/auth'),
        '@config': path.resolve(import.meta.dirname, './src/config'),
        '@features': path.resolve(import.meta.dirname, './src/features'),
        '@i18n': path.resolve(import.meta.dirname, './src/i18n'),
        '@layouts': path.resolve(import.meta.dirname, './src/layouts'),
        '@pages': path.resolve(import.meta.dirname, './src/pages'),
        '@routes': path.resolve(import.meta.dirname, './src/routes'),
        '@styles': path.resolve(import.meta.dirname, './src/styles'),
        '@ui': path.resolve(import.meta.dirname, './src/ui'),
        '@utils': path.resolve(import.meta.dirname, './src/utils'),
      },
    },

    server: {
      port: DEV_PORT,
      strictPort: true,
      // En desarrollo el navegador habla con el MISMO origen (5179) y Vite reenvia /api a la API:
      // sin CORS que configurar. Por eso VITE_API_BASE_URL va vacio en .env.dev.
      proxy: {
        '/api': {
          target: env.VITE_DEV_API_PROXY_TARGET || DEFAULT_API_TARGET,
          changeOrigin: true,
        },
      },
    },

    preview: {
      port: 4179,
      strictPort: true,
    },
  }
})
