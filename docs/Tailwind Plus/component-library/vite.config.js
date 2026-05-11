import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Force all shared packages to resolve from this project's node_modules
    // (needed because components live outside the project root)
    dedupe: ['react', 'react-dom', '@headlessui/react', '@heroicons/react'],
  },
  server: {
    fs: {
      // Allow serving files from parent directory (Tailwind Plus/)
      allow: [path.resolve(__dirname, '..')]
    }
  }
})
