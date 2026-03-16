import { useState } from 'react'
import { Lock } from 'lucide-react'
import type { Note } from '@shared/types'
import { useTranslation } from '../../i18n/useTranslation'
import { useUnlockedNotesStore } from '../../store/useUnlockedNotesStore'
import { useNotesStore } from '../../store/useNotesStore'

interface UnlockNoteFormProps {
  note: Note
}

export function UnlockNoteForm({ note }: UnlockNoteFormProps) {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const setUnlocked = useUnlockedNotesStore((s) => s.setUnlocked)
  const notes = useNotesStore((s) => s.notes)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const pwd = password.trim().normalize('NFC')
    if (!pwd) return
    setError(null)
    setLoading(true)
    try {
      const fresh = await window.electronAPI.notes.getById(note.id)
      const latestNote = fresh ?? notes.find((n) => n.id === note.id) ?? note
      const saved = latestNote.lockPassword ? String(latestNote.lockPassword).trim().normalize('NFC') : ''
      if (!saved || saved !== pwd) {
        setError(t('lock.wrongPassword'))
        setLoading(false)
        return
      }
      // İçerik zaten plaintext; sadece store'da bu oturum için "kilidi aç"
      setUnlocked(note.id, pwd, latestNote.content)
    } catch {
      setError(t('lock.wrongPassword'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[280px] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-6 shadow-sm">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Lock size={28} />
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-4">
          {t('lock.enterPassword')}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('lock.placeholder')}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
            autoFocus
            autoComplete="current-password"
          />
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full rounded-lg bg-primary text-white py-2.5 font-medium hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {loading ? '...' : t('lock.unlock')}
          </button>
        </form>
      </div>
    </div>
  )
}
