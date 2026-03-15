import { useState, useRef, useEffect } from 'react'
import {
  FileText,
  Plus,
  Star,
  Clock,
  Trash2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { useNotesStore } from '../../store/useNotesStore'
import logoUrl from '../../assets/sas.png'
import { useSettingsStore } from '../../store/useSettingsStore'
import { createNewNote, createNoteFromTemplate } from '../../utils/noteActions'
import { NOTE_TEMPLATES } from '../../utils/templates'

const NAV_ITEMS = [
  { id: 'all', label: 'Tüm Notlar', icon: FileText },
  { id: 'favorites', label: 'Favoriler', icon: Star },
  { id: 'recent', label: 'Son Düzenlenenler', icon: Clock },
  { id: 'trash', label: 'Çöp Kutusu', icon: Trash2 },
] as const

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)
  const templateRef = useRef<HTMLDivElement>(null)
  const view = useNotesStore((s) => s.view)
  const setView = useNotesStore((s) => s.setView)
  const setActiveNoteId = useNotesStore((s) => s.setActiveNoteId)
  const setSettingsOpen = useSettingsStore((s) => s.setOpen)

  useEffect(() => {
    if (!templateOpen) return
    const close = (e: MouseEvent) => {
      if (templateRef.current && !templateRef.current.contains(e.target as Node)) setTemplateOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [templateOpen])

  const handleNewNote = async () => {
    const note = await createNewNote()
    if (note) {
      useNotesStore.getState().addNote(note)
      useNotesStore.getState().setActiveNoteId(note.id)
      useNotesStore.getState().setView('all')
    }
    setTemplateOpen(false)
  }

  const handleTemplateSelect = async (templateId: string) => {
    if (templateId === 'blank') {
      await handleNewNote()
      return
    }
    const template = NOTE_TEMPLATES.find((t) => t.id === templateId)
    if (!template) return
    const note = await createNoteFromTemplate(template)
    if (note) {
      useNotesStore.getState().addNote(note)
      useNotesStore.getState().setActiveNoteId(note.id)
      useNotesStore.getState().setView('all')
    }
    setTemplateOpen(false)
  }

  const navButtonClass = (id: string) =>
    view === id
      ? 'flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-semibold'
      : 'flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'

  if (collapsed) {
    return (
      <aside className="w-16 flex-shrink-0 flex flex-col items-center border-r border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark py-3 custom-scrollbar">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="rounded-lg p-2 text-slate-400 hover:text-primary transition-colors flex items-center justify-center"
          title="Genişlet"
        >
          <ChevronRight size={20} />
        </button>
        <img src={logoUrl} alt="Notes" className="mt-4 size-9 object-contain rounded-lg shrink-0" />
        <div className="mt-4 flex flex-col gap-1">
          {NAV_ITEMS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setView(id)
                setActiveNoteId(null)
              }}
              className={`rounded-lg p-2 transition ${view === id ? 'bg-primary/10 text-primary' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'}`}
              title={NAV_ITEMS.find((i) => i.id === id)?.label}
            >
              <Icon size={22} />
            </button>
          ))}
        </div>
        <div className="mt-auto relative" ref={templateRef}>
          <button
            type="button"
            onClick={() => setTemplateOpen((v) => !v)}
            className="rounded-lg p-2 text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors"
            title="Yeni not veya şablon"
          >
            <Plus size={22} />
          </button>
          {templateOpen && (
            <div className="absolute bottom-full left-0 mb-1 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark shadow-xl py-1 z-50">
              <button
                type="button"
                onClick={handleNewNote}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="text-lg">📄</span>
                Boş not
              </button>
              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
              <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Şablonlar</p>
              {NOTE_TEMPLATES.filter((t) => t.id !== 'blank').map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTemplateSelect(t.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="text-lg">{t.icon}</span>
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-200 transition-colors"
          title="Ayarlar"
        >
          <Settings size={22} />
        </button>
      </aside>
    )
  }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="Notes" className="size-9 object-contain rounded-lg shrink-0" />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Notes</h2>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-200 transition-colors"
          title="Daralt"
        >
          <ChevronLeft size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-8">
        <div>
          <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Kütüphane</p>
          <nav className="space-y-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setView(id)
                  setActiveNoteId(null)
                }}
                className={`w-full text-left ${navButtonClass(id)}`}
              >
                <Icon size={22} strokeWidth={1.8} />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
        <div className="relative" ref={templateRef}>
          <button
            type="button"
            onClick={() => setTemplateOpen((v) => !v)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white py-2.5 px-4 text-sm font-semibold transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            Yeni Not
            <ChevronDown size={16} className="opacity-80" />
          </button>
          {templateOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark shadow-xl py-1 z-50 max-h-64 overflow-y-auto custom-scrollbar">
              <button
                type="button"
                onClick={handleNewNote}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="text-lg">📄</span>
                Boş not
              </button>
              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
              <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Şablonlar</p>
              {NOTE_TEMPLATES.filter((t) => t.id !== 'blank').map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTemplateSelect(t.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="text-lg">{t.icon}</span>
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mt-2"
        >
          <Settings size={20} />
          <span className="text-sm font-medium">Ayarlar</span>
        </button>
      </div>
    </aside>
  )
}
