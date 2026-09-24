import { cx } from '../styles/designSystem.js'

// Container - ancho maximo centrado + gutter lateral responsivo. Unico lugar donde se define el
// gutter horizontal de las pantallas publicas (login, error). El panel usa el padding de AppLayout.
export function Container({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={cx('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)} {...rest}>
      {children}
    </Tag>
  )
}

export default Container
