import { Sidebar } from '../features/sidebar/Sidebar'
import { NotesList } from '../features/notes/NotesList'
import { EditorView } from '../features/editor/EditorView'

export function Layout() {
  return (
    <div className="flex h-screen w-full min-w-0 overflow-hidden bg-background-light dark:bg-background-dark">
      <Sidebar />
      <aside className="flex min-w-0 w-64 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50 lg:w-80">
        <NotesList />
      </aside>
      <main className="min-h-0 min-w-0 flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0b0c1a]">
        <EditorView />
      </main>
    </div>
  )
}
