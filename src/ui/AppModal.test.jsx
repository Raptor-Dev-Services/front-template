import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AppModal } from './AppModal.jsx'
import { I18nProvider } from '../i18n/I18nProvider.jsx'

// El contrato de accesibilidad se audita aqui UNA vez: el foco entra al abrir, queda contenido, Esc
// cierra, y al cerrar el foco vuelve al disparador.

function renderModal(props = {}) {
  return render(
    <I18nProvider>
      <AppModal open onClose={() => {}} title="Editar registro" {...props}>
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" />
      </AppModal>
    </I18nProvider>,
  )
}

// Un boton de la pantalla abre el modal: es el unico montaje que permite comprobar el retorno de foco.
function TriggerAndModal() {
  const [open, setOpen] = useState(false)
  return (
    <I18nProvider>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir
      </button>
      <AppModal open={open} onClose={() => setOpen(false)} title="Editar registro">
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" />
      </AppModal>
    </I18nProvider>
  )
}

describe('AppModal', () => {
  it('al abrir, el foco entra al modal', async () => {
    renderModal()
    const dialog = await screen.findByRole('dialog')
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
  })

  it('con el modal abierto, el tabulador no se sale del modal', async () => {
    const user = userEvent.setup()
    render(
      <I18nProvider>
        <button type="button">Fuera</button>
        <AppModal open onClose={() => {}} title="Editar registro">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" />
        </AppModal>
      </I18nProvider>,
    )
    const dialog = await screen.findByRole('dialog')

    await user.tab()
    await user.tab()
    await user.tab()
    await user.tab()

    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('Esc cierra', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal({ onClose })
    await screen.findByRole('dialog')

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalled()
  })

  it('al cerrar, el foco vuelve al disparador', async () => {
    const user = userEvent.setup()
    render(<TriggerAndModal />)
    const trigger = screen.getByRole('button', { name: 'Abrir' })
    await user.click(trigger)
    await screen.findByRole('dialog')

    await user.keyboard('{Escape}')

    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('con busy, ni Esc ni la X cierran (no se pierde el formulario a medio envio)', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal({ onClose, busy: true })
    await screen.findByRole('dialog')

    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: /cerrar/i }))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('con onSubmit, el boton del pie envia el formulario', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event) => event.preventDefault())
    render(
      <I18nProvider>
        <AppModal
          open
          onClose={() => {}}
          title="Editar registro"
          scroll="body"
          onSubmit={onSubmit}
          footer={<button type="submit">Guardar</button>}
        >
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" />
        </AppModal>
      </I18nProvider>,
    )
    await screen.findByRole('dialog')

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('sin showClose no pinta boton de cerrar', async () => {
    renderModal({ showClose: false })
    await screen.findByRole('dialog')
    expect(screen.queryByRole('button', { name: /cerrar/i })).toBeNull()
  })

  it('el titulo nombra al dialogo', async () => {
    renderModal()
    expect(await screen.findByRole('dialog', { name: 'Editar registro' })).toBeTruthy()
  })

  it('con el scroll en el overlay no centra por alineacion, para no recortar por arriba', async () => {
    renderModal()
    const dialog = await screen.findByRole('dialog')
    const overlay = dialog.querySelector('.justify-center')
    const panel = overlay.lastElementChild

    expect(overlay.className).not.toMatch(/(^|\s)items-center(\s|$)/)
    expect(overlay.className).toMatch(/items-start/)
    expect(panel.className).toMatch(/my-auto/)
  })
})
