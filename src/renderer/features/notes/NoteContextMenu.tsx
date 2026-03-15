import { useEffect, useRef, useState } from 'react'
import { Edit3, Star, Trash2, RotateCcw, ImageIcon } from 'lucide-react'
import type { Note } from '@shared/types'
import { useNotesStore } from '../../store/useNotesStore'
import { useTrashUndoStore } from '../../store/useTrashUndoStore'
import { NOTE_ICONS } from './noteIcons'

interface NoteContextMenuProps {
  note: Note
  x: number
  y: number
  onClose: () => void
}

export function NoteContextMenu({ note, x, y, onClose }: NoteContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [showIcons, setShowIcons] = useState(false)
  const setActiveNoteId = useNotesStore((s) => s.setActiveNoteId)
  const updateNoteInStore = useNotesStore((s) => s.updateNoteInStore)
  const removeNoteFromStore = useNotesStore((s) => s.removeNoteFromStore)
  const fetchNotes = useNotesStore((s) => s.fetchNotes)
  const view = useNotesStore((s) => s.view)
  const setLastTrashed = useTrashUndoStore((s) => s.setLastTrashed)
  const isTrash = view === 'trash'

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose()
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showIcons) setShowIcons(false)
        else onClose()
      }
    }
    const t = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }, 0)
    return () => {
      clearTimeout(t)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose, showIcons])

  const handleEdit = () => {
    setActiveNoteId(note.id)
    onClose()
  }

  const handleToggleFavorite = async () => {
    const updated = await window.electronAPI.notes.toggleFavorite(note.id)
    if (updated) updateNoteInStore(note.id, { isFavorite: updated.isFavorite })
    onClose()
  }

  const handleMoveToTrash = async () => {
    await window.electronAPI.notes.delete(note.id, false)
    removeNoteFromStore(note.id)
    setActiveNoteId(null)
    fetchNotes(true)
    setLastTrashed(note.id)
    onClose()
  }

  const handleRestore = async () => {
    const updated = await window.electronAPI.notes.update(note.id, { isDeleted: false })
    if (updated) {
      updateNoteInStore(note.id, { isDeleted: false })
      setActiveNoteId(null)
      fetchNotes(true)
    }
    onClose()
  }

  const handleDeletePermanently = async () => {
    await window.electronAPI.notes.delete(note.id, true)
    removeNoteFromStore(note.id)
    setActiveNoteId(null)
    fetchNotes(true)
    onClose()
  }

  const handleIconSelect = async (icon: string) => {
    const updated = await window.electronAPI.notes.update(note.id, { icon })
    if (updated) updateNoteInStore(note.id, { icon })
    setShowIcons(false)
    onClose()
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[200px] max-w-[min(320px,calc(100vw-1rem))] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark shadow-xl py-1"
      style={{ left: Math.min(x, window.innerWidth - 220), top: y }}
    >
      {!showIcons ? (
        <>
          <button
            type="button"
            onClick={handleEdit}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit3 size={16} />
            Düzenle
          </button>
          {!isTrash && (
            <>
              <button
                type="button"
                onClick={handleToggleFavorite}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Star size={16} className={note.isFavorite ? 'fill-amber-400 text-amber-400' : ''} />
                {note.isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
              </button>
              <button
                type="button"
                onClick={() => setShowIcons(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ImageIcon size={16} />
                Simge değiştir
              </button>
              <button
                type="button"
                onClick={handleMoveToTrash}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 size={16} />
                Çöp kutusuna taşı
              </button>
            </>
          )}
          {isTrash && (
            <>
              <button
                type="button"
                onClick={handleRestore}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw size={16} />
                Geri al
              </button>
              <button
                type="button"
                onClick={handleDeletePermanently}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 size={16} />
                Kalıcı sil
              </button>
            </>
          )}
        </>
      ) : (
        <div className="p-2">
          <p className="px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">Simge seç</p>
          <div className="grid grid-cols-8 gap-1">
            {NOTE_ICONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleIconSelect(emoji)}
                className="rounded p-1.5 text-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
