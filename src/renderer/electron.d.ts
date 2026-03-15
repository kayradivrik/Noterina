import type { Note, AppSettings } from '@shared/types'

export interface ElectronAPI {
  notes: {
    getAll: (includeDeleted?: boolean) => Promise<Note[]>
    getById: (id: string) => Promise<Note | null>
    create: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Note>
    update: (id: string, updates: Partial<Note>) => Promise<Note | null>
    delete: (id: string, permanent?: boolean) => Promise<boolean>
    toggleFavorite: (id: string) => Promise<Note | null>
    search: (query: string) => Promise<Note[]>
    exportNotes: (format: 'json' | 'markdown') => Promise<string>
    importNotes: (data: string, format: 'json') => Promise<{ imported: number; errors: string[] }>
  }
  settings: {
    get: () => Promise<AppSettings>
    set: (settings: Record<string, unknown>) => Promise<AppSettings>
  }
  storage: {
    info: () => Promise<{ notesCount: number; path: string }>
    openDataFolder: () => Promise<string>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
