// Extiende `expect` con los matchers de DOM/accesibilidad (toBeInTheDocument, toHaveTextContent...).
import '@testing-library/jest-dom'

// Headless UI consulta `Element.prototype.getAnimations` para saber cuando termino la transicion de
// un Dialog. jsdom no implementa la Web Animations API, asi que Headless UI la polirellena y avisa por
// stderr en cada prueba que abre un modal. Declararla aqui -vacia, que es la verdad en jsdom: no hay
// animaciones en curso- deja la salida de la suite limpia.
if (typeof Element !== 'undefined' && !Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => []
}

// Cada idioma que no es el por defecto es un chunk que se carga bajo demanda: en la app lo hace
// main.jsx antes de montar. La suite prueba los dos idiomas, asi que aqui se cargan TODOS por
// adelantado; sin esto, una prueba en ingles veria el idioma por defecto y fallaria con un mensaje
// que parece de traduccion pero es de carga.
import { SUPPORTED_LOCALES, loadLocaleMessages } from './src/i18n/messages.js'

await Promise.all(SUPPORTED_LOCALES.map((locale) => loadLocaleMessages(locale)))
