// Extiende `expect` con los matchers de DOM/accesibilidad (toBeInTheDocument, toHaveTextContent...).
import '@testing-library/jest-dom'

// Headless UI consulta `Element.prototype.getAnimations` para saber cuando termino la transicion de
// un Dialog. jsdom no implementa la Web Animations API, asi que Headless UI la polirellena y avisa por
// stderr en cada prueba que abre un modal. Declararla aqui -vacia, que es la verdad en jsdom: no hay
// animaciones en curso- deja la salida de la suite limpia.
if (typeof Element !== 'undefined' && !Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => []
}
