import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

const SIZE_CLASS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/45" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel
              className={`w-full ${SIZE_CLASS[size] ?? SIZE_CLASS.md} rounded-xl bg-white shadow-xl ring-1 ring-slate-900/10`}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                {title && (
                  <DialogTitle className="text-sm font-semibold text-slate-900">
                    {title}
                  </DialogTitle>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-auto rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff7b00]"
                >
                  <XMarkIcon className="size-4" />
                </button>
              </div>
              <div className="p-4">{children}</div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
