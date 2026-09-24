import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { cx } from '../styles/designSystem.js'

// ActionMenu - menu de acciones por fila ("..."). Menu de Headless UI: flechas, Esc y foco resueltos.
//
//   <ActionMenu
//     label={t('users.actions.menu', { name: row.fullName })}   // nombre accesible del disparador
//     items={[
//       { key: 'edit', label: t('users.actions.edit'), onSelect: () => onEdit(row) },
//       { key: 'disable', label: t('users.actions.disable'), onSelect: () => onDisable(row), tone: 'danger' },
//     ]}
//   />
//
// Un item con `hidden: true` no se pinta (accion sin permiso); con `disabled: true` se ve pero no se
// puede elegir. Si no queda ningun item visible, el menu entero desaparece: un "..." que abre un
// menu vacio es ruido.
export function ActionMenu({ label, items, disabled = false }) {
  const visible = items.filter((item) => !item.hidden)
  if (visible.length === 0) return null

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        disabled={disabled}
        aria-label={label}
        title={label}
        className="ui-icon-btn data-disabled:cursor-wait data-disabled:opacity-40"
      >
        <EllipsisVerticalIcon aria-hidden="true" className="size-5" />
      </MenuButton>

      <MenuItems
        transition
        anchor="bottom end"
        className="z-50 w-48 origin-top-right rounded-lg border border-border bg-surface-raised p-1 shadow-lg transition duration-150 ease-out [--anchor-gap:0.25rem] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
      >
        {visible.map((item) => (
          <MenuItem key={item.key} disabled={item.disabled}>
            <button
              type="button"
              onClick={item.onSelect}
              className={cx(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm data-focus:bg-surface-muted data-disabled:opacity-50',
                item.tone === 'danger' ? 'text-error' : 'text-content',
              )}
            >
              {item.icon ? <item.icon aria-hidden="true" className="size-4" /> : null}
              {item.label}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  )
}

export default ActionMenu
