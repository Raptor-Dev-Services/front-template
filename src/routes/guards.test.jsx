import { describe, it, expect, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

import { RequireAuth, RequirePermission } from './guards.jsx'
import { setTokens, clearSession } from '../auth/session.js'
import { fakeJwt, expIn } from '../testUtils/fakeJwt.js'

// Las guardas leen la sesion real (tokens en storage): se prueban contra el modulo de verdad con un JWT
// de prueba, no con mocks, para que el NOMBRE del claim (`permission`) quede fijado aqui.

function LoginProbe() {
  const location = useLocation()
  return <p>login desde {location.state?.from?.pathname ?? 'ninguna'}</p>
}

function renderAt(path, element) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/secreto" element={element} />
        <Route path="/" element={<p>inicio</p>} />
        <Route path="/login" element={<LoginProbe />} />
      </Routes>
    </MemoryRouter>,
  )
}

function givenSession(permission = []) {
  setTokens({ accessToken: fakeJwt({ sub: '1', permission, exp: expIn(30) }) })
}

afterEach(() => {
  clearSession()
})

describe('RequireAuth', () => {
  it('sin sesion redirige a /login conservando el origen', () => {
    renderAt('/secreto', <RequireAuth><p>contenido</p></RequireAuth>)
    expect(screen.getByText('login desde /secreto')).toBeInTheDocument()
    expect(screen.queryByText('contenido')).not.toBeInTheDocument()
  })

  it('con sesion pinta la ruta', () => {
    givenSession()
    renderAt('/secreto', <RequireAuth><p>contenido</p></RequireAuth>)
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })
})

describe('RequirePermission', () => {
  const guarded = (
    <RequirePermission permission="users.read">
      <p>usuarios</p>
    </RequirePermission>
  )

  it('sin sesion manda a /login (no al inicio) conservando el origen', () => {
    renderAt('/secreto', guarded)
    expect(screen.getByText('login desde /secreto')).toBeInTheDocument()
  })

  it('con sesion pero sin el permiso manda al inicio', () => {
    givenSession(['otra.cosa'])
    renderAt('/secreto', guarded)
    expect(screen.getByText('inicio')).toBeInTheDocument()
    expect(screen.queryByText('usuarios')).not.toBeInTheDocument()
  })

  it('con el permiso pinta la ruta', () => {
    givenSession(['users.read'])
    renderAt('/secreto', guarded)
    expect(screen.getByText('usuarios')).toBeInTheDocument()
  })

  it('un permiso parecido no abre la ruta ajena', () => {
    givenSession(['users.readonly', 'users'])
    renderAt('/secreto', guarded)
    expect(screen.getByText('inicio')).toBeInTheDocument()
  })
})
