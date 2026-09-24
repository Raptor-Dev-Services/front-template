import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

import { UsersPage } from './UsersPage.jsx'
import { parsePage } from './hooks/useUsers.js'
import { initials } from './utils/initials.js'
import { I18nProvider } from '../../i18n/I18nProvider.jsx'
import { listUsers, updateUser, disableUser } from '../../api/users.js'
import { setTokens, clearSession } from '../../auth/session.js'
import { fakeJwt, expIn } from '../../testUtils/fakeJwt.js'

vi.mock('../../api/users.js', () => ({ listUsers: vi.fn(), updateUser: vi.fn(), disableUser: vi.fn() }))

const ANA = { publicId: 'u-1', fullName: 'Ana Perez', isActive: true, createdAtUtc: '2026-01-10T15:00:00Z', updatedAtUtc: null }
const YO = { publicId: 'u-me', fullName: 'Yo Mismo', isActive: true, createdAtUtc: null, updatedAtUtc: null }

function LocationProbe() {
  const location = useLocation()
  return <p data-testid="location">{`${location.pathname}${location.search}`}</p>
}

function renderPage(path = '/users') {
  render(
    <I18nProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/users" element={<><UsersPage /><LocationProbe /></>} />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  )
}

function givenSession(permission) {
  setTokens({ accessToken: fakeJwt({ sub: 'u-me', permission, exp: expIn(30) }) })
}

beforeEach(() => {
  vi.clearAllMocks()
  givenSession(['users.read', 'users.manage'])
})
afterEach(() => clearSession())

describe('parsePage', () => {
  it.each([
    [null, 1],
    ['', 1],
    ['3', 3],
    ['0', 1],
    ['-2', 1],
    ['abc', 1],
  ])('%j -> %i (la URL es entrada de usuario)', (raw, expected) => {
    expect(parsePage(raw)).toBe(expected)
  })
})

describe('initials', () => {
  it('toma hasta dos palabras y cae a ? sin nombre', () => {
    expect(initials('ana maria lopez')).toBe('AM')
    expect(initials('')).toBe('?')
    expect(initials(null)).toBe('?')
  })
})

describe('UsersPage', () => {
  it('carga -> exito: pinta las filas con su estado en TEXTO, no solo color', async () => {
    listUsers.mockResolvedValue({ items: [ANA], total: 1 })
    renderPage()

    expect(screen.getAllByText('Cargando usuarios').length).toBeGreaterThan(0)
    const table = await screen.findByRole('table', { name: 'Usuarios del tenant' })
    expect(within(table).getByText('Ana Perez')).toBeInTheDocument()
    expect(within(table).getByText('Activo')).toBeInTheDocument()
    expect(listUsers).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 20 }))
  })

  it('vacio es un estado propio, no una tabla vacia', async () => {
    listUsers.mockResolvedValue({ items: [], total: 0 })
    renderPage()
    expect(await screen.findByText('Aun no hay usuarios')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('error: role=alert con el mensaje y un reintento que vuelve a pedir', async () => {
    const user = userEvent.setup()
    listUsers.mockRejectedValueOnce({ isAxiosError: true, code: 'ERR_NETWORK' }).mockResolvedValue({ items: [ANA], total: 1 })
    renderPage()

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('No pudimos conectar con el servidor')
    await user.click(within(alert).getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('table')).toBeInTheDocument()
    expect(listUsers).toHaveBeenCalledTimes(2)
  })

  it('la pagina vive en la URL: se lee de ?page y "siguiente" la escribe', async () => {
    const user = userEvent.setup()
    listUsers.mockResolvedValue({ items: [ANA], total: 45 })
    renderPage('/users?page=2')

    await screen.findByRole('table')
    expect(listUsers).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }))
    expect(screen.getByText('Pagina 2 de 3 - 45 usuarios')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/users?page=3'))
  })

  it('una pagina que ya no existe salta a la ultima que si', async () => {
    listUsers.mockImplementation(async ({ page }) => (page === 9 ? { items: [], total: 25 } : { items: [ANA], total: 25 }))
    renderPage('/users?page=9')
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/users?page=2'))
    expect(await screen.findByRole('table')).toBeInTheDocument()
  })

  it('dar de baja pide confirmacion; si el backend rechaza, su mensaje se queda en el dialogo', async () => {
    const user = userEvent.setup()
    listUsers.mockResolvedValue({ items: [ANA], total: 1 })
    disableUser.mockRejectedValue({ isAxiosError: true, response: { status: 409, data: { isSuccess: false, message: 'No se puede dar de baja al ultimo administrador' } } })
    renderPage()

    const table = await screen.findByRole('table')
    await user.click(within(table).getByRole('button', { name: 'Acciones para Ana Perez' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Dar de baja' }))

    const dialog = await screen.findByRole('dialog', { name: 'Dar de baja a Ana Perez' })
    expect(disableUser).not.toHaveBeenCalled()
    await user.click(within(dialog).getByRole('button', { name: 'Dar de baja' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('No se puede dar de baja al ultimo administrador')
    expect(disableUser).toHaveBeenCalledWith('u-1')
  })

  it('editar guarda el nombre, recarga la lista y avisa', async () => {
    const user = userEvent.setup()
    listUsers.mockResolvedValue({ items: [ANA], total: 1 })
    updateUser.mockResolvedValue(null)
    renderPage()

    const table = await screen.findByRole('table')
    await user.click(within(table).getByRole('button', { name: 'Acciones para Ana Perez' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Editar' }))
    const dialog = await screen.findByRole('dialog', { name: 'Editar usuario' })
    const field = within(dialog).getByLabelText(/nombre completo/i)
    await user.clear(field)
    await user.type(field, 'Ana Maria Perez')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }))

    expect(updateUser).toHaveBeenCalledWith('u-1', { fullName: 'Ana Maria Perez' })
    expect(await screen.findByRole('status')).toHaveTextContent('Se actualizo a Ana Maria Perez.')
    expect(listUsers).toHaveBeenCalledTimes(2)
  })

  it('sin users.manage no hay acciones de fila', async () => {
    clearSession()
    givenSession(['users.read'])
    listUsers.mockResolvedValue({ items: [ANA], total: 1 })
    renderPage()

    const table = await screen.findByRole('table')
    expect(within(table).queryByRole('button', { name: /acciones para/i })).not.toBeInTheDocument()
  })

  it('a la propia cuenta no se le ofrece darse de baja', async () => {
    const user = userEvent.setup()
    listUsers.mockResolvedValue({ items: [YO], total: 1 })
    renderPage()

    const table = await screen.findByRole('table')
    expect(within(table).getByText('Tu')).toBeInTheDocument()
    await user.click(within(table).getByRole('button', { name: 'Acciones para Yo Mismo' }))
    expect(await screen.findByRole('menuitem', { name: 'Editar' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Dar de baja' })).not.toBeInTheDocument()
  })
})
