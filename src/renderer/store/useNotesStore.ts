import { create } from 'zustand'
import type { Note } from '@shared/types'

interface NotesState {
  notes: Note[]
  activeNoteId: string | null
  view: 'all' | 'favorites' | 'recent' | 'trash' | 'tag'
  tagFilter: string | null
  searchQuery: string
  isLoading: boolean
  setNotes: (notes: Note[]) => void
  setActiveNoteId: (id: string | null) => void
  setView: (view: NotesState['view']) => void
  setTagFilter: (tag: string | null) => void
  setSearchQuery: (q: string) => void
  setLoading: (v: boolean) => void
  addNote: (note: Note) => void
  updateNoteInStore: (id: string, updates: Partial<Note>) => void
  removeNoteFromStore: (id: string) => void
  fetchNotes: (includeDeleted?: boolean) => Promise<void>
  getActiveNote: () => Note | null
  getFilteredNotes: () => Note[]
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  activeNoteId: null,
  view: 'all',
  tagFilter: null,
  searchQuery: '',
  isLoading: false,

  setNotes: (notes) => set({ notes }),
  setActiveNoteId: (activeNoteId) => set({ activeNoteId }),
  setView: (view) => set({ view }),
  setTagFilter: (tagFilter) => set({ tagFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLoading: (isLoading) => set({ isLoading }),
  addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
  updateNoteInStore: (id, updates) =>
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })),
  removeNoteFromStore: (id) =>
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

  fetchNotes: async (includeDeleted = false) => {
    set({ isLoading: true })
    try {
      const notes = await window.electronAPI.notes.getAll(includeDeleted)
      set({ notes, isLoading: false })
    } catch {
      set({ notes: [], isLoading: false })
    }
  },

  getActiveNote: () => {
    const { notes, activeNoteId } = get()
    if (!activeNoteId) return null
    return notes.find((n) => n.id === activeNoteId) ?? null
  },

  getFilteredNotes: () => {
    const { notes, view, tagFilter, searchQuery } = get()
    let list = notes.filter((n) => !n.isDeleted)
    if (view === 'favorites') list = list.filter((n) => n.isFavorite)
    if (view === 'trash') list = notes.filter((n) => Boolean(n.isDeleted))
    if (view === 'recent') {
      list = [...list].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ).slice(0, 20)
    }
    if (tagFilter) {
      list = list.filter((n) => n.tags.includes(tagFilter))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return list.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  },
}))
