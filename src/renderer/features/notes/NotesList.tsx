import { useMemo, useState, useRef, useEffect } from 'react'
import { Search, FileText, Star, ImageIcon } from 'lucide-react'
import type { Note } from '@shared/types'
import { useNotesStore } from '../../store/useNotesStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useTranslation } from '../../i18n/useTranslation'
import { formatRelativeTime, getPreviewText } from '../../utils/noteActions'
import { NoteContextMenu } from './NoteContextMenu'
import { NOTE_ICONS } from './noteIcons'

export function NotesList() {
  const notes = useNotesStore((s) => s.notes)
  const activeNoteId = useNotesStore((s) => s.activeNoteId)
  const setActiveNoteId = useNotesStore((s) => s.setActiveNoteId)
  const view = useNotesStore((s) => s.view)
  const searchQuery = useNotesStore((s) => s.searchQuery)
  const setSearchQuery = useNotesStore((s) => s.setSearchQuery)
  const updateNoteInStore = useNotesStore((s) => s.updateNoteInStore)
  const sortOrder = useSettingsStore((s) => s.sortOrder)
  const compactList = useSettingsStore((s) => s.compactList)
  const language = useSettingsStore((s) => s.language)
  const { t } = useTranslation()
  const [contextMenu, setContextMenu] = useState<{ note: Note; x: number; y: number } | null>(null)
  const [iconPickerNote, setIconPickerNote] = useState<{ note: Note; anchor: DOMRect } | null>(null)
  const iconPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!iconPickerNote) return
    const close = (e: MouseEvent) => {
      if (iconPickerRef.current && !iconPickerRef.current.contains(e.target as Node)) setIconPickerNote(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [iconPickerNote])

  const filteredNotes = useMemo(() => {
    let list = notes.filter((n) => !n.isDeleted)
    if (view === 'favorites') list = list.filter((n) => n.isFavorite)
    if (view === 'trash') list = notes.filter((n) => Boolean(n.isDeleted))
    if (view === 'recent') {
      list = [...list]
        .sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 20)
    }
    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery) {
      const q = trimmedQuery.toLowerCase()
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    const sorted = [...list]
    if (sortOrder === 'newest') {
      sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } else if (sortOrder === 'oldest') {
      sorted.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
    } else {
      sorted.sort((a, b) => (a.title || 'Başlıksız').localeCompare(b.title || 'Başlıksız', undefined, { sensitivity: 'base' }))
    }
    return sorted
  }, [notes, view, searchQuery, sortOrder])

  const isTrash = view === 'trash'
  const title = isTrash ? t('sidebar.trash') : t('notes.myNotes')
  const subtitle = isTrash
    ? t('notes.deletedCount', { count: filteredNotes.length })
    : t('notes.count', { count: filteredNotes.length })

  return (
    <>
      <header className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50 backdrop-blur-md px-3 py-3 sm:px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
          <input
            type="search"
            placeholder={t('notes.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
          />
        </div>
      </header>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="px-3 py-4 shrink-0 sm:px-4">
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl truncate">{title}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 pb-6 sm:px-4">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="size-12 rounded-xl bg-slate-100 dark:bg-primary/10 flex items-center justify-center text-slate-400 dark:text-primary/60">
                <FileText size={24} />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isTrash ? t('notes.emptyTrash') : searchQuery.trim() ? t('notes.noResults') : t('notes.noNotesYet')}
              </p>
              {!isTrash && !searchQuery.trim() && (
                <p className="text-xs text-slate-400">{t('notes.addFromSidebar')}</p>
              )}
            </div>
          ) : (
            <ul className={compactList ? 'space-y-1' : 'space-y-2'}>
              {filteredNotes.map((note) => (
                <li key={note.id}>
                  <button
                    type="button"
                    onClick={() => setActiveNoteId(note.id)}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      setContextMenu({ note, x: e.clientX, y: e.clientY })
                    }}
                    className={`note-card group w-full text-left rounded-xl border transition-all overflow-hidden ${
                      compactList ? 'p-2 sm:p-2.5' : 'p-3 sm:p-4'
                    } ${
                      activeNoteId === note.id
                        ? 'bg-primary/10 border-primary/40 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30'
                    }`}
                  >
                    <div className={`flex justify-between items-start gap-2 ${compactList ? 'mb-1' : 'mb-2'}`}>
                      <div
                        className={`relative p-1.5 bg-primary/10 text-primary rounded-lg shrink-0 flex items-center justify-center group/icon cursor-pointer hover:ring-2 hover:ring-primary/50 ${
                          compactList ? 'min-w-[28px] min-h-[28px]' : 'min-w-[36px] min-h-[36px]'
                        }`}
                        title={t('notes.changeIcon')}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (view === 'trash') return
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                          setIconPickerNote({ note, anchor: rect })
                        }}
                      >
                        {note.icon ? (
                          <span className={compactList ? 'text-base leading-none' : 'text-xl leading-none'}>{note.icon}</span>
                        ) : (
                          <FileText size={compactList ? 14 : 18} />
                        )}
                        {view !== 'trash' && (
                          <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 opacity-0 group-hover/icon:opacity-100 transition-opacity">
                            <ImageIcon size={14} className="text-white drop-shadow" />
                          </span>
                        )}
                      </div>
                      {note.isFavorite && (
                        <Star size={16} className="shrink-0 fill-amber-400 text-amber-400" strokeWidth={1.5} />
                      )}
                    </div>
                    <h3 className={`font-semibold text-slate-900 dark:text-slate-100 leading-tight line-clamp-1 ${compactList ? 'text-sm mb-0.5' : 'text-base mb-1'}`}>
                      {note.title || t('notes.untitled')}
                    </h3>
                    <p className={`text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed ${compactList ? 'text-xs mb-2' : 'text-sm mb-3'}`}>
                      {getPreviewText(note.content, 80)}
                    </p>
                    <div className={`border-t border-slate-100 dark:border-slate-800 ${compactList ? 'pt-2' : 'pt-3'}`}>
                      <span className={`text-slate-400 font-medium ${compactList ? 'text-[10px]' : 'text-[11px]'}`}>
                        {formatRelativeTime(note.updatedAt, language)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {contextMenu && (
        <NoteContextMenu
          note={contextMenu.note}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
      {iconPickerNote && (
        <div
          ref={iconPickerRef}
          className="fixed z-[100] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark shadow-xl p-2"
          style={{
            left: iconPickerNote.anchor.left,
            top: iconPickerNote.anchor.bottom + 4,
          }}
        >
          <p className="px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('notes.selectIcon')}</p>
          <div className="grid grid-cols-8 gap-0.5">
            {NOTE_ICONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={async (e) => {
                  e.stopPropagation()
                  const updated = await window.electronAPI.notes.update(iconPickerNote.note.id, { icon: emoji })
                  if (updated) {
                    updateNoteInStore(iconPickerNote.note.id, { icon: emoji })
                    const { syncAfterSave } = await import('../../lib/syncAfterMutation')
                    syncAfterSave({ ...iconPickerNote.note, ...updated })
                  }
                  setIconPickerNote(null)
                }}
                className="rounded p-1.5 text-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
