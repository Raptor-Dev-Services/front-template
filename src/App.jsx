import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './ui/ErrorBoundary.jsx'
import { ThemeProvider } from './ui/theme/ThemeProvider.jsx'
import { I18nProvider } from './i18n/I18nProvider.jsx'
import { AppRoutes } from './routes/AppRoutes.jsx'

// App - composition root: ErrorBoundary > ThemeProvider > I18nProvider > BrowserRouter > rutas.
//
// El ErrorBoundary EXTERIOR envuelve tambien a los providers (regla error-screens): si I18nProvider o
// ThemeProvider fallaran al renderizar, un limite adentro de ellos no atraparia nada y el arbol se
// desmontaria entero, dejando pantalla en blanco. Cada layout trae ademas su limite INTERIOR alrededor
// de su <Outlet />, para que una vista rota no se lleve el menu.
export function App() {
  return (
    <ErrorBoundary onError={(error, info) => console.error('Error no capturado en el arbol de React', error, info)}>
      <ThemeProvider>
        <I18nProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
