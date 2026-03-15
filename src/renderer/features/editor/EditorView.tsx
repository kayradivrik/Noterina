import { useMemo } from 'react'
import { useNotesStore } from '../../store/useNotesStore'
import { NoteEditor } from './NoteEditor'
import { EditorPlaceholder } from './EditorPlaceholder'
import { NoteToolbar } from './NoteToolbar'

export function EditorView() {
  const notes = useNotesStore((s) => s.notes)
  const activeNoteId = useNotesStore((s) => s.activeNoteId)

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeNoteId) ?? null,
    [notes, activeNoteId]
  )

  if (!activeNote) {
    return <EditorPlaceholder />
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <NoteToolbar note={activeNote} />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <NoteEditor key={activeNote.id} note={activeNote} />
      </div>
    </div>
  )
}
