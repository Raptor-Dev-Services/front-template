import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.jsx'
import { loadLocaleMessages } from './i18n/messages.js'
import { readStoredLocale } from './i18n/locale.js'
import { installPreloadErrorHandler } from './utils/chunkRecovery.js'

// Antes de montar:
//
// 1. El manejador de `vite:preloadError`: un chunk que desaparecio con un despliegue recarga la pagina
//    UNA vez en vez de dejarla "cargando" (utils/chunkRecovery.js, regla client-version-skew).
//
// 2. El diccionario del idioma activo. Es una frontera asincrona deliberada: `translateMessage` es
//    sincrona y la consumen modulos que no son componentes (src/api/client.js), asi que no puede esperar
//    a una carga; montar antes pintaria claves crudas en el primer render. El idioma por defecto viaja
//    estatico, asi que esto solo espera de verdad cuando el usuario eligio otro, y si esa descarga
//    falla se monta igual en el idioma por defecto: mucho mejor que no arrancar.
//
// Va dentro de una funcion y no como `await` de nivel superior porque eso exige un target de build mas
// alto del que usa el proyecto.
async function start() {
  installPreloadErrorHandler()

  try {
    await loadLocaleMessages(readStoredLocale())
  } catch {
    // Sin el diccionario elegido se sigue con el por defecto.
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void start()
