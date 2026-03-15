import { Star, Trash2, RotateCcw } from 'lucide-react'
import type { Note } from '@shared/types'
import { useNotesStore } from '../../store/useNotesStore'
import { useTrashUndoStore } from '../../store/useTrashUndoStore'

interface NoteToolbarProps {
  note: Note
}

export function NoteToolbar({ note }: NoteToolbarProps) {
  const updateNoteInStore = useNotesStore((s) => s.updateNoteInStore)
  const setActiveNoteId = useNotesStore((s) => s.setActiveNoteId)
  const removeNoteFromStore = useNotesStore((s) => s.removeNoteFromStore)
  const view = useNotesStore((s) => s.view)
  const fetchNotes = useNotesStore((s) => s.fetchNotes)

  const handleToggleFavorite = async () => {
    const updated = await window.electronAPI.notes.toggleFavorite(note.id)
    if (updated) updateNoteInStore(note.id, { isFavorite: updated.isFavorite })
  }

  const setLastTrashed = useTrashUndoStore((s) => s.setLastTrashed)

  const handleMoveToTrash = async () => {
    await window.electronAPI.notes.delete(note.id, false)
    removeNoteFromStore(note.id)
    setActiveNoteId(null)
    fetchNotes(true)
    setLastTrashed(note.id)
  }

  const handleDeletePermanently = async () => {
    await window.electronAPI.notes.delete(note.id, true)
    removeNoteFromStore(note.id)
    setActiveNoteId(null)
    fetchNotes(true)
  }

  const handleRestore = async () => {
    const updated = await window.electronAPI.notes.update(note.id, { isDeleted: false })
    if (updated) {
      updateNoteInStore(note.id, { isDeleted: false })
      setActiveNoteId(null)
      fetchNotes(true)
    }
  }

  const isTrash = view === 'trash'

  return (
    <header className="sticky top-0 z-20 shrink-0 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-primary/10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-3 sm:px-6">
      <span className="text-sm text-slate-400 dark:text-slate-500 truncate min-w-0">
        Son düzenleme: {new Date(note.updatedAt).toLocaleString('tr-TR')}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        {!isTrash && (
          <>
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`rounded-lg p-2 transition ${
                note.isFavorite
                  ? 'text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500'
              }`}
              title={note.isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            >
              <Star size={18} className={note.isFavorite ? 'fill-amber-500' : ''} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={handleMoveToTrash}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500 transition-colors"
              title="Çöp kutusuna taşı"
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
              title="Geri al"
            >
              <RotateCcw size={16} />
              Geri al
            </button>
            <button
              type="button"
              onClick={handleDeletePermanently}
              className="rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
            >
              Kalıcı sil
            </button>
          </>
        )}
      </div>
    </header>
  )
}
