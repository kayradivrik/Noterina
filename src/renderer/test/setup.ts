import { vi } from 'vitest'

// Mock electronAPI so code that uses window.electronAPI doesn't crash in tests
const mockElectronAPI = {
  notes: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(null),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(true),
    toggleFavorite: vi.fn().mockResolvedValue(null),
    search: vi.fn().mockResolvedValue([]),
    exportNotes: vi.fn().mockResolvedValue(''),
    importNotes: vi.fn().mockResolvedValue({ imported: 0, errors: [] }),
  },
  settings: { get: vi.fn().mockResolvedValue({}), set: vi.fn().mockResolvedValue({}) },
  storage: { info: vi.fn().mockResolvedValue({ notesCount: 0, path: '' }), openDataFolder: vi.fn().mockResolvedValue('') },
  supabase: { getConfig: vi.fn().mockResolvedValue({ url: '', anonKey: '' }), setConfig: vi.fn().mockResolvedValue(undefined) },
}

if (typeof globalThis.window !== 'undefined') {
  (globalThis.window as unknown as { electronAPI: typeof mockElectronAPI }).electronAPI = mockElectronAPI
} else {
  vi.stubGlobal('window', { electronAPI: mockElectronAPI })
}
