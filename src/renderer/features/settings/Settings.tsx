import { useEffect, useState } from 'react'
import { X, Download, Upload, Database, Palette, FileEdit, HardDrive, Info, FileStack, Keyboard, FolderOpen } from 'lucide-react'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useNotesStore } from '../../store/useNotesStore'
import type { DefaultView, SortOrder } from '@shared/types'

const APP_VERSION = '1.0.0'

const SECTIONS = [
  { id: 'appearance', label: 'Görünüm', icon: Palette },
  { id: 'editor', label: 'Editör', icon: FileEdit },
  { id: 'notes', label: 'Notlar', icon: FileStack },
  { id: 'storage', label: 'Depolama', icon: HardDrive },
  { id: 'shortcuts', label: 'Klavye kısayolları', icon: Keyboard },
  { id: 'about', label: 'Hakkında', icon: Info },
] as const

export function Settings() {
  const isOpen = useSettingsStore((s) => s.isOpen)
  const setOpen = useSettingsStore((s) => s.setOpen)
  const theme = useSettingsStore((s) => s.theme)
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

  useEffect(() => {
    if (isOpen) load()
  }, [isOpen, load])

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
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-semibold">Ayarlar</p>
          <nav className="mt-6 flex flex-col gap-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
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
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </nav>
        </aside>
        {/* Right content */}
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-8 lg:p-12 custom-scrollbar">
          <div className="max-w-2xl mx-auto">
            {activeSection === 'appearance' && (
              <>
                <header className="mb-10">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">Görünüm</h2>
                  <p className="text-slate-500 dark:text-slate-400">Uygulamanın görünümünü özelleştirin.</p>
                </header>
                <section className="space-y-10">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Palette size={20} className="text-primary" />
                      Tema
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
                        <span className="text-sm font-medium text-center text-slate-600 dark:text-slate-400 peer-checked:text-primary">Açık</span>
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
                        <span className="text-sm font-medium text-center text-slate-600 dark:text-slate-400 peer-checked:text-primary">Koyu</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Yazı boyutu</h3>
                    <select
                      value={fontSize}
                      onChange={(e) => update({ fontSize: e.target.value as 'small' | 'medium' | 'large' })}
                      className="w-full bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                      <option value="small">Küçük</option>
                      <option value="medium">Orta</option>
                      <option value="large">Büyük</option>
                    </select>
                  </div>
                </section>
              </>
            )}
            {activeSection === 'editor' && (
              <>
                <header className="mb-10">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">Editör</h2>
                  <p className="text-slate-500 dark:text-slate-400">Kaydetme ve davranış ayarları.</p>
                </header>
                <section className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Otomatik kaydet</span>
                      <span className="text-xs text-slate-500">Yazarken notlarınız otomatik kaydedilir</span>
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
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Otomatik kaydet gecikmesi</h3>
                    <select
                      value={autosaveDelayMs}
                      onChange={(e) => update({ autosaveDelayMs: Number(e.target.value) })}
                      className="w-full bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                      <option value={1000}>1 saniye</option>
                      <option value={2000}>2 saniye</option>
                      <option value={5000}>5 saniye</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Değişiklikten sonra kaydetmeden önce beklenecek süre.</p>
                  </div>
                </section>
              </>
            )}
            {activeSection === 'notes' && (
              <>
                <header className="mb-10">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">Notlar</h2>
                  <p className="text-slate-500 dark:text-slate-400">Liste görünümü ve varsayılan davranış.</p>
                </header>
                <section className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Başlangıç görünümü</h3>
                    <select
                      value={defaultView}
                      onChange={(e) => update({ defaultView: e.target.value as DefaultView })}
                      className="w-full bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                      <option value="all">Tüm notlar</option>
                      <option value="favorites">Favoriler</option>
                      <option value="recent">Son düzenlenenler</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Uygulama açıldığında hangi liste gösterilsin.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Sıralama</h3>
                    <select
                      value={sortOrder}
                      onChange={(e) => update({ sortOrder: e.target.value as SortOrder })}
                      className="w-full bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                      <option value="newest">En yeni önce</option>
                      <option value="oldest">En eski önce</option>
                      <option value="title">Başlık (A–Z)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Kompakt liste</span>
                      <span className="text-xs text-slate-500">Not kartlarını daha sıkı gösterir</span>
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
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">Depolama &amp; Veri</h2>
                  <p className="text-slate-500 dark:text-slate-400">Dışa aktar, içe aktar ve depolama bilgisi.</p>
                </header>
                <section className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleExport('json')}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-primary/20 bg-white dark:bg-primary/5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors"
                    >
                      <Download size={18} />
                      JSON dışa aktar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport('markdown')}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-primary/20 bg-white dark:bg-primary/5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors"
                    >
                      <Download size={18} />
                      Markdown dışa aktar
                    </button>
                    <button
                      type="button"
                      onClick={handleImport}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-primary/20 bg-white dark:bg-primary/5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors"
                    >
                      <Upload size={18} />
                      İçe aktar
                    </button>
                  </div>
                  {exportStatus === 'done' && <p className="text-sm text-emerald-500">Dışa aktarıldı.</p>}
                  {exportStatus === 'error' && <p className="text-sm text-red-500">Hata oluştu.</p>}
                  {importStatus === 'done' && <p className="text-sm text-emerald-500">İçe aktarıldı.</p>}
                  {importStatus === 'error' && <p className="text-sm text-red-500">İçe aktarma başarısız.</p>}
                  {storageInfo && (
                    <div className="flex items-start gap-3 p-4 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl">
                      <Database size={20} className="mt-0.5 shrink-0 text-primary" />
                      <div className="min-w-0 text-sm">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{storageInfo.notesCount} not</p>
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
                      Veri klasörünü aç
                    </button>
                    <p className="text-xs text-slate-500 mt-1">Notların ve ayarların saklandığı klasörü dosya yöneticisinde açar.</p>
                  </div>
                </section>
              </>
            )}
            {activeSection === 'shortcuts' && (
              <>
                <header className="mb-10">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">Klavye kısayolları</h2>
                  <p className="text-slate-500 dark:text-slate-400">Kullanılabilir kısayollar.</p>
                </header>
                <section className="space-y-2">
                  <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                    <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">Ctrl+K</kbd>
                    <span className="text-slate-600 dark:text-slate-400">Komut paleti / Notlarda arama</span>
                    <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">Ctrl+Z</kbd>
                    <span className="text-slate-600 dark:text-slate-400">Geri al</span>
                    <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">Ctrl+Y</kbd>
                    <span className="text-slate-600 dark:text-slate-400">Yinele</span>
                    <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">Ctrl+B</kbd>
                    <span className="text-slate-600 dark:text-slate-400">Kalın (seçili metin)</span>
                    <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">Ctrl+I</kbd>
                    <span className="text-slate-600 dark:text-slate-400">İtalik (seçili metin)</span>
                    <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">Ctrl+E</kbd>
                    <span className="text-slate-600 dark:text-slate-400">Kod (seçili metin)</span>
                  </div>
                </section>
              </>
            )}
            {activeSection === 'about' && (
              <>
                <header className="mb-10">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">Hakkında</h2>
                  <p className="text-slate-500 dark:text-slate-400">Notes uygulaması hakkında bilgi.</p>
                </header>
                <section className="space-y-6">
                  <div className="p-6 rounded-xl border border-slate-200 dark:border-primary/10 bg-white dark:bg-primary/5">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Notes</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Masaüstü not uygulaması — v{APP_VERSION}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Electron, React ve TypeScript ile geliştirilmiş, Notion tarzı bir not uygulaması. Tüm veriler cihazınızda saklanır; çevrimdışı çalışır.
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
                Tamam
              </button>
            </div>
            <p className="mt-6 text-xs text-slate-500">Notes — Masaüstü not uygulaması v{APP_VERSION}</p>
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
  )
}
