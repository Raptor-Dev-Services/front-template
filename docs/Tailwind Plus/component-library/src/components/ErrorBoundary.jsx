import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.warn(`[Preview] "${this.props.name}" falló al renderizar:`, error.message)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-600">
          <span className="font-semibold shrink-0">Error:</span>
          <span className="font-mono break-all">{this.state.error.message}</span>
        </div>
      )
    }
    return this.props.children
  }
}
