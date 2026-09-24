import { createContext } from 'react'

// Contexto de i18n. Separado del provider para no mezclar export de componente y de contexto en el
// mismo archivo (react-refresh).
export const I18nContext = createContext(null)
