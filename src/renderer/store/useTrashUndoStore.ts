import { create } from 'zustand'

interface TrashUndoState {
  lastTrashedNoteId: string | null
  setLastTrashed: (id: string | null) => void
}

export const useTrashUndoStore = create<TrashUndoState>((set) => ({
  lastTrashedNoteId: null,
  setLastTrashed: (id) => set({ lastTrashedNoteId: id }),
}))
