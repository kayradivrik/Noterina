import { Component, type ReactNode } from 'react'
import { getTranslation } from '../i18n/translations'
import type { AppLanguage } from '@shared/types'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

function getErrorLang(): AppLanguage {
  if (typeof document !== 'undefined' && document.documentElement.lang === 'en') return 'en'
  if (typeof navigator !== 'undefined' && navigator.language.startsWith('en')) return 'en'
  return 'tr'
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const lang = getErrorLang()
      const title = getTranslation(lang, 'error.title')
      const retry = getTranslation(lang, 'error.retry')
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-slate-900 p-8 text-slate-100">
          <h1 className="text-xl font-bold text-red-400">{title}</h1>
          <pre className="max-w-2xl overflow-auto rounded-lg bg-slate-800 p-4 text-sm text-slate-300">
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            {retry}
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
