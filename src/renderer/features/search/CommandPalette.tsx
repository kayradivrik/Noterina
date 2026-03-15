import { useEffect, useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Search, FileText } from 'lucide-react'
import { useCommandPaletteStore } from '../../store/useCommandPaletteStore'
import { useNotesStore } from '../../store/useNotesStore'
import { getPreviewText } from '../../utils/noteActions'

export function CommandPalette() {
  const isOpen = useCommandPaletteStore((s) => s.isOpen)
  const close = useCommandPaletteStore((s) => s.close)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const notes = useNotesStore((s) => s.notes).filter((n) => !n.isDeleted)
  const setActiveNoteId = useNotesStore((s) => s.setActiveNoteId)

  const results = useMemo(() => {
    if (!query.trim()) return notes.slice(0, 15)
    const q = query.toLowerCase()
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [notes, query])

  const openNote = useCallback(
    (noteId: string) => {
      setActiveNoteId(noteId)
      close()
      setQuery('')
      setSelectedIndex(0)
    },
    [setActiveNoteId, close]
  )

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => (i < results.length - 1 ? i + 1 : 0))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => (i > 0 ? i - 1 : results.length - 1))
        return
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault()
        openNote(results[selectedIndex].id)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, results, selectedIndex, openNote, close])

  if (!isOpen) return null

  const overlay = (
    <div
      role="presentation"
      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
      onClick={close}
    />
  )
  const modal = (
    <div
      role="dialog"
      aria-label="Notlarda ara"
      className="fixed left-1/2 top-[15%] z-50 w-full max-w-2xl -translate-x-1/2 overflow-hidden rounded-xl shadow-2xl border border-primary/20 bg-[rgba(16,17,34,0.95)] dark:bg-[rgba(16,17,34,0.95)] backdrop-blur-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="border-b border-primary/10 p-4">
        <div className="relative flex items-center">
          <Search className="absolute left-4 size-5 text-primary" />
          <input
            type="text"
            autoFocus
            placeholder="Notlarda ara veya komut yazın..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-primary/5 border-none rounded-lg py-4 pl-12 pr-4 text-lg text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-primary/50 outline-none"
          />
          <div className="absolute right-4">
            <kbd className="rounded px-2 py-1 text-xs font-semibold text-primary bg-primary/15 border border-primary/30">ESC</kbd>
          </div>
        </div>
      </div>
      <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
        <div className="py-3">
          <h3 className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-primary/60">Notlar</h3>
          {results.length === 0 ? (
            <div className="px-6 py-6 text-center text-sm text-slate-500">Sonuç yok</div>
          ) : (
            <div className="px-4 pb-2 space-y-0.5">
              {results.map((note, i) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => openNote(note.id)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`flex w-full items-center gap-4 p-3 rounded-lg transition-colors text-left ${
                    i === selectedIndex ? 'bg-primary/10' : 'hover:bg-primary/10'
                  }`}
                >
                  <div className="size-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-100 truncate">{note.title || 'Başlıksız'}</p>
                    <p className="text-xs text-slate-500 truncate">{getPreviewText(note.content, 60)}</p>
                  </div>
                  {i === selectedIndex && (
                    <kbd className="rounded px-1.5 py-0.5 text-[10px] text-slate-400 bg-primary/15 border border-primary/30">ENTER</kbd>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <footer className="flex items-center justify-between border-t border-primary/10 bg-black/20 px-4 py-3 text-[11px] text-slate-500">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <kbd className="rounded px-1.5 py-0.5 bg-primary/15 border border-primary/30 leading-none">↑↓</kbd>
            gezin
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded px-1.5 py-0.5 bg-primary/15 border border-primary/30 leading-none">↵</kbd>
            aç
          </span>
        </div>
        <span className="font-semibold text-primary">Notes</span>
      </footer>
    </div>
  )

  return createPortal(
    <>
      {overlay}
      {modal}
    </>,
    document.body
  )
}
