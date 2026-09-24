import { Component } from 'react'
import { ErrorScreen } from './ErrorScreen.jsx'
import { translateMessage } from '../i18n/translate.js'
import { readStoredLocale } from '../i18n/locale.js'

/**
 * ErrorBoundary - limite de error de React (regla `error-screens`). Solo atrapa fallos DURANTE EL
 * RENDER: no atrapa errores de manejadores de eventos ni promesas sin esperar; esos se manejan donde
 * ocurren y se muestran con AppNotification. Va en DOS niveles:
 *
 *   - AFUERA (App.jsx, envolviendo tambien a los providers): red para cuando falla el armazon mismo.
 *     Sin este nivel, un fallo ahi desmonta el arbol entero y deja pantalla en blanco.
 *   - ADENTRO (AppLayout, envolviendo su <Outlet />): una vista rota no se lleva el menu; el usuario
 *     navega a otra seccion sin recargar.
 *
 * Es de clase porque getDerivedStateFromError/componentDidCatch no tienen equivalente en hooks.
 *
 * NO usa useI18n ni ningun contexto: un limite puede activarse por un fallo DENTRO de I18nProvider, y
 * una red que solo funciona si su propio proveedor no fallo no sirve como red. Traduce con la funcion
 * pura contra el idioma guardado. Por lo mismo pinta un <button> nativo y no AppButton.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    const { children } = this.props
    const { error } = this.state

    if (!error) return children

    const locale = readStoredLocale()
    const t = (key) => translateMessage(key, undefined, locale)
    const technicalMessage = (error instanceof Error ? error.message : '') || t('errorBoundary.noDetail')

    return (
      <ErrorScreen
        eyebrow={t('errorBoundary.eyebrow')}
        title={t('errorBoundary.title')}
        body={t('errorBoundary.body')}
        technicalMessage={technicalMessage}
        action={
          <button type="button" className="ui-btn ui-btn-primary" onClick={this.handleReload}>
            {t('errorBoundary.reload')}
          </button>
        }
      />
    )
  }
}

export default ErrorBoundary
