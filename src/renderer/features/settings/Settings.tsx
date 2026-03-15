import { useEffect, useState } from 'react'
import { X, Download, Upload, Database, Palette, FileEdit, HardDrive, Info, FileStack, Keyboard, FolderOpen, User } from 'lucide-react'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useNotesStore } from '../../store/useNotesStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useTranslation } from '../../i18n/useTranslation'
import { useSupabaseStore } from '../../store/useSupabaseStore'
import { AuthScreen } from '../auth/AuthScreen'
import type { DefaultView, SortOrder } from '@shared/types'
import type { AppLanguage } from '@shared/types'

const APP_VERSION = '1.0.0'

const BASE_SECTIONS = [
  { id: 'appearance' as const, labelKey: 'settings.appearance' as const, icon: Palette },
  { id: 'editor' as const, labelKey: 'settings.editor' as const, icon: FileEdit },
  { id: 'notes' as const, labelKey: 'settings.notes' as const, icon: FileStack },
  { id: 'storage' as const, labelKey: 'settings.storage' as const, icon: HardDrive },
  { id: 'shortcuts' as const, labelKey: 'settings.shortcuts' as const, icon: Keyboard },
  { id: 'about' as const, labelKey: 'settings.about' as const, icon: Info },
]
const CLOUD_SECTION = { id: 'account' as const, labelKey: 'settings.cloud' as const, icon: User }
const SECTIONS = [CLOUD_SECTION, ...BASE_SECTIONS]

