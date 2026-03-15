import { useState } from 'react'
import { Menu } from 'lucide-react'
import { useNotesStore } from '../store/useNotesStore'
import { Sidebar } from '../features/sidebar/Sidebar'
import { NotesList } from '../features/notes/NotesList'
import { EditorView } from '../features/editor/EditorView'

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const activeNoteId = useNotesStore((s) => s.activeNoteId)

  return (
    <div className="flex h-screen w-full min-w-0 overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile: sidebar overlay */}
      {mobileMenuOpen && (
        <>
          <div
            role="button"
            tabIndex={0}
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] lg:hidden">
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </>
      )}

      {/* Sağ alan: mobilde üstte başlık, altta liste veya editör */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/80 px-3 py-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 touch-manipulation"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
          <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">Notes</span>
        </header>

        <div className="flex min-h-0 flex-1 min-w-0">
          {/* List: mobilde sadece not seçili değilken, desktop'ta her zaman */}
          <aside
            className={`flex min-w-0 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50 w-full lg:w-80 ${
              activeNoteId ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <NotesList />
          </aside>

          {/* Editor: mobilde sadece not seçiliyken, desktop'ta her zaman */}
          <main
            className={`min-h-0 min-w-0 flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0b0c1a] ${
              activeNoteId ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <EditorView />
          </main>
        </div>
      </div>
    </div>
  )
}
