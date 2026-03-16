import { create } from 'zustand'
import type { Note } from '@shared/types'

type Mode = 'set' | 'remove' | null

interface PasswordModalState {
  open: boolean
  mode: Mode
  note: Note | null
  /** Set modunda toolbar'dan açıldıysa editördeki güncel içerik */
  initialContent: string | null
  /** Editörden güncel içerik almak için (toolbar'dan açıldığında) */
  getContent: (() => string) | null
  openSet: (note: Note, initialContent?: string) => void
  openRemove: (note: Note) => void
  close: () => void
  setGetContent: (fn: (() => string) | null) => void
}

export const usePasswordModalStore = create<PasswordModalState>((set) => ({
  open: false,
  mode: null,
  note: null,
  initialContent: null,
  getContent: null,

  openSet: (note, initialContent) =>
    set({
      open: true,
      mode: 'set',
      note,
      initialContent: initialContent ?? null,
    }),

  openRemove: (note) =>
    set({
      open: true,
      mode: 'remove',
      note,
      initialContent: null,
    }),

  close: () =>
    set({
      open: false,
      mode: null,
      note: null,
      initialContent: null,
    }),

  setGetContent: (getContent) => set({ getContent }),
}))