export function Settings() {
  const { t } = useTranslation()
  const isOpen = useSettingsStore((s) => s.isOpen)
  const setOpen = useSettingsStore((s) => s.setOpen)
  const theme = useSettingsStore((s) => s.theme)
  const language = useSettingsStore((s) => s.language)
  const fontSize = useSettingsStore((s) => s.fontSize)
  const autosave = useSettingsStore((s) => s.autosave)
  const autosaveDelayMs = useSettingsStore((s) => s.autosaveDelayMs)
  const defaultView = useSettingsStore((s) => s.defaultView)
  const sortOrder = useSettingsStore((s) => s.sortOrder)
  const compactList = useSettingsStore((s) => s.compactList)
  const load = useSettingsStore((s) => s.load)
  const update = useSettingsStore((s) => s.update)
  const [activeSection, setActiveSection] = useState<(typeof SECTIONS)[number]['id']>('appearance')
  const [storageInfo, setStorageInfo] = useState<{ notesCount: number; path: string } | null>(null)
  const [exportStatus, setExportStatus] = useState<'idle' | 'done' | 'error'>('idle')
  const [importStatus, setImportStatus] = useState<'idle' | 'done' | 'error'>('idle')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [cloudSaveStatus, setCloudSaveStatus] = useState<'idle' | 'done' | 'error'>('idle')
  const session = useAuthStore((s) => s.session)
  const supabaseClient = useSupabaseStore((s) => s.client)
  const setSupabaseConfig = useSupabaseStore((s) => s.setConfig)
  const loadSupabaseConfig = useSupabaseStore((s) => s.loadConfig)
  const [cloudUrl, setCloudUrl] = useState('')
  const [cloudKey, setCloudKey] = useState('')

  useEffect(() => {
    if (isOpen) load()
  }, [isOpen, load])

  useEffect(() => {
    if (isOpen) {
      loadSupabaseConfig().then(() => {
        const c = useSupabaseStore.getState().config
        setCloudUrl(c.url)
        setCloudKey(c.anonKey)
      })
    }
  }, [isOpen, loadSupabaseConfig])

  useEffect(() => {
    if (!isOpen) return
    window.electronAPI.storage.info().then(setStorageInfo)
  }, [isOpen])

  const handleExport = async (format: 'json' | 'markdown') => {
    try {
      const data = await window.electronAPI.notes.exportNotes(format)
      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `notes-export-${Date.now()}.${format === 'json' ? 'json' : 'md'}`
      a.click()
      URL.revokeObjectURL(url)
      setExportStatus('done')
      setTimeout(() => setExportStatus('idle'), 2000)
    } catch {
      setExportStatus('error')
      setTimeout(() => setExportStatus('idle'), 2000)
    }
  }

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const result = await window.electronAPI.notes.importNotes(text, 'json')
        if (result.imported > 0) {
          useNotesStore.getState().fetchNotes()
          setImportStatus('done')
        } else setImportStatus('error')
        setTimeout(() => setImportStatus('idle'), 2000)
      } catch {
        setImportStatus('error')
        setTimeout(() => setImportStatus('idle'), 2000)
      }
    }
    input.click()
  }

  if (!isOpen) return null

  return (
    <>
      {showAuthModal && <AuthScreen asModal onClose={() => setShowAuthModal(false)} />}
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        role="presentation"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div
        className="relative flex max-h-[90vh] w-full max-w-[95vw] overflow-hidden rounded-xl border border-slate-200 dark:border-primary/10 bg-white dark:bg-background-dark shadow-2xl sm:max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left nav - Stitch style */}
        <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-primary/10 bg-background-light dark:bg-background-dark/50 p-6">
          <h1 className="text-xl font-bold text-primary tracking-tight">Notes</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-semibold">{t('settings.title')}</p>
          <nav className="mt-6 flex flex-col gap-1">
            {SECTIONS.map(({ id, labelKey, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  activeSection === id
                    ? 'bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-primary/10'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{t(labelKey)}</span>
              </button>
            ))}
          </nav>
        </aside>
        {/* Right content */}
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-8 lg:p-12 custom-scrollbar">
          <div className="max-w-2xl mx-auto">
            {activeSection === 'account' && (
              <>
                <header className="mb-10">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">{t('settings.cloudTitle')}</h2>
                  <p className="text-slate-500 dark:text-slate-400">{t('settings.cloudDesc')}</p>
                </header>
                <section className="space-y-4">
                  {!supabaseClient ? (
                    <>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">{t('settings.cloudOptional')}</p>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t('settings.cloudSupabaseUrl')}
                      </label>
                      <input
                        type="url"
                        value={cloudUrl}
                        onChange={(e) => setCloudUrl(e.target.value)}
                        placeholder="https://xxxx.supabase.co"
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-400"
                      />
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t('settings.cloudAnonKey')}
                      </label>
                      <input
                        type="password"
                        value={cloudKey}
                        onChange={(e) => setCloudKey(e.target.value)}
                        placeholder="eyJhbGc..."
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-400"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          setCloudSaveStatus('idle')
                          try {
                            await setSupabaseConfig(cloudUrl, cloudKey)
                            await loadSupabaseConfig()
                            if (useSupabaseStore.getState().client) useAuthStore.getState().init()
                            setCloudSaveStatus('done')
                            setTimeout(() => setCloudSaveStatus('idle'), 2000)
                          } catch {
                            setCloudSaveStatus('error')
                            setTimeout(() => setCloudSaveStatus('idle'), 2000)
                          }
                        }}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                      >
                        {t('settings.cloudSave')}
                      </button>
                      {cloudSaveStatus === 'done' && <span className="text-sm text-green-600 dark:text-green-400">{t('settings.cloudSaved')}</span>}
                      {cloudSaveStatus === 'error' && <span className="text-sm text-red-600 dark:text-red-400">{t('settings.exportError')}</span>}
                    </>
                  ) : session ? (
                    <>
                      <p className="text-slate-600 dark:text-slate-300">
                        {t('auth.loggedInAs')} <strong>{session.user.email}</strong>
                      </p>
                      <button
                        type="button"
                        onClick={() => useAuthStore.getState().logout()}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        {t('auth.logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">{t('settings.accountNotSignedIn')}</p>
                      <button
                        type="button"
                        onClick={() => setShowAuthModal(true)}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                      >
                        {t('auth.signIn')}
                      </button>
                    </>
                  )}
                </section>
              </>
            )}
            {activeSection === 'appearance' && (
              <>
                <header className="mb-10">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">{t('settings.appearanceTitle')}</h2>
                  <p className="text-slate-500 dark:text-slate-400">{t('settings.appearanceDesc')}</p>
                </header>
                <section className="space-y-10">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Palette size={20} className="text-primary" />
                      {t('settings.theme')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="relative flex flex-col gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="theme"
                          value="light"
                          checked={theme === 'light'}
                          onChange={() => update({ theme: 'light' })}
                          className="peer sr-only"
                        />
                        <div className="h-24 w-full rounded-xl border-2 border-slate-200 dark:border-primary/10 bg-white p-2 peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                          <div className="flex flex-col gap-2">
                            <div className="h-2 w-1/2 bg-slate-200 rounded" />
                            <div className="h-2 w-full bg-slate-100 rounded" />
                            <div className="h-2 w-3/4 bg-slate-100 rounded" />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-center text-slate-600 dark:text-slate-400 peer-checked:text-primary">{t('settings.themeLight')}</span>
                      </label>
                      <label className="relative flex flex-col gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="theme"
                          value="dark"
                          checked={theme === 'dark'}
                          onChange={() => update({ theme: 'dark' })}
                          className="peer sr-only"
                        />
                        <div className="h-24 w-full rounded-xl border-2 border-slate-200 dark:border-primary/10 bg-slate-900 p-2 peer-checked:border-primary peer-checked:bg-primary/20 transition-all">
                          <div className="flex flex-col gap-2">
                            <div className="h-2 w-1/2 bg-slate-700 rounded" />
                            <div className="h-2 w-full bg-slate-800 rounded" />
                            <div className="h-2 w-3/4 bg-slate-800 rounded" />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-center text-slate-600 dark:text-slate-400 peer-checked:text-primary">{t('settings.themeDark')}</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">{t('settings.language')}</h3>
                    <select
                      value={language}
                      onChange={(e) => update({ language: e.target.value as AppLanguage })}
                      className="w-full bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                      <option value="tr">Türkçe</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">{t('settings.fontSize')}</h3>
                    <select
                      value={fontSize}
                      onChange={(e) => update({ fontSize: e.target.value as 'small' | 'medium' | 'large' })}
                      className="w-full bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                      <option value="small">{t('settings.fontSizeSmall')}</option>
                      <option value="medium">{t('settings.fontSizeMedium')}</option>
                      <option value="large">{t('settings.fontSizeLarge')}</option>
                    </select>
                  </div>
                </section>
              </>
            )}
            {activeSection === 'editor' && (
              <>
                <header className="mb-10">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">{t('settings.editorTitle')}</h2>
                  <p className="text-slate-500 dark:text-slate-400">{t('settings.editorDesc')}</p>
                </header>
                <section className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{t('settings.autosave')}</span>
                      <span className="text-xs text-slate-500">{t('settings.autosaveHint')}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autosave}
                        onChange={(e) => update({ autosave: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">{t('settings.autosaveDelay')}</h3>
                    <select
                      value={autosaveDelayMs}
                      onChange={(e) => update({ autosaveDelayMs: Number(e.target.value) })}
                      className="w-full bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                      <option value={1000}>{t('settings.seconds', { count: 1 })}</option>
                      <option value={2000}>{t('settings.seconds', { count: 2 })}</option>
                      <option value={5000}>{t('settings.seconds', { count: 5 })}</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">{t('settings.autosaveDelayHint')}</p>
                  </div>
                </section>
              </>
            )}
            {activeSection === 'notes' && (
              <>
                <header className="mb-10">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">{t('settings.notesTitle')}</h2>
                  <p className="text-slate-500 dark:text-slate-400">{t('settings.notesDesc')}</p>
                </header>
                <section className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">{t('settings.startView')}</h3>
                    <select
                      value={defaultView}
                      onChange={(e) => update({ defaultView: e.target.value as DefaultView })}
                      className="w-full bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                      <option value="all">{t('settings.viewAll')}</option>
                      <option value="favorites">{t('settings.viewFavorites')}</option>
                      <option value="recent">{t('settings.viewRecent')}</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">{t('settings.startViewHint')}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">{t('settings.sortOrder')}</h3>
                    <select
                      value={sortOrder}
                      onChange={(e) => update({ sortOrder: e.target.value as SortOrder })}
                      className="w-full bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                      <option value="newest">{t('settings.sortNewest')}</option>
                      <option value="oldest">{t('settings.sortOldest')}</option>
                      <option value="title">{t('settings.sortTitle')}</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{t('settings.compactList')}</span>
                      <span className="text-xs text-slate-500">{t('settings.compactListHint')}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={compactList}
                        onChange={(e) => update({ compactList: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>
                </section>
              </>
            )}
            {activeSection === 'storage' && (
              <>
                <header className="mb-10">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">{t('settings.storageTitle')}</h2>
                  <p className="text-slate-500 dark:text-slate-400">{t('settings.storageDesc')}</p>
                </header>
                <section className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleExport('json')}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-primary/20 bg-white dark:bg-primary/5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors"
                    >
                      <Download size={18} />
                      {t('settings.exportJson')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport('markdown')}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-primary/20 bg-white dark:bg-primary/5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors"
                    >
                      <Download size={18} />
                      {t('settings.exportMarkdown')}
                    </button>
                    <button
                      type="button"
                      onClick={handleImport}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-primary/20 bg-white dark:bg-primary/5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors"
                    >
                      <Upload size={18} />
                      {t('settings.import')}
                    </button>
                  </div>
                  {exportStatus === 'done' && <p className="text-sm text-emerald-500">{t('settings.exportDone')}</p>}
                  {exportStatus === 'error' && <p className="text-sm text-red-500">{t('settings.exportError')}</p>}
                  {importStatus === 'done' && <p className="text-sm text-emerald-500">{t('settings.importDone')}</p>}
                  {importStatus === 'error' && <p className="text-sm text-red-500">{t('settings.importError')}</p>}
                  {storageInfo && (
                    <div className="flex items-start gap-3 p-4 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl">
                      <Database size={20} className="mt-0.5 shrink-0 text-primary" />
                      <div className="min-w-0 text-sm">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{t('settings.notesCount', { count: storageInfo.notesCount })}</p>
                        <p className="truncate text-xs text-slate-500 mt-1" title={storageInfo.path}>{storageInfo.path}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <button
                      type="button"
                      onClick={() => window.electronAPI.storage.openDataFolder()}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-primary/20 bg-white dark:bg-primary/5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors"
                    >
                      <FolderOpen size={18} />
                      {t('settings.openDataFolder')}
                    </button>
                    <p className="text-xs text-slate-500 mt-1">{t('settings.openDataFolderHint')}</p>
                  </div>
                </section>
              </>
            )}
            {activeSection === 'shortcuts' && (
              <>
                <header className="mb-10">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">{t('settings.shortcutsTitle')}</h2>
                  <p className="text-slate-500 dark:text-slate-400">{t('settings.shortcutsDesc')}</p>
                </header>
                <section className="space-y-2">
                  <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                    <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">Ctrl+K</kbd>
                    <span className="text-slate-600 dark:text-slate-400">{t('settings.shortcutCommandPalette')}</span>
                    <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">Ctrl+Z</kbd>
                    <span className="text-slate-600 dark:text-slate-400">{t('settings.shortcutUndo')}</span>
                    <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">Ctrl+Y</kbd>
                    <span className="text-slate-600 dark:text-slate-400">{t('settings.shortcutRedo')}</span>
                    <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">Ctrl+B</kbd>
                    <span className="text-slate-600 dark:text-slate-400">{t('settings.shortcutBold')}</span>
                    <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">Ctrl+I</kbd>
                    <span className="text-slate-600 dark:text-slate-400">{t('settings.shortcutItalic')}</span>
                    <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">Ctrl+E</kbd>
                    <span className="text-slate-600 dark:text-slate-400">{t('settings.shortcutCode')}</span>
                  </div>
                </section>
              </>
            )}
            {activeSection === 'about' && (
              <>
                <header className="mb-10">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">{t('settings.aboutTitle')}</h2>
                  <p className="text-slate-500 dark:text-slate-400">{t('settings.aboutDesc')}</p>
                </header>
                <section className="space-y-6">
                  <div className="p-6 rounded-xl border border-slate-200 dark:border-primary/10 bg-white dark:bg-primary/5">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Notes</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{t('settings.aboutDesktop')} — {t('settings.aboutVersion', { version: APP_VERSION })}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t('settings.aboutBody')}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    <p>Electron · React · TipTap · Tailwind CSS · Zustand</p>
                  </div>
                </section>
              </>
            )}
            <div className="mt-10 pt-6 border-t border-slate-200 dark:border-primary/10 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-6 py-2.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
              >
                {t('settings.ok')}
              </button>
            </div>
            <p className="mt-6 text-xs text-slate-500">{t('settings.footer')} v{APP_VERSION}</p>
          </div>
        </main>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-primary/10 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
    </>
  )
}
