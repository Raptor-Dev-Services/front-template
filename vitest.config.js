import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

// Reutiliza los plugins de Vite (react, tailwind) para que las pruebas de componentes hereden el
// mismo transform; no duplica la config de build. vite.config.js exporta una funcion (lee el modo),
// asi que se resuelve con el modo `test` antes de fusionar.
export default defineConfig((env) =>
  mergeConfig(
    viteConfig({ ...env, mode: 'test' }),
    defineConfig({
      test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.js'],
        // Los componentes importan CSS solo por Tailwind; procesarlo no aporta nada a la suite.
        css: false,
        // Declarar `exclude` reemplaza los defaults de Vitest, por eso se repiten.
        // - .claude/**: worktrees de otras sesiones; sin excluirlos la suite corre por duplicado.
        // - docs/Tailwind Plus/**: libreria de referencia con sus propios package.json y ejemplos.
        exclude: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/.claude/**', 'docs/Tailwind Plus/**'],
      },
    }),
  ),
)
