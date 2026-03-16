import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import type { Note, NotesData, AppSettings } from '../shared/types'

const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'tr',
  fontSize: 'medium',
  autosave: true,
  autosaveDelayMs: 2000,
  defaultView: 'all',
  sortOrder: 'newest',
  compactList: false,
}

function getDataPath(): string {
  const userData = app.getPath('userData')
  return path.join(userData, 'notes-data')
}

function getNotesFilePath(): string {
  return path.join(getDataPath(), 'notes.json')
}

function getSettingsFilePath(): string {
  return path.join(getDataPath(), 'settings.json')
}

function getSupabaseConfigPath(): string {
  return path.join(getDataPath(), 'supabase-config.json')
}

export interface SupabaseConfig {
  url: string
  anonKey: string
}

function loadSupabaseConfig(): SupabaseConfig {
  ensureDataDir()
  const filePath = getSupabaseConfigPath()
  if (!fs.existsSync(filePath)) return { url: '', anonKey: '' }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const o = JSON.parse(raw) as { url?: string; anonKey?: string }
    return { url: String(o.url ?? '').trim(), anonKey: String(o.anonKey ?? '').trim() }
  } catch {
    return { url: '', anonKey: '' }
  }
}

function saveSupabaseConfig(config: SupabaseConfig): void {
  ensureDataDir()
  fs.writeFileSync(
    getSupabaseConfigPath(),
    JSON.stringify({ url: config.url.trim(), anonKey: config.anonKey.trim() }, null, 2),
    'utf-8'
  )
}

function ensureDataDir(): void {
  const dir = getDataPath()
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function normalizeLegacyLock(note: any): any {
  if (!note) return note
  if (note.isLocked && (note as any).passwordSalt && (note as any).contentIv) {
    const content = String(note.content ?? '')
    const looksPlain =
      content.startsWith('<p') ||
      content.startsWith('{') ||
      content.startsWith('[') ||
      content.length < 512
    if (looksPlain) {
      note.isLocked = false
      delete (note as any).passwordHash
      delete (note as any).passwordSalt
      delete (note as any).contentIv
    }
  }
  return note
}

function loadNotesRaw(): NotesData {
  ensureDataDir()
  const filePath = getNotesFilePath()
  if (!fs.existsSync(filePath)) {
    return { notes: [], version: 1 }
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw) as NotesData
    if (!Array.isArray(data.notes)) return { notes: [], version: 1 }
    const migratedNotes = data.notes.map((n) => normalizeLegacyLock({ ...n })) as Note[]
    return { notes: migratedNotes, version: data.version ?? 1 }
  } catch {
    return { notes: [], version: 1 }
  }
}

function saveNotesRaw(data: NotesData): void {
  ensureDataDir()
  fs.writeFileSync(getNotesFilePath(), JSON.stringify(data, null, 2), 'utf-8')
}

function loadSettings(): AppSettings {
  ensureDataDir()
  const filePath = getSettingsFilePath()
  if (!fs.existsSync(filePath)) {
    return { ...defaultSettings }
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return { ...defaultSettings, ...JSON.parse(raw) } as AppSettings
  } catch {
    return { ...defaultSettings }
  }
}

