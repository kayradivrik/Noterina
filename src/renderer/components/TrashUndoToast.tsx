import { useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { useTrashUndoStore } from '../store/useTrashUndoStore'
import { useNotesStore } from '../store/useNotesStore'
import { useTranslation } from '../i18n/useTranslation'
import { syncAfterSave } from '../lib/syncAfterMutation'

const TOAST_DURATION_MS = 6000

export function TrashUndoToast() {
  const { t } = useTranslation()
  const lastTrashedNoteId = useTrashUndoStore((s) => s.lastTrashedNoteId)
  const setLastTrashed = useTrashUndoStore((s) => s.setLastTrashed)
  const updateNoteInStore = useNotesStore((s) => s.updateNoteInStore)
  const fetchNotes = useNotesStore((s) => s.fetchNotes)

  useEffect(() => {
    if (!lastTrashedNoteId) return
    const t = setTimeout(() => setLastTrashed(null), TOAST_DURATION_MS)
    return () => clearTimeout(t)
  }, [lastTrashedNoteId, setLastTrashed])

  const handleUndo = async () => {
    if (!lastTrashedNoteId) return
    const updated = await window.electronAPI.notes.update(lastTrashedNoteId, { isDeleted: false })
    if (updated) {
      updateNoteInStore(lastTrashedNoteId, { isDeleted: false })
      fetchNotes(true)
      syncAfterSave(updated)
    }
    setLastTrashed(null)
  }

  if (!lastTrashedNoteId) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] flex flex-wrap items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark shadow-lg px-4 py-3 text-slate-800 dark:text-slate-100 sm:bottom-6 sm:left-1/2 sm:right-auto sm:max-w-md sm:-translate-x-1/2">
      <span className="text-sm">{t('toast.movedToTrash')}</span>
      <button
        type="button"
        onClick={handleUndo}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
      >
        <RotateCcw size={14} />
        {t('toast.undo')}
      </button>
    </div>
  )
}
