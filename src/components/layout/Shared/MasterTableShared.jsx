import { Fragment, useRef } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { ui, cx } from '../../../styles/designSystem'

export function StatusBadge({ isActive }) {
  return isActive ? (
    <span className={ui.badge.success}>Activo</span>
  ) : (
    <span className={ui.badge.neutral}>Inactivo</span>
  )
}

export function ActionMenu({
  row,
  busyRowId,
  onEdit,
  onDeactivate,
  onReactivate,
  extraActions = [],
}) {
  const busy = busyRowId === row.id
  const buttonRef = useRef(null)

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        ref={buttonRef}
        disabled={busy}
        className={cx(
          ui.controls.iconButton,
          'size-7',
          busy && 'opacity-40 cursor-wait',
        )}
      >
        <EllipsisVerticalIcon className="size-4" />
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 z-10 mt-1 w-44 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-slate-900/10 focus:outline-none">
          {onEdit && (
            <MenuItem>
              {({ focus }) => (
                <button
                  type="button"
                  onClick={() => onEdit(row)}
                  className={cx(
                    'flex w-full items-center px-3 py-2 text-sm text-slate-700',
                    focus && 'bg-slate-50',
                  )}
                >
                  Editar
                </button>
              )}
            </MenuItem>
          )}

          {extraActions.map((action) => (
            <MenuItem key={action.label}>
              {({ focus }) => (
                <button
                  type="button"
                  onClick={() => action.onClick(row)}
                  className={cx(
                    'flex w-full items-center px-3 py-2 text-sm',
                    action.danger ? 'text-red-600' : 'text-slate-700',
                    focus && 'bg-slate-50',
                  )}
                >
                  {action.label}
                </button>
              )}
            </MenuItem>
          ))}

          {onDeactivate && row.isActive && (
            <MenuItem>
              {({ focus }) => (
                <button
                  type="button"
                  onClick={() => onDeactivate(row)}
                  className={cx(
                    'flex w-full items-center px-3 py-2 text-sm text-red-600',
                    focus && 'bg-slate-50',
                  )}
                >
                  Dar de baja
                </button>
              )}
            </MenuItem>
          )}

          {onReactivate && !row.isActive && (
            <MenuItem>
              {({ focus }) => (
                <button
                  type="button"
                  onClick={() => onReactivate(row)}
                  className={cx(
                    'flex w-full items-center px-3 py-2 text-sm text-emerald-600',
                    focus && 'bg-slate-50',
                  )}
                >
                  Reactivar
                </button>
              )}
            </MenuItem>
          )}
        </MenuItems>
      </Transition>
    </Menu>
  )
}
