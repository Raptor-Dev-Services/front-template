import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import { LoginPage } from './LoginPage.jsx'
import { I18nProvider } from '../../i18n/I18nProvider.jsx'
import { login, completeTwoFactorLogin } from '../../api/auth.js'
import { clearSession } from '../../auth/session.js'

vi.mock('../../api/auth.js', () => ({ login: vi.fn(), completeTwoFactorLogin: vi.fn() }))

function renderLogin({ from } = {}) {
  render(
    <I18nProvider>
      <MemoryRouter initialEntries={[{ pathname: '/login', state: from ? { from: { pathname: from } } : undefined }]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<p>inicio</p>} />
          <Route path="/users" element={<p>usuarios</p>} />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  )
}

beforeEach(() => vi.clearAllMocks())
afterEach(() => clearSession())

describe('LoginPage', () => {
  it('cada etiqueta esta atada a su campo (se encuentran por su nombre accesible)', () => {
    // Regresion: en la v1 las <label> no tenian htmlFor, asi que el lector anunciaba "campo de texto"
    // sin decir cual, y hacer clic en la etiqueta no enfocaba nada.
    renderLogin()
    expect(screen.getByLabelText(/correo electronico/i)).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText(/^contrasena/i)).toHaveAttribute('type', 'password')
    expect(screen.getByLabelText(/mantener la sesion/i)).toHaveAttribute('type', 'checkbox')
  })

  it('valida en el cliente antes de llamar al backend', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: 'Iniciar sesion' }))

    expect(login).not.toHaveBeenCalled()
    expect(screen.getByText('Escribe tu correo.')).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electronico/i)).toHaveAttribute('aria-invalid', 'true')
  })

  it('en el exito vuelve a la ruta protegida de la que vino', async () => {
    const user = userEvent.setup()
    login.mockResolvedValue({ twoFactorRequired: false })
    renderLogin({ from: '/users' })

    await user.type(screen.getByLabelText(/correo electronico/i), 'ana@empresa.com')
    await user.type(screen.getByLabelText(/^contrasena/i), 'secreta')
    await user.click(screen.getByLabelText(/mantener la sesion/i))
    await user.click(screen.getByRole('button', { name: 'Iniciar sesion' }))

    expect(login).toHaveBeenCalledWith({ email: 'ana@empresa.com', password: 'secreta', rememberMe: true })
    expect(await screen.findByText('usuarios')).toBeInTheDocument()
  })

  it('si el backend rechaza, muestra SU mensaje en un role=alert y se queda en el login', async () => {
    const user = userEvent.setup()
    login.mockRejectedValue({ isAxiosError: true, response: { status: 401, data: { isSuccess: false, message: 'Credenciales invalidas' } } })
    renderLogin()

    await user.type(screen.getByLabelText(/correo electronico/i), 'ana@empresa.com')
    await user.type(screen.getByLabelText(/^contrasena/i), 'mala')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesion' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales invalidas')
    expect(screen.queryByText('inicio')).not.toBeInTheDocument()
  })

  it('con segundo factor pide el codigo, lo canjea con el reto y conserva el recordarme', async () => {
    const user = userEvent.setup()
    login.mockResolvedValue({ twoFactorRequired: true, challengeToken: 'reto-1' })
    completeTwoFactorLogin.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' })
    renderLogin({ from: '/users' })

    await user.type(screen.getByLabelText(/correo electronico/i), 'ana@empresa.com')
    await user.type(screen.getByLabelText(/^contrasena/i), 'secreta')
    await user.click(screen.getByLabelText(/mantener la sesion/i))
    await user.click(screen.getByRole('button', { name: 'Iniciar sesion' }))

    // Segundo paso: el foco ya esta en el codigo, y todavia no se navego a ningun lado.
    const code = await screen.findByLabelText(/^codigo/i)
    expect(code).toHaveFocus()
    expect(screen.queryByText('usuarios')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Verificar' }))
    expect(completeTwoFactorLogin).not.toHaveBeenCalled()
    expect(screen.getByText('Escribe el codigo.')).toBeInTheDocument()

    await user.type(code, ' 123456 ')
    await user.click(screen.getByRole('button', { name: 'Verificar' }))

    expect(completeTwoFactorLogin).toHaveBeenCalledWith({ challengeToken: 'reto-1', code: '123456', rememberMe: true })
    expect(await screen.findByText('usuarios')).toBeInTheDocument()
  })

  it('un codigo rechazado muestra el mensaje del backend; volver a empezar regresa al primer paso sin la contrasena', async () => {
    const user = userEvent.setup()
    login.mockResolvedValue({ twoFactorRequired: true, challengeToken: 'reto-1' })
    completeTwoFactorLogin.mockRejectedValue({
      isAxiosError: true,
      response: { status: 401, data: { isSuccess: false, message: 'El codigo no es valido o el reto expiro.' } },
    })
    renderLogin()

    await user.type(screen.getByLabelText(/correo electronico/i), 'ana@empresa.com')
    await user.type(screen.getByLabelText(/^contrasena/i), 'secreta')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesion' }))
    await user.type(await screen.findByLabelText(/^codigo/i), '000000')
    await user.click(screen.getByRole('button', { name: 'Verificar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('El codigo no es valido o el reto expiro.')

    await user.click(screen.getByRole('button', { name: 'Volver a empezar' }))
    expect(screen.getByLabelText(/correo electronico/i)).toHaveValue('ana@empresa.com')
    expect(screen.getByLabelText(/^contrasena/i)).toHaveValue('')
  })
})
