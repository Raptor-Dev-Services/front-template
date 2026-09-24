import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { AccountPage } from './AccountPage.jsx'
import { groupSecret } from './utils/groupSecret.js'
import { I18nProvider } from '../../i18n/I18nProvider.jsx'
import { getMyAccount, beginTwoFactorSetup, enableTwoFactor, disableTwoFactor } from '../../api/account.js'

vi.mock('../../api/account.js', () => ({
  getMyAccount: vi.fn(),
  beginTwoFactorSetup: vi.fn(),
  enableTwoFactor: vi.fn(),
  disableTwoFactor: vi.fn(),
}))

const ACCOUNT = { email: 'ana@acme.test', roles: ['Admin'], lastLoginAtUtc: null }

function renderPage() {
  render(
    <I18nProvider>
      <MemoryRouter>
        <AccountPage />
      </MemoryRouter>
    </I18nProvider>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('groupSecret', () => {
  it('agrupa de 4 en 4 e ignora espacios', () => {
    expect(groupSecret('JBSWY3DPEHPK3PXP')).toBe('JBSW Y3DP EHPK 3PXP')
    expect(groupSecret(' ABCDE ')).toBe('ABCD E')
    expect(groupSecret(undefined)).toBe('')
  })
})

describe('AccountPage', () => {
  it('si la cuenta no carga, muestra el error con reintento y reintentar la vuelve a pedir', async () => {
    const user = userEvent.setup()
    getMyAccount.mockRejectedValueOnce({ isAxiosError: true, response: { status: 500, data: { isSuccess: false, message: 'caido' } } })
    getMyAccount.mockResolvedValueOnce({ ...ACCOUNT, twoFactorEnabled: false })
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('caido')
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByText('ana@acme.test')).toBeInTheDocument()
  })

  it('activar: secreto pendiente, confirmar con codigo, y los codigos de recuperacion UNA vez', async () => {
    const user = userEvent.setup()
    getMyAccount.mockResolvedValueOnce({ ...ACCOUNT, twoFactorEnabled: false })
    getMyAccount.mockResolvedValueOnce({ ...ACCOUNT, twoFactorEnabled: true })
    beginTwoFactorSetup.mockResolvedValue({ secret: 'JBSWY3DPEHPK3PXP', otpauthUri: 'otpauth://totp/app:ana?secret=JBSWY3DPEHPK3PXP' })
    enableTwoFactor.mockResolvedValue(['AAAA-1111', 'BBBB-2222'])
    renderPage()

    expect(await screen.findByText('Inactiva')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Activar' }))

    expect(await screen.findByText('JBSW Y3DP EHPK 3PXP')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Abrir en la app autenticadora' })).toHaveAttribute('href', expect.stringMatching(/^otpauth:\/\//))

    await user.type(screen.getByLabelText(/^codigo/i), '123456')
    await user.click(screen.getByRole('button', { name: 'Confirmar y activar' }))

    expect(enableTwoFactor).toHaveBeenCalledWith('123456')
    const codes = await screen.findByRole('list', { name: 'Codigos de recuperacion' })
    expect(codes).toHaveTextContent('AAAA-1111')
    // Mientras los codigos estan en pantalla no se recarga la cuenta: recargar no los traeria de vuelta.
    expect(getMyAccount).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Ya los guarde' }))

    await waitFor(() => expect(getMyAccount).toHaveBeenCalledTimes(2))
    expect(await screen.findByText('Activa')).toBeInTheDocument()
    expect(screen.queryByText('AAAA-1111')).not.toBeInTheDocument()
  })

  it('un otpauthUri con otro esquema no se ofrece como enlace', async () => {
    const user = userEvent.setup()
    getMyAccount.mockResolvedValue({ ...ACCOUNT, twoFactorEnabled: false })
    beginTwoFactorSetup.mockResolvedValue({ secret: 'ABCD', otpauthUri: 'javascript:alert(1)' })
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Activar' }))

    expect(await screen.findByText('ABCD')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Abrir en la app autenticadora' })).not.toBeInTheDocument()
  })

  it('apagar exige un codigo y muestra el rechazo del backend tal cual', async () => {
    const user = userEvent.setup()
    getMyAccount.mockResolvedValue({ ...ACCOUNT, twoFactorEnabled: true })
    disableTwoFactor
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 400, data: { isSuccess: false, message: 'Codigo invalido.' } } })
      .mockResolvedValueOnce(null)
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Desactivar' }))
    expect(disableTwoFactor).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText(/^codigo/i), '000000')
    await user.click(screen.getByRole('button', { name: 'Desactivar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Codigo invalido.')

    await user.clear(screen.getByLabelText(/^codigo/i))
    await user.type(screen.getByLabelText(/^codigo/i), 'AAAA-1111')
    await user.click(screen.getByRole('button', { name: 'Desactivar' }))

    expect(disableTwoFactor).toHaveBeenLastCalledWith('AAAA-1111')
    await waitFor(() => expect(getMyAccount).toHaveBeenCalledTimes(2))
  })
})