function saveSettings(settings: AppSettings): void {
  ensureDataDir()
  fs.writeFileSync(getSettingsFilePath(), JSON.stringify(settings, null, 2), 'utf-8')
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export const storage = {
  getNotes(includeDeleted: boolean): Note[] {
    const { notes } = loadNotesRaw()
    const normalized = notes.map((n) => ({ ...n, isDeleted: Boolean(n.isDeleted) }))
    if (includeDeleted) return normalized
    return normalized.filter((n) => !n.isDeleted)
  },

  getNoteById(id: string): Note | null {
    const { notes } = loadNotesRaw()
    const note = notes.find((n) => n.id === id) ?? null
    if (!note) return null
    return { ...note } as Note
  },

  createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
    const data = loadNotesRaw()
    const now = new Date().toISOString()
    const newNote: Note = {
      id: generateId(),
      title: note.title ?? 'Untitled',
      content: note.content ?? '',
      createdAt: now,
      updatedAt: now,
      tags: note.tags ?? [],
      isFavorite: note.isFavorite ?? false,
      isArchived: note.isArchived ?? false,
      isDeleted: note.isDeleted ?? false,
      icon: note.icon ?? undefined,
    }
    data.notes.push(newNote)
    saveNotesRaw(data)
    return newNote
  },

  updateNote(id: string, updates: Partial<Note>): Note | null {
    const data = loadNotesRaw()
    const index = data.notes.findIndex((n) => n.id === id)
    if (index === -1) return null
    const note = data.notes[index]
    const updatedAt = new Date().toISOString()
    const allowed = [
      'title',
      'content',
      'tags',
      'isFavorite',
      'isArchived',
      'isDeleted',
      'icon',
      'isLocked',
      'lockPassword',
    ] as const
    for (const key of allowed) {
      if (key in updates) {
        ;(note as unknown as Record<string, unknown>)[key] = updates[key]
      }
    }
    note.updatedAt = updatedAt
    saveNotesRaw(data)
    return note
  },

  deleteNote(id: string, permanent: boolean): boolean {
    const data = loadNotesRaw()
    const index = data.notes.findIndex((n) => n.id === id)
    if (index === -1) return false
    if (permanent) {
      data.notes.splice(index, 1)
    } else {
      data.notes[index].isDeleted = true
      data.notes[index].updatedAt = new Date().toISOString()
    }
    saveNotesRaw(data)
    return true
  },

  toggleFavorite(id: string): Note | null {
    const data = loadNotesRaw()
    const note = data.notes.find((n) => n.id === id)
    if (!note) return null
    note.isFavorite = !note.isFavorite
    note.updatedAt = new Date().toISOString()
    saveNotesRaw(data)
    return note
  },

  searchNotes(query: string): Note[] {
    const { notes } = loadNotesRaw()
    const q = query.toLowerCase().trim()
    if (!q) return notes.filter((n) => !n.isDeleted)
    return notes.filter(
      (n) =>
        !n.isDeleted &&
        (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q)))
    )
  },

  exportNotes(format: 'json' | 'markdown'): string {
    const notes = this.getNotes(false)
    if (format === 'json') {
      return JSON.stringify({ notes, exportedAt: new Date().toISOString() }, null, 2)
    }
    return notes
      .map(
        (n) =>
          `# ${n.title}\n\n${n.content}\n\n---\n`
      )
      .join('\n')
  },

  importNotes(data: string, _format: 'json'): { imported: number; errors: string[] } {
    const errors: string[] = []
    let imported = 0
    try {
      const parsed = JSON.parse(data) as { notes?: Note[] }
      const toImport = Array.isArray(parsed.notes) ? parsed.notes : []
      const noteData = loadNotesRaw()
      for (const n of toImport) {
        try {
          const newNote: Note = {
            id: generateId(),
            title: n.title ?? 'Imported',
            content: n.content ?? '',
            createdAt: n.createdAt ?? new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: Array.isArray(n.tags) ? n.tags : [],
            isFavorite: Boolean(n.isFavorite),
            isArchived: Boolean(n.isArchived),
            isDeleted: false,
          }
          noteData.notes.push(newNote)
          imported++
        } catch (e) {
          errors.push(String(e))
        }
      }
      if (imported > 0) saveNotesRaw(noteData)
    } catch (e) {
      errors.push(String(e))
    }
    return { imported, errors }
  },

  getSettings(): AppSettings {
    return loadSettings()
  },

  setSettings(updates: Record<string, unknown>): AppSettings {
    const current = loadSettings()
    const next = { ...current, ...updates } as AppSettings
    saveSettings(next)
    return next
  },

  getStorageInfo(): { notesCount: number; path: string } {
    const { notes } = loadNotesRaw()
    const active = notes.filter((n) => !n.isDeleted).length
    return { notesCount: active, path: getDataPath() }
  },

  getSupabaseConfig(): SupabaseConfig {
    return loadSupabaseConfig()
  },

  setSupabaseConfig(config: SupabaseConfig): void {
    saveSupabaseConfig(config)
  },

  /** Buluttan çekilen notlarla yerel dosyayı tamamen değiştirir (sync için). */
  replaceAllNotes(notes: Note[]): void {
    ensureDataDir()
    const data: NotesData = {
      notes: notes.map((n) => ({
        ...n,
        id: n.id,
        title: n.title ?? 'Untitled',
        content: n.content ?? '',
        createdAt: n.createdAt ?? new Date().toISOString(),
        updatedAt: n.updatedAt ?? new Date().toISOString(),
        tags: Array.isArray(n.tags) ? n.tags : [],
        isFavorite: Boolean(n.isFavorite),
        isArchived: Boolean(n.isArchived),
        isDeleted: Boolean(n.isDeleted),
        icon: n.icon,
      })),
      version: 1,
    }
    saveNotesRaw(data)
  },
}
