import { useState } from 'react'
import { Lock, X } from 'lucide-react'
import { useTranslation } from '../i18n/useTranslation'
import { usePasswordModalStore } from '../store/usePasswordModalStore'
import { useUnlockedNotesStore } from '../store/useUnlockedNotesStore'
import { useNotesStore } from '../store/useNotesStore'

export function PasswordModal() {
  const { t } = useTranslation()
  const { open, mode, note, initialContent, getContent, close } = usePasswordModalStore()
  const updateNoteInStore = useNotesStore((s) => s.updateNoteInStore)
  const fetchNotes = useNotesStore((s) => s.fetchNotes)
  const lock = useUnlockedNotesStore((s) => s.lock)
  const getDecryptedContent = useUnlockedNotesStore((s) => s.getDecryptedContent)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!open || !note) return null

  const handleClose = () => {
    setPassword('')
    setConfirmPassword('')
    setError(null)
    close()
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 4) {
      setError(t('lock.passwordMinLength'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('lock.passwordsDontMatch'))
      return
    }
    setLoading(true)
    try {
      const normalized = password.trim().normalize('NFC')
      const updated = await window.electronAPI.notes.update(note.id, {
        isLocked: true,
        lockPassword: normalized,
      })
      if (updated) {
        updateNoteInStore(note.id, {
          isLocked: Boolean(updated.isLocked),
          lockPassword: normalized,
          updatedAt: updated.updatedAt,
        })
        await fetchNotes(true)
        handleClose()
      }
    } catch {
      setError(t('lock.wrongPassword'))
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const normalized = password.trim().normalize('NFC')
      if (!note.lockPassword || note.lockPassword !== normalized) {
        setError(t('lock.wrongPassword'))
        setLoading(false)
        return
      }
      const updated = await window.electronAPI.notes.update(note.id, {
        isLocked: false,
        lockPassword: undefined,
      })
      if (updated) {
        updateNoteInStore(note.id, {
          isLocked: false,
          lockPassword: undefined,
        })
        lock(note.id)
        handleClose()
      }
    } catch {
      setError(t('lock.wrongPassword'))
    } finally {
      setLoading(false)
    }
  }

  const isSet = mode === 'set'
  const title = isSet ? t('lock.setPasswordTitle') : t('lock.removePasswordTitle')
  const hint = isSet ? t('lock.setPasswordHint') : t('lock.removePasswordHint')

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" onClick={handleClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Lock size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={isSet ? handleSetPassword : handleRemovePassword} className="p-4 space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('lock.placeholder')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('lock.placeholder')}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
          </div>
          {isSet && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('lock.confirmPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('lock.placeholder')}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}
          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('lock.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !password.trim() || (isSet && password !== confirmPassword)}
              className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? '...' : isSet ? t('menu.setPassword') : t('lock.unlock')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
