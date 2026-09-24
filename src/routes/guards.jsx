import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated, hasPermission } from '../auth/session.js'

// Guardas de ruta. Leen los claims del JWT para decidir que se MONTA; la autorizacion real la impone
// el backend en cada request. Esto es UX y navegacion, no seguridad.

/** Exige sesion; si no, redirige a /login conservando el origen (`state.from`) para volver despues. */
export function RequireAuth({ children }) {
  const location = useLocation()
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

/**
 * Exige un permiso concreto. Sin sesion -> /login (con `from`); sin el permiso -> `fallback` (el inicio).
 * Sin sesion no se pregunta por el permiso: sin claims la respuesta seria un falso "no autorizado".
 */
export function RequirePermission({ permission, fallback = '/', children }) {
  const location = useLocation()
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (!hasPermission(permission)) {
    return <Navigate to={fallback} replace />
  }
  return children
}

export default RequireAuth
