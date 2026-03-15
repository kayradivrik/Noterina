import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from '../../i18n/useTranslation'
import { useAuthStore } from '../../store/useAuthStore'

interface AuthScreenProps {
  asModal?: boolean
  onClose?: () => void
}

export function AuthScreen({ asModal, onClose }: AuthScreenProps) {
  const { t } = useTranslation()
  const { isLoading, error, login, signup, init, clearError, session } = useAuthStore()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const unsub = init()
    return unsub
  }, [init])

  useEffect(() => {
    if (session && onClose) onClose()
  }, [session, onClose])

  useEffect(() => {
    clearError()
  }, [isSignUp, email, password, clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSignUp) await signup(email, password)
    else await login(email, password)
  }

  const content = (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800/80">
        <h1 className="mb-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          {isSignUp ? t('auth.signUp') : t('auth.signIn')}
        </h1>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {isSignUp ? t('auth.signUpHint') : t('auth.signInHint')}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.email')}
            required
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
            autoComplete="email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.password')}
            required
            minLength={6}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            {isSignUp ? t('auth.signUp') : t('auth.signIn')}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setIsSignUp((v) => !v)}
          className="mt-3 text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {isSignUp ? t('auth.haveAccount') : t('auth.noAccount')}
        </button>
      </div>
  )

  if (asModal && onClose) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div role="presentation" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onClose}
            className="absolute -top-2 -right-2 rounded-full bg-slate-200 dark:bg-slate-700 p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
            aria-label={t('settings.ok')}
          >
            <X size={18} />
          </button>
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 dark:border-slate-700 dark:bg-slate-800/80">
              {t('auth.loading')}
            </div>
          ) : (
            content
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-slate-500 dark:text-slate-400">{t('auth.loading')}</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
      {content}
    </div>
  )
}
