import { create } from 'zustand'

const SAVED_FLASH_MS = 2000

interface SavedFlashState {
  savedNoteId: string | null
  markSaved: (noteId: string) => void
}

let savedFlashTimeout: ReturnType<typeof setTimeout> | null = null

export const useSavedFlashStore = create<SavedFlashState>((set) => ({
  savedNoteId: null,

  markSaved: (noteId: string) => {
    if (savedFlashTimeout) clearTimeout(savedFlashTimeout)
    set({ savedNoteId: noteId })
    savedFlashTimeout = setTimeout(() => {
      set({ savedNoteId: null })
      savedFlashTimeout = null
    }, SAVED_FLASH_MS)
  },
}))
