import { Star, Trash2, RotateCcw, ArrowLeft, Lock } from 'lucide-react'
import type { Note } from '@shared/types'
import { useNotesStore } from '../../store/useNotesStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useTrashUndoStore } from '../../store/useTrashUndoStore'
import { useTranslation } from '../../i18n/useTranslation'
import { useSavedFlashStore } from '../../store/useSavedFlashStore'
import { syncAfterSave, syncAfterDelete } from '../../lib/syncAfterMutation'
import { usePasswordModalStore } from '../../store/usePasswordModalStore'

interface NoteToolbarProps {
  note: Note
}

export function NoteToolbar({ note }: NoteToolbarProps) {
  const { t } = useTranslation()
  const updateNoteInStore = useNotesStore((s) => s.updateNoteInStore)
  const setActiveNoteId = useNotesStore((s) => s.setActiveNoteId)
  const removeNoteFromStore = useNotesStore((s) => s.removeNoteFromStore)
  const view = useNotesStore((s) => s.view)
  const fetchNotes = useNotesStore((s) => s.fetchNotes)

  const handleToggleFavorite = async () => {
    const updated = await window.electronAPI.notes.toggleFavorite(note.id)
    if (updated) {
      updateNoteInStore(note.id, { isFavorite: updated.isFavorite })
      syncAfterSave(updated)
    }
  }

  const setLastTrashed = useTrashUndoStore((s) => s.setLastTrashed)

  const handleMoveToTrash = async () => {
    await window.electronAPI.notes.delete(note.id, false)
    removeNoteFromStore(note.id)
    setActiveNoteId(null)
    fetchNotes(true)
    setLastTrashed(note.id)
    syncAfterSave({ ...note, isDeleted: true, updatedAt: new Date().toISOString() })
  }

  const handleDeletePermanently = async () => {
    if (!window.confirm(t('confirm.deletePermanently'))) return
    await window.electronAPI.notes.delete(note.id, true)
    removeNoteFromStore(note.id)
    setActiveNoteId(null)
    fetchNotes(true)
    syncAfterDelete(note.id)
  }

  const handleRestore = async () => {
    const updated = await window.electronAPI.notes.update(note.id, { isDeleted: false })
    if (updated) {
      updateNoteInStore(note.id, { isDeleted: false })
      setActiveNoteId(null)
      fetchNotes(true)
      syncAfterSave(updated)
    }
  }

  const isTrash = view === 'trash'
  const openSetPassword = usePasswordModalStore((s) => s.openSet)
  const openRemovePassword = usePasswordModalStore((s) => s.openRemove)
  const savedNoteId = useSavedFlashStore((s) => s.savedNoteId)
  const showSaved = savedNoteId === note.id

  const locale = useSettingsStore((s) => s.language) === 'en' ? 'en-US' : 'tr-TR'
  return (
    <header className="sticky top-0 z-20 shrink-0 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-primary/10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          type="button"
          onClick={() => setActiveNoteId(null)}
          className="shrink-0 rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden touch-manipulation"
          aria-label={t('menu.backToList')}
          title={t('menu.backToList')}
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-sm text-slate-400 dark:text-slate-500 truncate min-w-0">
        {showSaved ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{t('editor.saved')}</span>
        ) : (
          <>
            {t('time.lastEdit')} {new Date(note.updatedAt).toLocaleString(locale)}
          </>
        )}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!isTrash && (
          <>
            {note.isLocked ? (
              <button
                type="button"
                onClick={() => openRemovePassword(note)}
                className="rounded-lg p-2 text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={t('menu.removePassword')}
              >
                <Lock size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openSetPassword(note)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors"
                title={t('menu.setPassword')}
              >
                <Lock size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`rounded-lg p-2 transition ${
                note.isFavorite
                  ? 'text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500'
              }`}
              title={note.isFavorite ? t('menu.removeFromFavorites') : t('menu.addToFavorites')}
            >
              <Star size={18} className={note.isFavorite ? 'fill-amber-500' : ''} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={handleMoveToTrash}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500 transition-colors"
              title={t('menu.moveToTrash')}
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
        {isTrash && (
          <>
            <button
              type="button"
              onClick={handleRestore}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-primary/10 hover:text-primary transition-colors"
              title={t('menu.restore')}
            >
              <RotateCcw size={16} />
              {t('menu.restore')}
            </button>
            <button
              type="button"
              onClick={handleDeletePermanently}
              className="rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
            >
              {t('menu.deletePermanently')}
            </button>
          </>
        )}
      </div>
    </header>
  )
}
