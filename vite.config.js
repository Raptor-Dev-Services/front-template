import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@styles':     path.resolve(__dirname, './src/styles'),
        '@api':        path.resolve(__dirname, './src/api'),
        '@utils':      path.resolve(__dirname, './src/utils'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages':      path.resolve(__dirname, './src/pages'),
        '@routes':     path.resolve(__dirname, './src/routes'),
      },
    },

    server: {
      proxy: {
        '/api': {
          target: env.VITE_DEV_API_PROXY_TARGET || 'http://localhost:5080',
          changeOrigin: true,
        },
      },
    },
  }
})
