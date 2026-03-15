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
import { useTranslation } from '../../i18n/useTranslation'
import { createNewNote, createNoteFromTemplate } from '../../utils/noteActions'
import { NOTE_TEMPLATES } from '../../utils/templates'
import type { TranslationKey } from '../../i18n/translations'

const NAV_ITEMS = [
  { id: 'all', labelKey: 'sidebar.allNotes', icon: FileText },
  { id: 'favorites', labelKey: 'sidebar.favorites', icon: Star },
  { id: 'recent', labelKey: 'sidebar.recent', icon: Clock },
  { id: 'trash', labelKey: 'sidebar.trash', icon: Trash2 },
] as const

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)
  const templateRef = useRef<HTMLDivElement>(null)
  const view = useNotesStore((s) => s.view)
  const setView = useNotesStore((s) => s.setView)
  const setActiveNoteId = useNotesStore((s) => s.setActiveNoteId)
  const fetchNotes = useNotesStore((s) => s.fetchNotes)
  const setSettingsOpen = useSettingsStore((s) => s.setOpen)
  const language = useSettingsStore((s) => s.language)

  useEffect(() => {
    if (!templateOpen) return
    const close = (e: MouseEvent) => {
      if (templateRef.current && !templateRef.current.contains(e.target as Node)) setTemplateOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [templateOpen])

  const handleNewNote = async () => {
    const note = await createNewNote(language)
    if (note) {
      useNotesStore.getState().addNote(note)
      useNotesStore.getState().setActiveNoteId(note.id)
      useNotesStore.getState().setView('all')
    }
    setTemplateOpen(false)
    onClose?.()
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
    onClose?.()
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
          title={t('sidebar.expand')}
        >
          <ChevronRight size={20} />
        </button>
        <img src={logoUrl} alt="Notes" className="mt-4 size-9 object-contain rounded-lg shrink-0" />
        <div className="mt-4 flex flex-col gap-1">
          {NAV_ITEMS.map(({ id, labelKey, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setView(id)
                setActiveNoteId(null)
                if (id === 'trash') fetchNotes(true)
                onClose?.()
              }}
              className={`rounded-lg p-2 transition ${view === id ? 'bg-primary/10 text-primary' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'}`}
              title={t(labelKey)}
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
            title={t('sidebar.newNoteOrTemplate')}
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
                {t('sidebar.blankNote')}
              </button>
              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
              <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('sidebar.templates')}</p>
              {NOTE_TEMPLATES.filter((tmpl) => tmpl.id !== 'blank').map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleTemplateSelect(tmpl.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="text-lg">{tmpl.icon}</span>
                  {t(`template.${tmpl.id}` as TranslationKey)}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => { setSettingsOpen(true); onClose?.() }}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-200 transition-colors"
          title={t('sidebar.settings')}
        >
          <Settings size={22} />
        </button>
      </aside>
    )
  }

  return (
    <aside className="h-full w-64 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark">
      <div className="p-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="Notes" className="size-9 object-contain rounded-lg shrink-0" />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Notes</h2>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-200 transition-colors touch-manipulation"
            aria-label="Close menu"
          >
            <ChevronLeft size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title={t('sidebar.collapse')}
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-8">
        <div>
          <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('sidebar.library')}</p>
          <nav className="space-y-1">
            {NAV_ITEMS.map(({ id, labelKey, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setView(id)
                  setActiveNoteId(null)
                  if (id === 'trash') fetchNotes(true)
                  onClose?.()
                }}
                className={`w-full text-left ${navButtonClass(id)}`}
              >
                <Icon size={22} strokeWidth={1.8} />
                <span className="text-sm">{t(labelKey)}</span>
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
            {t('sidebar.newNote')}
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
                {t('sidebar.blankNote')}
              </button>
              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
              <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('sidebar.templates')}</p>
              {NOTE_TEMPLATES.filter((tmpl) => tmpl.id !== 'blank').map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleTemplateSelect(tmpl.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="text-lg">{tmpl.icon}</span>
                  {t(`template.${tmpl.id}` as TranslationKey)}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => { setSettingsOpen(true); onClose?.() }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mt-2"
        >
          <Settings size={20} />
          <span className="text-sm font-medium">{t('sidebar.settings')}</span>
        </button>
      </div>
    </aside>
  )
}
