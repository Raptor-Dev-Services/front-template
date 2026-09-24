import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  // - dist / coverage: artefactos generados.
  // - .claude: incluye worktrees aislados de otras sesiones (.claude/worktrees/<id>), cada uno con su
  //   propio dist/; sin excluirlo, `eslint .` lintea codigo compilado ajeno a este checkout.
  // - docs/Tailwind Plus: la libreria de referencia UI. Se CONSULTA, no se compila ni se lintea.
  { ignores: ['dist', 'coverage', 'node_modules', '.claude', 'docs/Tailwind Plus'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Reconoce identificadores usados solo en JSX (componentes dinamicos, iconos).
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'off',
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Las dos reglas del React Compiler que estrena eslint-plugin-react-hooks 7 quedan en AVISO
      // mientras viva el codigo heredado de la primera version de la plantilla, que las incumple. Se
      // suben a 'error' en cuanto ese codigo se reemplaza: codigo nuevo no nace con esta deuda.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
  {
    // Archivos que corren en Node (configs, plugins de Vite, setup de pruebas).
    files: ['*.config.js', 'vitest.setup.js', 'vite/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
]
